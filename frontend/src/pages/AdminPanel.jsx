import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import Loading from '../components/Loading'
import { toast } from 'react-toastify'
import { FiUsers, FiShield, FiTrash2 } from 'react-icons/fi'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/users')
      setUsers(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/users/${userId}/role`, { role })
      fetchUsers()
      toast.success('Role updated')
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return
    try {
      await api.delete(`/users/${userId}`)
      fetchUsers()
      toast.success('User deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    }
  }

  if (loading) return <Loading />

  const counts = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    users: users.filter((u) => u.role === 'user').length,
  }

  return (
    <div className="page-container">
      <div className="page-header"><div><h1>Admin Panel</h1><p>Manage users, roles, and system settings</p></div></div>

      <div className="grid grid-4" style={{ marginBottom: 30 }}>
        <div className="stat-card"><div className="stat-icon blue"><FiUsers /></div><div className="stat-info"><h3>{counts.total}</h3><p>Total Users</p></div></div>
        <div className="stat-card"><div className="stat-icon red"><FiShield /></div><div className="stat-info"><h3>{counts.admins}</h3><p>Admins</p></div></div>
        <div className="stat-card"><div className="stat-icon green"><FiUsers /></div><div className="stat-info"><h3>{counts.users}</h3><p>Users</p></div></div>
      </div>

      <div className="card">
        <div className="card-header"><h3>All Users</h3></div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar avatar-sm">{u.name?.charAt(0)}</div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--light-2)', fontSize: 13, background: 'var(--white)', cursor: 'pointer' }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--gray)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {/* Hide delete button for admin users */}
                    {u.role !== 'admin' && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u._id)}>
                        <FiTrash2 size={13} /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}