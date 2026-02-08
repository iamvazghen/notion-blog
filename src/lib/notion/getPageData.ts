import notion from './client'

const listBlockChildren = async (blockId: string) => {
  const blocks: any[] = []
  let cursor: string | undefined

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    })
    blocks.push(...response.results)
    cursor = response.next_cursor || undefined
  } while (cursor)

  for (const block of blocks) {
    if (block.has_children) {
      block.children = await listBlockChildren(block.id)
    }
  }

  return blocks
}

export default async function getPageData(pageId: string) {
  const blocks = await listBlockChildren(pageId)
  return { blocks }
}
