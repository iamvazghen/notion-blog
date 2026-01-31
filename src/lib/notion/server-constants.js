// use commonjs so it can be required without transpiling
const path = require('path')

const normalizeId = (id) => {
  if (!id) return id
  // Be tolerant of env formatting (whitespace, quotes, or hyphenated IDs)
  let cleaned = String(id).trim()
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim()
  }
  const compact = cleaned.replace(/-/g, '')
  if (cleaned.length === 36 && compact.length === 32) return cleaned
  if (compact.length !== 32) {
    throw new Error(
      `Invalid blog-index-id: ${id} should be 32 characters long. Info here https://github.com/ijjk/notion-blog#getting-blog-index-and-token`
    )
  }
  return `${compact.substr(0, 8)}-${compact.substr(8, 4)}-${compact.substr(
    12,
    4
  )}-${compact.substr(16, 4)}-${compact.substr(20)}`
}

const NOTION_TOKEN = process.env.NOTION_TOKEN
const BLOG_INDEX_ID = normalizeId(process.env.BLOG_INDEX_ID)
const API_ENDPOINT = 'https://www.notion.so/api/v3'
const BLOG_INDEX_CACHE = path.resolve('.blog_index_data')

module.exports = {
  NOTION_TOKEN,
  BLOG_INDEX_ID,
  API_ENDPOINT,
  BLOG_INDEX_CACHE,
  normalizeId,
}
