import Link from 'next/link'
import Header from '../components/header'
import RetroIcon from '../components/retro-icon'
import { getBlogLink, getDateStr, postIsPublished } from '../lib/blog-helpers'
import getBlogIndex from '../lib/notion/getBlogIndex'
import blogStyles from '../styles/blog.module.css'
import sharedStyles from '../styles/shared.module.css'

type PostAuthor = string | null
type Post = {
  Authors?: PostAuthor[] | PostAuthor
  Author?: PostAuthor[] | PostAuthor
  Published?: string | boolean
  Slug?: string
  Page?: string
  Description?: string
  Summary?: string
  Excerpt?: string
  Date?: string
  preview?: unknown[]
  [key: string]: unknown
}

export async function getStaticProps({ preview }) {
  const postsTable = await getBlogIndex()

  const posts: Post[] = Object.keys(postsTable)
    .map((slug) => {
      const post = postsTable[slug] as Post
      // remove draft posts in production
      if (!preview && !postIsPublished(post)) {
        return null
      }
      return post
    })
    .filter(Boolean) as Post[]

  return {
    props: {
      preview: preview || false,
      posts,
    },
    revalidate: 10,
  }
}

const Index = ({ posts = [], preview }) => {
  return (
    <>
      <Header titlePre="Blog" />
      {preview && (
        <div className={blogStyles.previewAlertContainer}>
          <div className={blogStyles.previewAlert}>
            <b>
              <RetroIcon name="info" size={14} /> Note:
            </b>
            {` `}Viewing in preview mode{' '}
            <Link href={`/api/clear-preview`}>
              <button className={blogStyles.escapePreview} type="button">
                Exit Preview
              </button>
            </Link>
          </div>
        </div>
      )}
      <div className={`${sharedStyles.layout} ${blogStyles.blogIndex}`}>
        <h1>My Blog</h1>
        {posts.length === 0 && (
          <p className={blogStyles.noPosts}>There are no posts yet</p>
        )}
        {posts.map((post) => {
          return (
            <div className={blogStyles.postPreview} key={post.Slug}>
              <h3>
                <span className={blogStyles.titleContainer}>
                  {!post.Published && (
                    <span className={blogStyles.draftBadge}>Draft</span>
                  )}
                  <Link
                    href="/blog/[slug]"
                    as={getBlogLink(post.Slug as string)}
                    legacyBehavior
                  >
                    <a href={getBlogLink(post.Slug as string)}>
                      {post.Page || post.Slug}
                    </a>
                  </Link>
                </span>
              </h3>
              <div className="authors">By: Vazghen Vardanian</div>
              {post.Date && (
                <div className="posted">Posted: {getDateStr(post.Date)}</div>
              )}
              <div className="posted">Slug: {post.Slug}</div>
              <div className="posted">
                Published:{' '}
                {post.Published === 'Yes' || post.Published === true
                  ? 'Yes'
                  : 'No'}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default Index
