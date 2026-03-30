import { Link, Route, Routes } from 'react-router-dom'
import Browse from './pages/Broswe.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Browse />} />
    </Routes>
  )
}
