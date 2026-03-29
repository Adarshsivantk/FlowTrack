import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Loading from '../components/Loading'
import StatusBadge from '../components/StatusBadge'
import { FiPlus, FiFolder, FiClock, FiGithub } from 'react-icons/fi'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function deadlineClass(deadline, status) {
  if (status === 'completed') return 'on-time'
  const diff = Math.ceil((new Date(deadline) - new Date()) / 86400000)
  if (diff < 0) return 'overdue'
  if (diff <= 3) return 'upcoming'
  return 'on-time'
}

// ========== HELPER: safely extract team name ==========
function getTeamName(team) {
  if (!team) return 'No Team'
  if (typeof team === 'string') return 'Team'
  return team.name || 'Unknown Team'
}

export default function Projects() {
  const { isAdmin, isTeamLead } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await api.get('/projects')
      setProjects(data)
    } catch (err) {
      console.error('Projects fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // ========== FIX: Safe navigation — check _id exists ==========
  const handleProjectClick = (project) => {
    if (!project?._id) {
      console.error('Project missing _id:', project)
      return
    }
    navigate(`/projects/${project._id}`)
  }

  if (loading) return <Loading />

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Manage and track all your projects</p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => navigate('/projects/create')}
          >
            <FiPlus /> Create Project
          </button>
        )}
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-2">
          {projects.map((project) => (
            <div
              key={project._id}
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => handleProjectClick(project)}
            >
              <div className="card-body">
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        background: 'var(--light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                      }}
                    >
                      <FiFolder size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600 }}>
                        {project.name}
                      </h3>
                      <p style={{ fontSize: 12, color: 'var(--gray)' }}>
                        {getTeamName(project.team)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={project.status} />
                </div>

                {/* Description */}
                {project.description && (
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--gray)',
                      marginBottom: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    {project.description.length > 100
                      ? `${project.description.slice(0, 100)}...`
                      : project.description}
                  </p>
                )}

                {/* Badges */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <StatusBadge status={project.priority} />
                  {project.githubLink && (
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--gray)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <FiGithub size={12} /> GitHub
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTop: '1px solid var(--light-2)',
                  }}
                >
                  <span
                    className={`deadline ${deadlineClass(project.deadline, project.status)}`}
                  >
                    <FiClock size={14} /> {formatDate(project.deadline)}
                  </span>

                  {/* Member Avatars */}
                  <div style={{ display: 'flex' }}>
                    {project.members?.slice(0, 3).map((m, i) => (
                      <div
                        key={m?._id || i}
                        className="avatar avatar-sm"
                        style={{
                          marginLeft: i > 0 ? -8 : 0,
                          border: '2px solid #fff',
                          fontSize: 10,
                        }}
                        title={m?.name || 'User'}
                      >
                        {m?.name?.charAt(0) || '?'}
                      </div>
                    ))}
                    {(project.members?.length || 0) > 3 && (
                      <div
                        className="avatar avatar-sm"
                        style={{
                          marginLeft: -8,
                          border: '2px solid #fff',
                          background: 'var(--gray)',
                          fontSize: 10,
                        }}
                      >
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="icon">📁</div>
            <h3>No Projects Found</h3>
            <p>Create a project to get started</p>
          </div>
        </div>
      )}
    </div>
  )
}