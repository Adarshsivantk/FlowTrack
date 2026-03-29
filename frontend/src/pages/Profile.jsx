import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { toast } from 'react-toastify'
import StatusBadge from '../components/StatusBadge'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password && form.password !== form.confirm) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      const payload = { name: form.name, email: form.email }
      if (form.password) payload.password = form.password

      const { data } = await api.put('/auth/profile', payload)
      updateUser(data)
      toast.success('Profile updated!')
      setForm((p) => ({ ...p, password: '', confirm: '' }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header"><div><h1>Profile</h1><p>Manage your account settings</p></div></div>

      <div className="detail-grid">
        <div>
          <div className="card">
            <div className="card-header"><h3>Update Profile</h3></div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Full Name</label><input className="form-control" value={form.name} onChange={update('name')} required /></div>
                <div className="form-group"><label>Email Address</label><input type="email" className="form-control" value={form.email} onChange={update('email')} required /></div>
                <div className="form-group"><label>New Password (leave blank to keep current)</label><input type="password" className="form-control" placeholder="Enter new password" value={form.password} onChange={update('password')} minLength={6} /></div>
                {form.password && <div className="form-group"><label>Confirm New Password</label><input type="password" className="form-control" placeholder="Confirm new password" value={form.confirm} onChange={update('confirm')} /></div>}
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </form>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-header"><h3>Account Info</h3></div>
            <div className="card-body" style={{ textAlign: 'center' }}>
              <div className="avatar avatar-lg" style={{ margin: '0 auto 16px', fontSize: 24 }}>{user?.name?.charAt(0)}</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{user?.name}</h3>
              <p style={{ color: 'var(--gray)', marginBottom: 12 }}>{user?.email}</p>
              <StatusBadge status={user?.role} />
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--light-2)' }}>
                <div className="detail-row"><span className="detail-label">Role</span><span className="detail-value">{user?.role?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span></div>
                <div className="detail-row"><span className="detail-label">User ID</span><span className="detail-value" style={{ fontSize: 12, fontFamily: 'monospace' }}>{user?._id}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}