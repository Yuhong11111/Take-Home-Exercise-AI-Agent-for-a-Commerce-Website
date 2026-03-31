import { Route, Routes } from 'react-router-dom'
import Browse from './pages/Broswe'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Browse />} />
    </Routes>
  )
}
