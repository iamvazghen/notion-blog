import RetroIcon from './retro-icon'

const features = [
  {
    text: 'Blazing fast',
    icon: 'lightning',
  },
  {
    text: 'JAMstack based',
    icon: 'jamstack',
  },
  {
    text: 'Always available',
    icon: 'wifi',
  },
  {
    text: 'Customizable',
    icon: 'edit',
  },
  {
    text: 'Incremental SSG',
    icon: 'plus',
  },
  {
    text: 'MIT Licensed',
    icon: 'scroll',
  },
  {
    text: 'Edit via Notion',
    icon: 'notion',
  },
  {
    text: 'Great scores',
    icon: 'lighthouse',
  },
]

const Features = () => (
  <div className="features">
    {features.map(({ text, icon }) => (
      <div className="feature" key={text}>
        <RetroIcon name={icon} size={18} className="feature-icon" />
        <h4>{text}</h4>
      </div>
    ))}
  </div>
)

export default Features
