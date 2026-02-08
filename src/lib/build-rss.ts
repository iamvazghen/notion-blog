import { resolve } from 'path'
import { writeFile } from './fs-helpers'
import { postIsPublished, getBlogLink } from './blog-helpers'
import { loadEnvConfig } from '@next/env'

// must use weird syntax to bypass auto replacing of NODE_ENV
process.env['NODE' + '_ENV'] = 'production'
process.env.USE_CACHE = 'true'

// constants
const NOW = new Date().toJSON()

function mapToAuthor(author) {
  return `<author><name>${decode(String(author))}</name></author>`
}

function decode(string) {
  return string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function mapToEntry(post) {
  const previewText = post.previewText || post.Description || post.Summary || ''
  const content = previewText ? `<p>${decode(previewText)}</p>` : ''
  return `
    <entry>
      <id>${post.link}</id>
      <title>${decode(post.title)}</title>
      <link href="${post.link}"/>
      <updated>${new Date(post.date).toJSON()}</updated>
      <content type="xhtml">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${content}
          <p class="more">
            <a href="${post.link}">Read more</a>
          </p>
        </div>
      </content>
      ${(post.authors || []).map(mapToAuthor).join('\n      ')}
    </entry>`
}

function concat(total, item) {
  return total + item
}

function createRSS(blogPosts = []) {
  const postsString = blogPosts.map(mapToEntry).reduce(concat, '')

  return `<?xml version="1.0" encoding="utf-8"?>
  <feed xmlns="http://www.w3.org/2005/Atom">
    <title>My Blog</title>
    <subtitle>Blog</subtitle>
    <link href="/atom" rel="self" type="application/rss+xml"/>
    <link href="/" />
    <updated>${NOW}</updated>
    <id>My Blog</id>${postsString}
  </feed>`
}

async function main() {
  await loadEnvConfig(process.cwd())
  const { default: getBlogIndex } = await import('./notion/getBlogIndex')
  const postsTable = await getBlogIndex(true)

  const blogPosts = Object.keys(postsTable)
    .map((slug) => {
      const post = postsTable[slug]
      if (!postIsPublished(post)) return

      post.authors = post.Authors || []
      return post
    })
    .filter(Boolean)
    .map((post) => {
      post.link = getBlogLink(post.Slug)
      post.title = post.Page
      post.date = post.Date || new Date().toISOString()
      return post
    })

  const outputPath = './public/atom'
  await writeFile(resolve(outputPath), createRSS(blogPosts))
  console.log(`Atom feed file generated at \`${outputPath}\``)
}

main().catch((error) => console.error(error))
