import { normalizeSlug } from '../blog-helpers'
import notion from './client'
import { BLOG_INDEX_ID } from './server-constants'

const getPlainText = (richText: any[] = []) =>
  richText.map((item) => item?.plain_text || '').join('')

const getTitle = (properties: Record<string, any>) => {
  const titleProp = Object.values(properties).find(
    (prop: any) => prop?.type === 'title'
  ) as any
  return titleProp ? getPlainText(titleProp.title) : ''
}

const getRichText = (prop: any) =>
  prop?.type === 'rich_text' ? getPlainText(prop.rich_text) : ''

const getDateValue = (prop: any) =>
  prop?.type === 'date' && prop.date?.start
    ? new Date(prop.date.start).getTime()
    : null

const getCheckboxOrSelect = (prop: any) => {
  if (!prop) return null
  if (prop.type === 'checkbox') return prop.checkbox
  if (prop.type === 'select') return prop.select?.name || null
  if (prop.type === 'status') return prop.status?.name || null
  return null
}

const getPeople = (prop: any) =>
  prop?.type === 'people'
    ? prop.people.map((person: any) => person?.name).filter(Boolean)
    : []

const mapPageToPost = (page: any) => {
  const props = page.properties || {}

  const title = getTitle(props)
  const slugProp = props.Slug || props.slug
  const publishedProp = props.Published || props.published || props.Status
  const dateProp = props.Date || props.date || props.PublishedDate
  const descriptionProp = props.Description || props.Summary || props.Excerpt
  const authorsProp = props.Authors || props.Author || props.author

  const slug =
    normalizeSlug(getRichText(slugProp)) || normalizeSlug(title || page.id)

  const published = getCheckboxOrSelect(publishedProp)
  const date = getDateValue(dateProp)
  const description = getRichText(descriptionProp)
  const authors = [
    ...getPeople(authorsProp),
    ...getRichText(authorsProp)
      .split(',')
      .map((name) => name.trim()),
  ].filter(Boolean)

  return {
    id: page.id,
    Page: title,
    Slug: slug,
    Published: published,
    Date: date,
    Description: description || null,
    Authors: authors,
  }
}

export default async function getBlogIndex(previews = true) {
  if (!BLOG_INDEX_ID) {
    throw new Error('BLOG_INDEX_ID is not set in env')
  }

  const postsTable: Record<string, any> = {}
  let cursor: string | undefined
  const results: any[] = []

  do {
    const response = await notion.databases.query({
      database_id: BLOG_INDEX_ID,
      start_cursor: cursor,
      page_size: 100,
    })
    results.push(...response.results)
    cursor = response.next_cursor || undefined
  } while (cursor)

  for (const page of results) {
    const post = mapPageToPost(page)
    if (post.Slug) {
      postsTable[post.Slug] = post
    }
  }

  const postsKeys = Object.keys(postsTable)

  if (previews && postsKeys.length > 0) {
    // preview text disabled
  }

  return postsTable
}
