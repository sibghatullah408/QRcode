import './Sidebar.css'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/rooms' },
  { label: 'Floors', to: '/rooms' },
  { label: 'Rooms', to: '/rooms' },
  { label: 'Print QR Codes', to: '/print-qr-codes' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebarNav">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            className={({ isActive }) => (isActive ? 'sidebarLink sidebarLinkActive' : 'sidebarLink')}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
