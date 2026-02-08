import { useState } from 'react'

const Counter = ({ initialValue }) => {
  const [clicks, setClicks] = useState(initialValue)

  return (
    <div style={{ margin: '10px 0 20px' }}>
      <p>Count: {clicks}</p>
      <button type="button" onClick={() => setClicks(clicks + 1)}>
        increase count
      </button>
      <button type="button" onClick={() => setClicks(clicks - 1)}>
        decrease count
      </button>
    </div>
  )
}

export default Counter
