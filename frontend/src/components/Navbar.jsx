import { useAuth } from '../context/AuthContext'
import StatusBadge from './StatusBadge'

export default function Navbar() {
  const { user } = useAuth()

  return (
    <div style={{
      padding: '12px 30px',
      borderBottom: '1px solid var(--light-2)',
      background: 'var(--white)',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 12,
    }}>
      <StatusBadge status={user?.role} />
      <div className="avatar avatar-sm">{user?.name?.charAt(0)}</div>
      <span style={{ fontWeight: 500, fontSize: 14 }}>{user?.name}</span>
    </div>
  )
}