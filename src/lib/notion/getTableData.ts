import { values } from './rpc'
import Slugger from 'github-slugger'
import queryCollection from './queryCollection'
import { normalizeSlug } from '../blog-helpers'

export default async function loadTable(collectionBlock: any, isPosts = false) {
  const slugger = new Slugger()

  const { value } = collectionBlock
  let table: any = {}
  const col = await queryCollection({
    collectionId: value.collection_id,
    collectionViewId: value.view_ids[0],
  })
  const entries = values(col.recordMap.block).filter((block: any) => {
    return block.value && block.value.parent_id === value.collection_id
  })

  const colId = Object.keys(col.recordMap.collection)[0]
  const schema = col.recordMap.collection[colId].value.schema
  const schemaKeys = Object.keys(schema)

  for (const entry of entries) {
    const props = entry.value && entry.value.properties
    const row: any = {}

    if (!props) continue
    if (entry.value.content) {
      row.id = entry.value.id
    }

    schemaKeys.forEach((key) => {
      // might be undefined
      let val = props[key] && props[key][0] && props[key][0][0]
      const hasType = props[key] && props[key][0] && props[key][0][1]

      // authors and blocks are centralized
      if (hasType) {
        const type = props[key][0][1][0]

        switch (type[0]) {
          case 'a': // link
            val = type[1]
            break
          case 'u': // user
            val = props[key]
              .map((arr: any[]) => {
                const token = arr && arr[1] && arr[1][0]
                if (token && token[0] === 'u') return token[1]
                if (typeof arr?.[0] === 'string') return arr[0]
                return null
              })
              .filter(Boolean)
            break
          case 'p': // page (block)
            const page = col.recordMap.block[type[1]]
            row.id = page.value.id
            val = page.value.properties.title[0][0]
            break
          case 'd': // date
            // start_date: 2019-06-18
            // start_time: 07:00
            // time_zone: Europe/Berlin, America/Los_Angeles

            if (!type[1].start_date) {
              break
            }
            // initial with provided date
            const providedDate = new Date(
              type[1].start_date + ' ' + (type[1].start_time || '')
            ).getTime()

            // calculate offset from provided time zone
            const timezoneOffset =
              new Date(
                new Date().toLocaleString('en-US', {
                  timeZone: type[1].time_zone,
                })
              ).getTime() - new Date().getTime()

            // initialize subtracting time zone offset
            val = new Date(providedDate - timezoneOffset).getTime()
            break
          default:
            console.error('unknown type', type[0], type)
            break
        }
      }

      if (!hasType && Array.isArray(props[key])) {
        const values = props[key]
          .map((arr: any[]) => (typeof arr?.[0] === 'string' ? arr[0] : null))
          .filter(Boolean)
        if (values.length > 1) val = values
        else if (values.length === 1) val = values[0]
      }

      if (typeof val === 'string') {
        val = val.trim()
      }
      row[schema[key].name] = val || null
    })

    // auto-generate slug from title
    row.Slug = normalizeSlug(row.Slug || slugger.slug(row.Page || ''))

    const key = row.Slug
    if (isPosts && !key) continue

    if (key) {
      table[key] = row
    } else {
      if (!Array.isArray(table)) table = []
      table.push(row)
    }
  }
  return table
}
