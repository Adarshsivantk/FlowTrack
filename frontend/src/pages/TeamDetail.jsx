import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Loading from '../components/Loading'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiEdit2, FiTrash2,
  FiUserMinus, FiUserPlus, FiUsers,
} from 'react-icons/fi'

const fmtDate = (d) => {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function TeamDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const [team, setTeam] = useState(null)
  const [projects, setProjects] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '', teamLead: '' })

  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [addingMember, setAddingMember] = useState(false)

  const isTeamLead = team?.teamLead?._id === user?._id
  const canManage = isAdmin || isTeamLead

  const fetchData = useCallback(async () => {
    if (!id || id === 'undefined' || id === 'null' || id === 'create') {
      navigate('/teams', { replace: true })
      return
    }
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      navigate('/teams', { replace: true })
      return
    }

    try {
      const [teamRes, projectsRes] = await Promise.all([
        api.get(`/teams/${id}`),
        api.get('/projects'),
      ])
      setTeam(teamRes.data)
      // filter only projects belonging to this team
      setProjects(projectsRes.data.filter((p) => {
        const teamId = p.team?._id || p.team
        return teamId === id
      }))
      setEditForm({
        name: teamRes.data.name || '',
        description: teamRes.data.description || '',
        teamLead: teamRes.data.teamLead?._id || '',
      })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Team not found')
      navigate('/teams', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  // fetch all users only when admin opens the add-member panel
  const fetchAllUsers = useCallback(async () => {
    if (allUsers.length > 0) return
    try {
      const { data } = await api.get('/users')
      setAllUsers(data)
    } catch {
      toast.error('Failed to load users')
    }
  }, [allUsers.length])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (showAddMember) fetchAllUsers()
  }, [showAddMember, fetchAllUsers])

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.put(`/teams/${id}`, editForm)
      setTeam(data)
      setEditing(false)
      toast.success('Team updated')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update')
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!selectedUser) return
    setAddingMember(true)
    try {
      const { data } = await api.post(`/teams/${id}/add-member`, { userId: selectedUser })
      setTeam(data)
      setSelectedUser('')
      setShowAddMember(false)
      toast.success('Member added')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add member')
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the team?')) return
    try {
      const { data } = await api.post(`/teams/${id}/remove-member`, { userId })
      setTeam(data)
      toast.success('Member removed')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove member')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this team? This cannot be undone.')) return
    try {
      await api.delete(`/teams/${id}`)
      toast.success('Team deleted')
      navigate('/teams', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete')
    }
  }

  const ef = (field) => (e) => setEditForm((p) => ({ ...p, [field]: e.target.value }))

  // users not already in the team (for add-member dropdown)
  const memberIds = new Set(team?.members?.map((m) => m._id) || [])
  memberIds.add(team?.teamLead?._id)
  const availableUsers = allUsers.filter((u) => !memberIds.has(u._id))

  if (loading) return <Loading />

  if (!team) {
    return (
      <div className="page-container">
        <div className="card">
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>Team Not Found</h3>
            <p>This team doesn&apos;t exist or you don&apos;t have access.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/teams')}>
              Back to Teams
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-icon" onClick={() => navigate('/teams')}>
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1>{team.name}</h1>
            <p>
              Lead:{' '}
              <span style={{ fontWeight: 600, color: 'var(--dark)' }}>
                {team.teamLead?.name || 'Unassigned'}
              </span>
            </p>
          </div>
        </div>

        {canManage && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => setEditing(!editing)}>
              <FiEdit2 /> Edit
            </button>
            {isAdmin && (
              <button className="btn btn-danger" onClick={handleDelete}>
                <FiTrash2 /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Edit Form ── */}
      {editing && canManage && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>Edit Team</h3></div>
          <div className="card-body">
            <form onSubmit={handleUpdate}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Team Name *</label>
                  <input className="form-control" value={editForm.name} onChange={ef('name')} required />
                </div>
                {isAdmin && (
                  <div className="form-group">
                    <label>Team Lead *</label>
                    <select className="form-control" value={editForm.teamLead} onChange={ef('teamLead')} required>
                      <option value="">Select team lead</option>
                      {team.members?.map((m) => (
                        <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                      ))}
                      {/* include current lead in case they're not in members */}
                      {team.teamLead && !team.members?.find((m) => m._id === team.teamLead._id) && (
                        <option value={team.teamLead._id}>{team.teamLead.name} ({team.teamLead.email})</option>
                      )}
                    </select>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" value={editForm.description} onChange={ef('description')} rows={3} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="detail-grid">

        {/* ── Left Column ── */}
        <div>

          {/* Team Info */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h3>Team Details</h3>
              <div style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: 8, padding: '4px 12px',
                fontSize: 13, color: '#fff', fontWeight: 600,
              }}>
                {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="card-body">
              {team.description
                ? <p style={{ marginBottom: 20, lineHeight: 1.7, color: 'var(--dark-2)' }}>{team.description}</p>
                : <p style={{ marginBottom: 20, color: 'var(--gray)', fontStyle: 'italic' }}>No description provided.</p>
              }
              <div className="detail-row">
                <span className="detail-label"><FiUsers size={13} /> Team Lead</span>
                <span className="detail-value" style={{ fontWeight: 600 }}>
                  {team.teamLead?.name || 'Unassigned'}
                  <span style={{ fontWeight: 400, color: 'var(--gray)', marginLeft: 6, fontSize: 13 }}>
                    {team.teamLead?.email}
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Created By</span>
                <span className="detail-value">{team.createdBy?.name || 'Unknown'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Created</span>
                <span className="detail-value">{fmtDate(team.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="card">
            <div className="card-header">
              <h3>Projects ({projects.length})</h3>
              {isAdmin && (
                <button className="btn btn-sm btn-primary" onClick={() => navigate('/projects/create')}>
                  + New Project
                </button>
              )}
            </div>
            <div className="card-body">
              {projects.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {projects.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => navigate(`/projects/${p._id}`)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        border: '1px solid var(--light-2)', background: 'var(--light)',
                        transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--light-2)'}
                    >
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--gray)' }}>
                          {p.members?.length || 0} member{p.members?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                          background: p.status === 'completed' ? '#d1fae5' : p.status === 'in_progress' ? '#dbeafe' : 'var(--light-2)',
                          color: p.status === 'completed' ? '#065f46' : p.status === 'in_progress' ? '#1e40af' : 'var(--gray)',
                        }}>
                          {p.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: 30 }}>
                  <div className="icon">📁</div>
                  <p>No projects for this team yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column — Members ── */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3>Members ({team.members?.length || 0})</h3>
              {canManage && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setShowAddMember(!showAddMember)}
                >
                  <FiUserPlus size={14} /> Add
                </button>
              )}
            </div>

            {/* Add Member Form */}
            {showAddMember && canManage && (
              <div style={{ padding: '0 20px 16px' }}>
                <form onSubmit={handleAddMember} style={{ display: 'flex', gap: 8 }}>
                  <select
                    className="form-control"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map((u) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={addingMember}>
                    {addingMember ? '...' : 'Add'}
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddMember(false)}>
                    Cancel
                  </button>
                </form>
              </div>
            )}

            <div className="card-body" style={{ paddingTop: 0 }}>
              {/* Team Lead (always shown first) */}
              {team.teamLead && (
                <div className="member-item" style={{ marginBottom: 8 }}>
                  <div className="member-info">
                    <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      {team.teamLead.name?.charAt(0) || '?'}
                    </div>
                    <div className="member-details">
                      <h4>
                        {team.teamLead.name}
                        <span style={{
                          marginLeft: 8, fontSize: 11, fontWeight: 600,
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          color: '#fff', padding: '2px 8px', borderRadius: 20,
                        }}>
                          Lead
                        </span>
                      </h4>
                      <p>{team.teamLead.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Members */}
              {team.members?.length > 0 ? (
                team.members
                  .filter((m) => m._id !== team.teamLead?._id)
                  .map((m) => (
                    <div key={m._id} className="member-item">
                      <div className="member-info">
                        <div className="avatar avatar-sm">
                          {m.name?.charAt(0) || '?'}
                        </div>
                        <div className="member-details">
                          <h4>{m.name}</h4>
                          <p>{m.email}</p>
                        </div>
                      </div>
                      {canManage && (
                        <button
                          className="btn btn-sm btn-icon"
                          onClick={() => handleRemoveMember(m._id)}
                          title="Remove member"
                        >
                          <FiUserMinus size={14} />
                        </button>
                      )}
                    </div>
                  ))
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '20px 0', fontSize: 14 }}>
                  No additional members
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}