import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment, useEffect } from 'react'
import type { ReactNode } from 'react'
import Header from '../../components/header'
import components from '../../components/dynamic'
import RetroIcon from '../../components/retro-icon'
import {
  getBlogLink,
  getDateStr,
  postIsPublished,
} from '../../lib/blog-helpers'
import getBlogIndex from '../../lib/notion/getBlogIndex'
import getPageData from '../../lib/notion/getPageData'
import blogStyles from '../../styles/blog.module.css'

// Get the data for each blog post
export async function getStaticProps({ params: { slug }, preview }) {
  try {
    // load the postsTable so that we can get the page's ID
    const postsTable = await getBlogIndex()
    const post = postsTable[slug]

    // if we can't find the post or if it is unpublished and
    // viewed without preview mode then we just redirect to /blog
    if (!post || (!postIsPublished(post) && !preview)) {
      console.log(`Failed to find post for slug: ${slug}`)
      return {
        props: {
          redirect: '/blog',
          preview: false,
        },
        revalidate: 5,
      }
    }
    const postData = await getPageData(post.id)
    post.content = postData.blocks

    return {
      props: {
        post,
        preview: preview || false,
      },
      revalidate: 10,
    }
  } catch {
    console.warn(`Failed to build post for slug: ${slug}`)
    return {
      props: {
        redirect: '/blog',
        preview: false,
      },
      revalidate: 5,
    }
  }
}

// Return our list of blog posts to prerender
export async function getStaticPaths() {
  const postsTable = await getBlogIndex()
  // we fallback for any unpublished posts to save build time
  // for actually published ones
  return {
    paths: Object.keys(postsTable)
      .filter((post) => postIsPublished(postsTable[post]))
      .map((slug) => getBlogLink(slug)),
    fallback: true,
  }
}

