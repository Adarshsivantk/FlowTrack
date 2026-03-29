import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { toast } from 'react-toastify'
import { FiArrowLeft, FiCheck } from 'react-icons/fi'

export default function CreateProject() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    team: '',
    githubLink: '',
    deadline: '',
    priority: 'medium',
    members: [],
  })

  const fetchData = useCallback(async () => {
    try {
      const [t, u] = await Promise.all([api.get('/teams'), api.get('/users')])
      setTeams(t.data)
      setUsers(u.data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // FIX: When team changes, filter available members to those in that team
  //      and reset current member selection
  const handleTeamChange = (e) => {
    setForm((p) => ({ ...p, team: e.target.value, members: [] }))
  }

  // FIX: restored toggleMember with actual UI
  const toggleMember = (id) => {
    setForm((p) => ({
      ...p,
      members: p.members.includes(id)
        ? p.members.filter((m) => m !== id)
        : [...p.members, id],
    }))
  }

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  // Members available to add: those who belong to the selected team (non-admin)
  const selectedTeam = teams.find((t) => t._id === form.team)
  const availableMembers = users.filter(
    (u) =>
      u.role !== 'admin' &&
      (
        selectedTeam?.members?.some((m) => m._id === u._id) ||
        selectedTeam?.teamLead?._id === u._id
      )
  )

 const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)

  try {
    // ✅ CLEAN DATA BEFORE SENDING
    const payload = {
      name: form.name,
      description: form.description,
      team: form.team,
      githubLink: form.githubLink,
      deadline: new Date(form.deadline), // ✅ FIX 1
      priority: form.priority,
      members: form.members.filter(Boolean), // ✅ FIX 2
    }

    console.log("SENDING:", payload) // 👈 debug

    await api.post('/projects', payload)

    toast.success('Project created!')
    navigate('/projects')
  } catch (err) {
    console.error("FRONTEND ERROR:", err.response?.data)
    toast.error(err.response?.data?.message || 'Failed to create project')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-icon" onClick={() => navigate('/projects')}>
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1>Create Project</h1>
            <p>Set up a new project for your team</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  className="form-control"
                  placeholder="Enter project name"
                  value={form.name}
                  onChange={update('name')}
                  required
                />
              </div>

              <div className="form-group">
                <label>Team *</label>
                <select
                  className="form-control"
                  value={form.team}
                  onChange={handleTeamChange}
                  required
                >
                  <option value="">Select a team...</option>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>GitHub Repository Link</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://github.com/..."
                  value={form.githubLink}
                  onChange={update('githubLink')}
                />
              </div>

              <div className="form-group">
                <label>Deadline *</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.deadline}
                  onChange={update('deadline')}
                  required
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select className="form-control" value={form.priority} onChange={update('priority')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                placeholder="Describe the project..."
                value={form.description}
                onChange={update('description')}
                rows={4}
              />
            </div>

            {/* FIX: restored member selection UI */}
            <div className="form-group">
              <label>
                Assign Members
                {form.members.length > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                    {form.members.length} selected
                  </span>
                )}
              </label>

              {!form.team ? (
                <p style={{ fontSize: 13, color: 'var(--gray)', marginTop: 6 }}>
                  Select a team first to see available members
                </p>
              ) : availableMembers.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--gray)', marginTop: 6 }}>
                  No members found in this team
                </p>
              ) : (
                <div
                  style={{
                    border: '1px solid var(--light-2)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    marginTop: 6,
                  }}
                >
                  {availableMembers.map((u, i) => {
                    const isSelected = form.members.includes(u._id)
                    return (
                      <div
                        key={u._id}
                        onClick={() => toggleMember(u._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 14px',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--light)' : 'var(--white)',
                          borderTop: i > 0 ? '1px solid var(--light-2)' : 'none',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 5,
                            border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--light-2)'}`,
                            background: isSelected ? 'var(--primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.15s',
                          }}
                        >
                          {isSelected && <FiCheck size={12} color="#fff" />}
                        </div>
                        <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>
                          {u.name?.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 1 }}>{u.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--gray)' }}>{u.email}</p>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--gray)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {u.role?.replace('_', ' ')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/projects')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}