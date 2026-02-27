import Sidebar from './components/Sidebar.jsx'
import RoomOverviewPage from './pages/RoomOverviewPage.jsx'
import PrintQrCodesPage from './pages/PrintQrCodesPage.jsx'
import RoomDetailPage from './pages/RoomDetailPage.jsx'
import './styles/appShell.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <div className="appShell">
        <Sidebar />
        <main className="appMain">
          <Routes>
            <Route path="/" element={<RoomOverviewPage />} />
            <Route path="/rooms" element={<RoomOverviewPage />} />
            <Route path="/print-qr-codes" element={<PrintQrCodesPage />} />
            <Route path="/room/:id" element={<RoomDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
