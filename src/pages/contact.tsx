import Header from '../components/header'
import ExtLink from '../components/ext-link'

import sharedStyles from '../styles/shared.module.css'
import contactStyles from '../styles/contact.module.css'

import RetroIcon from '../components/retro-icon'

const contacts = [
  {
    icon: 'twitter',
    alt: 'twitter icon',
    link: 'https://twitter.com/_ijjk',
  },
  {
    icon: 'github',
    alt: 'github icon',
    link: 'https://github.com/ijjk',
  },
  {
    icon: 'linkedin',
    alt: 'linkedin icon',
    link: 'https://www.linkedin.com/in/jj-kasper-0b5392166/',
  },
  {
    icon: 'contact',
    alt: 'envelope icon',
    link: 'mailto:jj@jjsweb.site?subject=Notion Blog',
  },
]

export default function Contact() {
  return (
    <>
      <Header titlePre="Contact" />
      <div className={sharedStyles.layout}>
        <div className={contactStyles.avatar}>
          <img src="/avatar.png" alt="avatar with letters JJ" height={60} />
        </div>

        <h1 style={{ marginTop: 0 }}>Contact</h1>

        <div className={contactStyles.name}>
          JJ Kasper - Next.js Engineer @{' '}
          <ExtLink href="https://vercel.com">Vercel</ExtLink>
        </div>

        <div className={contactStyles.links}>
          {contacts.map(({ icon, link, alt }) => {
            return (
              <ExtLink key={link} href={link} aria-label={alt}>
                <span className={contactStyles.iconButton}>
                  <RetroIcon name={icon} size={20} />
                </span>
              </ExtLink>
            )
          })}
        </div>
      </div>
    </>
  )
}
