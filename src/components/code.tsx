import Prism from 'prismjs'
import 'prismjs/components/prism-jsx'

const Code = ({ children, language = 'javascript' }) => {
  return (
    <>
      <pre>
        <code
          dangerouslySetInnerHTML={{
            __html: Prism.highlight(
              children,
              Prism.languages[language.toLowerCase()] ||
                Prism.languages.javascript
            ),
          }}
        />
      </pre>

      <style jsx>{`
        pre {
          tab-size: 2;
        }

        code {
          overflow: auto;
          display: block;
          padding: 0.8rem;
          line-height: 1.5;
          background: #f1f1f1;
          font-size: 0.75rem;
          border: 2px solid #4a4a4a;
          box-shadow: inset 1px 1px 0 #ffffff,
            inset -1px -1px 0 #808080;
        }
      `}</style>
    </>
  )
}

export default Code
