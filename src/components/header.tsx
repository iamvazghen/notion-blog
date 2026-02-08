import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/header.module.css'
import RetroIcon from './retro-icon'

const navItems: { label: string; page: string }[] = [
  { label: 'Home', page: '/' },
]

const ogImageUrl = 'https://notion-blog.now.sh/og-image.png'

const Header = ({ titlePre = '' }) => {
  const { pathname } = useRouter()

  return (
    <header className={styles.header}>
      <Head>
        <title>{titlePre ? `${titlePre} |` : ''} My Blog</title>
        <meta
          name="description"
          content="Vazghen Vardanian Next.js blog site using Notion for the blog"
        />
        <meta name="og:title" content="My Blog" />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:site" content="@_ijjk" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>
      <div className={styles.bar}>
        <div className={styles.brand}>
          <span>My Blog</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map(({ label, page }) => {
            const active =
              page &&
              (pathname === page || (page === '/blog' && pathname === '/'))
            const iconName = label.toLowerCase().includes('home')
              ? 'home'
              : 'blog'
            return (
              <Link key={label} href={page} className={styles.navLink}>
                <span
                  className={`${styles.navButton} ${
                    active ? styles.navButtonActive : ''
                  }`}
                >
                  <RetroIcon name={iconName} size={16} />
                  {label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export default Header
