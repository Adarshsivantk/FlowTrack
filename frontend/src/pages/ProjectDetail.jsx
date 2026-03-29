import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Loading from '../components/Loading'
import StatusBadge from '../components/StatusBadge'
import TaskCard from '../components/TaskCard'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiEdit2, FiTrash2,
  FiGithub, FiUserMinus, FiExternalLink,
} from 'react-icons/fi'

const fmtDate = (d) => {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ========== HELPER: safely get team info ==========
function getTeamInfo(team) {
  if (!team) return { id: null, name: 'No Team' }
  if (typeof team === 'string') return { id: team, name: 'Team' }
  return { id: team._id || null, name: team.name || 'Unknown Team' }
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, isTeamLead } = useAuth()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  const canManage = isAdmin

  const fetchData = useCallback(async () => {
    // ========== Guard against bad IDs ==========
    if (!id || id === 'undefined' || id === 'null' || id === 'create') {
      setLoading(false)
      navigate('/projects', { replace: true })
      return
    }

    const objectIdRegex = /^[0-9a-fA-F]{24}$/
    if (!objectIdRegex.test(id)) {
      setLoading(false)
      navigate('/projects', { replace: true })
      return
    }

    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`),
      ])
      setProject(pRes.data)
      setTasks(tRes.data)
      setEditForm({
        name: pRes.data.name || '',
        description: pRes.data.description || '',
        githubLink: pRes.data.githubLink || '',
        status: pRes.data.status || 'planning',
        priority: pRes.data.priority || 'medium',
        deadline: pRes.data.deadline?.split('T')[0] || '',
      })
    } catch (err) {
      console.error('ProjectDetail fetch error:', err)
      toast.error(err?.response?.data?.message || 'Project not found')
      navigate('/projects', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.put(`/projects/${id}`, editForm)
      setProject(data)
      setEditing(false)
      toast.success('Project updated')
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!userId) return
    if (!confirm('Remove this member?')) return
    try {
      const { data } = await api.post(`/projects/${id}/remove-member`, { userId })
      setProject(data)
      toast.success('Member removed')
    } catch {
      toast.error('Failed')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this project?')) return
    try {
      await api.delete(`/projects/${id}`)
      toast.success('Deleted')
      navigate('/projects', { replace: true })
    } catch {
      toast.error('Failed')
    }
  }

  // ========== FIX: Safe team navigation ==========
  const handleTeamClick = () => {
    const { id: teamId } = getTeamInfo(project?.team)
    if (!teamId) {
      toast.warning('Team information not available')
      return
    }
    const objectIdRegex = /^[0-9a-fA-F]{24}$/
    if (!objectIdRegex.test(teamId)) {
      toast.warning('Invalid team reference')
      return
    }
    navigate(`/teams/${teamId}`)
  }

  const ef = (field) => (e) => setEditForm((p) => ({ ...p, [field]: e.target.value }))

  if (loading) return <Loading />

  if (!project) {
    return (
      <div className="page-container">
        <div className="card">
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>Project Not Found</h3>
            <p>This project doesn&apos;t exist or you don&apos;t have access.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => navigate('/projects')}
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    )
  }

  const teamInfo = getTeamInfo(project.team)

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-icon" onClick={() => navigate('/projects')}>
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1>{project.name}</h1>
            <p>
              Team:{' '}
              {teamInfo.id ? (
                <span
                  style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}
                  onClick={handleTeamClick}
                >
                  {teamInfo.name}
                </span>
              ) : (
                <span>{teamInfo.name}</span>
              )}
            </p>
          </div>
        </div>
        {canManage && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => setEditing(!editing)}>
              <FiEdit2 /> Edit
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              <FiTrash2 /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Edit Form */}
      {editing && canManage && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <form onSubmit={handleUpdate}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Project Name</label>
                  <input className="form-control" value={editForm.name} onChange={ef('name')} required />
                </div>
                <div className="form-group">
                  <label>GitHub Link</label>
                  <input type="url" className="form-control" value={editForm.githubLink} onChange={ef('githubLink')} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={editForm.status} onChange={ef('status')}>
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-control" value={editForm.priority} onChange={ef('priority')}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input type="date" className="form-control" value={editForm.deadline} onChange={ef('deadline')} />
                </div>
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
        {/* Left Column */}
        <div>
          {/* Project Details */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h3>Project Details</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <StatusBadge status={project.status} />
                <StatusBadge status={project.priority} />
              </div>
            </div>
            <div className="card-body">
              {project.description && (
                <p style={{ marginBottom: 20, lineHeight: 1.7, color: 'var(--dark-2)' }}>
                  {project.description}
                </p>
              )}
              <div className="detail-row">
                <span className="detail-label">Deadline</span>
                <span className="detail-value">{fmtDate(project.deadline)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Created By</span>
                <span className="detail-value">{project.createdBy?.name || 'Unknown'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Team</span>
                <span className="detail-value">
                  {teamInfo.id ? (
                    <span
                      style={{ color: 'var(--primary)', cursor: 'pointer' }}
                      onClick={handleTeamClick}
                    >
                      {teamInfo.name}
                    </span>
                  ) : (
                    teamInfo.name
                  )}
                </span>
              </div>
              {project.githubLink && (
                <div className="detail-row">
                  <span className="detail-label">GitHub</span>
                  <span className="detail-value">
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="github-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiGithub /> View Repository <FiExternalLink size={12} />
                    </a>
                  </span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Created</span>
                <span className="detail-value">{fmtDate(project.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="card">
            <div className="card-header">
              <h3>Tasks ({tasks.length})</h3>
              {canManage && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => navigate('/tasks/create')}
                >
                  + Add Task
                </button>
              )}
            </div>
            <div className="card-body">
              {tasks.length > 0 ? (
                <div className="grid" style={{ gap: 12 }}>
                  {tasks.map((t) => (
                    <TaskCard key={t._id} task={t} />
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: 30 }}>
                  <div className="icon">📋</div>
                  <p>No tasks for this project yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Members */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3>Members ({project.members?.length || 0})</h3>
            </div>
            <div className="card-body">
              {project.members?.length > 0 ? (
                project.members.map((m) => {
                  if (!m?._id) return null
                  return (
                    <div key={m._id} className="member-item">
                      <div className="member-info">
                        <div className="avatar avatar-sm">
                          {m.name?.charAt(0) || '?'}
                        </div>
                        <div className="member-details">
                          <h4>{m.name || 'Unknown'}</h4>
                          <p>{m.email || 'No email'}</p>
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
                  )
                })
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--gray)', padding: 20, fontSize: 14 }}>
                  No members assigned
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}