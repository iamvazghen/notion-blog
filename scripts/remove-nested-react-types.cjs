const fs = require('fs')
const path = require('path')

const nestedTypes = [
  'node_modules/react-jsx-parser/node_modules/@types/react',
  'node_modules/react-jsx-parser/node_modules/@types/react-dom',
]

for (const relPath of nestedTypes) {
  const fullPath = path.join(process.cwd(), relPath)
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true })
    // eslint-disable-next-line no-console
    console.log(`Removed nested types: ${relPath}`)
  }
}
