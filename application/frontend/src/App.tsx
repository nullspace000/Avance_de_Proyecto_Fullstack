import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Menu from './components/Menu'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
          <Menu />
          <h1 className="text-3xl font-bold underline" >Hello Vite + React!</h1>
      </div>
    </>
  )
}

export default App