const RenderPost = ({ post, redirect, preview }) => {
  const router = useRouter()

  useEffect(() => {
    if (redirect && !post) {
      router.replace(redirect)
    }
  }, [redirect, post, router])

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  // if you don't have a post at this point, and are not
  // loading one from fallback then  redirect back to the index
  if (!post) {
    return (
      <div className={blogStyles.post}>
        <p>
          Woops! didn't find that post, redirecting you back to the blog index
        </p>
      </div>
    )
  }

  type RichTextItem = {
    plain_text?: string
    annotations?: {
      code?: boolean
      bold?: boolean
      italic?: boolean
      strikethrough?: boolean
      underline?: boolean
    }
    href?: string
  }

  type NotionBlock = {
    id: string
    type: string
    has_children?: boolean
    children?: NotionBlock[]
    [key: string]: unknown
  }

  const getPlainText = (richText: RichTextItem[] = []) =>
    richText.map((item) => item?.plain_text || '').join('')

  const renderRichText = (richText: RichTextItem[] = []) =>
    richText.map((item, idx) => {
      const text = item?.plain_text || ''
      const annotations = item?.annotations || {}
      let node: ReactNode = text

      if (item?.href) {
        node = (
          <a href={item.href} target="_blank" rel="noopener noreferrer">
            {node}
          </a>
        )
      }
      if (annotations.code) node = <code>{node}</code>
      if (annotations.bold) node = <strong>{node}</strong>
      if (annotations.italic) node = <em>{node}</em>
      if (annotations.strikethrough) node = <del>{node}</del>
      if (annotations.underline)
        node = <span className="underline">{node}</span>

      return (
        <Fragment key={`${item?.plain_text || 'rt'}-${idx}`}>{node}</Fragment>
      )
    })

  const renderBlocks = (blocks: NotionBlock[] = []) => {
    const output: ReactNode[] = []

    const renderBlock = (block: NotionBlock) => {
      const type = block.type
      const value = block[type] as Record<string, unknown> | undefined
      const children = block.children ? renderBlocks(block.children) : null

      switch (type) {
        case 'paragraph':
          return (
            <p key={block.id}>
              {renderRichText((value?.rich_text as RichTextItem[]) || [])}
            </p>
          )
        case 'heading_1':
          return (
            <h1 key={block.id}>
              {renderRichText((value?.rich_text as RichTextItem[]) || [])}
            </h1>
          )
        case 'heading_2':
          return (
            <h2 key={block.id}>
              {renderRichText((value?.rich_text as RichTextItem[]) || [])}
            </h2>
          )
        case 'heading_3':
          return (
            <h3 key={block.id}>
              {renderRichText((value?.rich_text as RichTextItem[]) || [])}
            </h3>
          )
        case 'quote':
          return (
            <blockquote key={block.id}>
              {renderRichText((value?.rich_text as RichTextItem[]) || [])}
            </blockquote>
          )
        case 'callout': {
          const icon = value?.icon as
            | { type?: string; emoji?: string; external?: { url?: string } }
            | undefined
          const iconNode =
            icon?.type === 'emoji' ? (
              icon.emoji
            ) : icon?.type === 'external' ? (
              <img src={icon.external?.url} alt="" />
            ) : null
          return (
            <div className="callout" key={block.id}>
              {iconNode && <div>{iconNode}</div>}
              <div className="text">
                {renderRichText((value?.rich_text as RichTextItem[]) || [])}
              </div>
            </div>
          )
        }
        case 'divider':
          return <hr key={block.id} />
        case 'image': {
          const url =
            value?.type === 'file'
              ? (value?.file as { url?: string })?.url
              : (value?.external as { url?: string })?.url
          const caption = getPlainText((value?.caption as RichTextItem[]) || [])
          return (
            <img key={block.id} src={url} alt={caption || 'Notion image'} />
          )
        }
        case 'video': {
          const url =
            value?.type === 'file'
              ? (value?.file as { url?: string })?.url
              : (value?.external as { url?: string })?.url
          if (value?.type === 'external') {
            return (
              <iframe
                key={block.id}
                src={url}
                title="Embedded video"
                className="asset-wrapper"
              />
            )
          }
          return (
            <video key={block.id} src={url} controls className="asset-wrapper">
              <track kind="captions" src="" srcLang="en" label="Captions" />
            </video>
          )
        }
        case 'embed': {
          const url = value?.url as string | undefined
          return (
            <iframe
              key={block.id}
              src={url}
              title="Embedded content"
              className="asset-wrapper"
            />
          )
        }
        case 'bookmark': {
          const url = value?.url as string | undefined
          return (
            <div className={blogStyles.bookmark} key={block.id}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            </div>
          )
        }
        case 'code': {
          const codeText = getPlainText(
            (value?.rich_text as RichTextItem[]) || []
          )
          return (
            <components.Code
              key={block.id}
              language={(value?.language as string) || ''}
            >
              {codeText}
            </components.Code>
          )
        }
        case 'equation': {
          const expression = (value?.expression as string) || ''
          return (
            <components.Equation key={block.id} displayMode={true}>
              {expression}
            </components.Equation>
          )
        }
        case 'to_do': {
          return (
            <div key={block.id}>
              <input type="checkbox" checked={!!value?.checked} readOnly />{' '}
              {renderRichText((value?.rich_text as RichTextItem[]) || [])}
            </div>
          )
        }
        case 'toggle': {
          return (
            <details key={block.id}>
              <summary>
                {renderRichText((value?.rich_text as RichTextItem[]) || [])}
              </summary>
              {children}
            </details>
          )
        }
        case 'bulleted_list_item':
        case 'numbered_list_item':
          // handled by list grouping
          return null
        default:
          return null
      }
    }

    let i = 0
    while (i < blocks.length) {
      const block = blocks[i]
      const type = block.type
      if (type === 'bulleted_list_item' || type === 'numbered_list_item') {
        const items: ReactNode[] = []
        const listType = type
        while (i < blocks.length && blocks[i].type === listType) {
          const item = blocks[i]
          const itemValue = item[listType] as
            | Record<string, unknown>
            | undefined
          const itemChildren = item.children
            ? renderBlocks(item.children)
            : null
          items.push(
            <li key={item.id}>
              {renderRichText((itemValue?.rich_text as RichTextItem[]) || [])}
              {itemChildren && <div>{itemChildren}</div>}
            </li>
          )
          i += 1
        }
        if (listType === 'bulleted_list_item') {
          output.push(<ul key={`list-${block.id}`}>{items}</ul>)
        } else {
          output.push(<ol key={`list-${block.id}`}>{items}</ol>)
        }
        continue
      }
      const rendered = renderBlock(block)
      if (rendered) output.push(rendered)
      i += 1
    }

    return output
  }

  return (
    <>
      <Header titlePre={post.Page} />
      {preview && (
        <div className={blogStyles.previewAlertContainer}>
          <div className={blogStyles.previewAlert}>
            <b>
              <RetroIcon name="info" size={14} /> Note:
            </b>
            {` `}Viewing in preview mode{' '}
            <Link href={`/api/clear-preview?slug=${post.Slug}`}>
              <button className={blogStyles.escapePreview} type="button">
                Exit Preview
              </button>
            </Link>
          </div>
        </div>
      )}
      <div className={blogStyles.post}>
        <h1>{post.Page || ''}</h1>
        <div className="authors">By: Vazghen Vardanian</div>
        {post.Date && (
          <div className="posted">Posted: {getDateStr(post.Date)}</div>
        )}
        <div className="posted">Slug: {post.Slug}</div>
        <div className="posted">
          Published:{' '}
          {post.Published === 'Yes' || post.Published === true ? 'Yes' : 'No'}
        </div>

        <hr />

        {(!post.content || post.content.length === 0) && (
          <p>This post has no content</p>
        )}

        {renderBlocks(post.content || [])}
      </div>
    </>
  )
}

export default RenderPost
