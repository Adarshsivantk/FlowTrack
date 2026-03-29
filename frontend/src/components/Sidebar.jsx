import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FiHome, FiUsers, FiFolder, FiCheckSquare,
  FiSettings, FiLogOut, FiUser, FiMenu, FiX, FiPlus,
} from 'react-icons/fi'

function SidebarLink({ to, icon: Icon, children, onClick, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={(e) => {
        e.stopPropagation()
        if (onClick) onClick()
      }}
      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
    >
      <Icon size={18} /> {children}
    </NavLink>
  )
}

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  const handleLogout = () => {
    close()
    logout()
    navigate('/login')
  }

  const handleNavClick = (path) => {
    close()
    if (location.pathname !== path) navigate(path)
  }

  return (
    <>
      <button className="mobile-toggle" onClick={() => setOpen((p) => !p)}>
        {open ? <FiX /> : <FiMenu />}
      </button>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div
          className="sidebar-logo"
          onClick={() => handleNavClick('/dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <h2>FlowTrack</h2>
          <p>Project Management</p>
        </div>

        <div className="sidebar-user">
          <div className="avatar" style={{ background: 'rgba(255,255,255,0.2)' }}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p>{user?.name || 'User'}</p>
            <span className={`badge badge-${user?.role || 'user'}`} style={{ fontSize: 10 }}>
              {user?.isTeamLead ? 'Team Lead' : user?.role || 'user'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <SidebarLink to="/dashboard" icon={FiHome} onClick={close} end>
            Dashboard
          </SidebarLink>

          <SidebarLink to="/teams" icon={FiUsers} onClick={close} end>
            Teams
          </SidebarLink>

          <SidebarLink to="/projects" icon={FiFolder} onClick={close} end>
            Projects
          </SidebarLink>

          <SidebarLink to="/tasks" icon={FiCheckSquare} onClick={close} end>
            Tasks
          </SidebarLink>

          {/* Quick Actions - ADMIN ONLY */}
          {isAdmin && (
            <>
              <div className="sidebar-section-label">Quick Actions</div>
              <SidebarLink to="/teams/create" icon={FiPlus} onClick={close} end>
                Create Team
              </SidebarLink>
              <SidebarLink to="/projects/create" icon={FiPlus} onClick={close} end>
                Create Project
              </SidebarLink>
              <SidebarLink to="/tasks/create" icon={FiPlus} onClick={close} end>
                Assign Task
              </SidebarLink>
            </>
          )}

          {/* Admin Panel - ADMIN ONLY */}
          {isAdmin && (
            <>
              <div className="sidebar-section-label">Admin</div>
              <SidebarLink to="/admin" icon={FiSettings} onClick={close} end>
                Admin Panel
              </SidebarLink>
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          <SidebarLink to="/profile" icon={FiUser} onClick={close} end>
            Profile
          </SidebarLink>
          <button className="sidebar-logout" onClick={handleLogout}>
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {open && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 99, display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}
    </>
  )
}