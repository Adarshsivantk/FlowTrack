import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { toast } from 'react-toastify'
import { FiArrowLeft } from 'react-icons/fi'

export default function CreateTeam() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', teamLead: '', members: [] })

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/users')
      setUsers(data)
    } catch (err) { console.error(err) }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const toggleMember = (id) => {
    setForm((p) => ({
      ...p,
      members: p.members.includes(id) ? p.members.filter((m) => m !== id) : [...p.members, id],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.teamLead) return toast.error('Please select a team lead')
    setLoading(true)
    try {
      await api.post('/teams', form)
      toast.success('Team created!')
      navigate('/teams')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const availableMembers = users.filter(
  (u) => u._id !== form.teamLead && u.role !== 'admin'
)

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-icon" onClick={() => navigate('/teams')}><FiArrowLeft size={20} /></button>
          <div><h1>Create Team</h1><p>Set up a new team with members and a team lead</p></div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Team Name *</label>
                <input className="form-control" placeholder="Enter team name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Team Lead *</label>
                <select className="form-control" value={form.teamLead} onChange={(e) => setForm((p) => ({ ...p, teamLead: e.target.value }))} required>
                  <option value="">Select team lead...</option>
                  {users
                      .filter((u) => u.role !== 'admin')
                      .map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email}) - {u.role}
                        </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" placeholder="Describe the team's purpose..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
            </div>

            <div className="form-group">
              <label>Team Members</label>
              <div className="checkbox-list">
                {availableMembers.length > 0 ? availableMembers.map((u) => (
                  <label key={u._id} className={`checkbox-item ${form.members.includes(u._id) ? 'selected' : ''}`}>
                    <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)} />
                    <div className="avatar avatar-sm">{u.name?.charAt(0)}</div>
                    <div><p style={{ fontWeight: 500, fontSize: 14 }}>{u.name}</p><p style={{ fontSize: 12, color: 'var(--gray)' }}>{u.email}</p></div>
                    <span className={`badge badge-${u.role}`} style={{ marginLeft: 'auto' }}>{u.role}</span>
                  </label>
                )) : (
                  <p style={{ textAlign: 'center', color: 'var(--gray)', padding: 20, fontSize: 14 }}>Select a team lead first</p>
                )}
              </div>
              {form.members.length > 0 && <p style={{ marginTop: 8, fontSize: 13, color: 'var(--gray)' }}>{form.members.length} member(s) selected</p>}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Creating...' : 'Create Team'}</button>
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/teams')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}