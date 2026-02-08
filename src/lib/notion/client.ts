import { Client } from '@notionhq/client'

const normalizeToken = (token?: string) => {
  if (!token) return token
  let cleaned = String(token).trim()
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim()
  }
  if (cleaned.includes('%')) {
    try {
      cleaned = decodeURIComponent(cleaned)
    } catch (_) {
      // keep original token if decode fails
    }
  }
  return cleaned
}

const NOTION_TOKEN = normalizeToken(process.env.NOTION_TOKEN)

if (!NOTION_TOKEN) {
  throw new Error('NOTION_TOKEN is not set in env')
}

const notion = new Client({
  auth: NOTION_TOKEN,
})

export default notion
