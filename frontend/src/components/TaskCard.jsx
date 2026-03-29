import { useNavigate } from 'react-router-dom'
import { FiClock, FiUser } from 'react-icons/fi'
import StatusBadge from './StatusBadge'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

function getDeadlineClass(deadline, status) {
  if (status === 'completed') return 'on-time'
  const diff = Math.ceil((new Date(deadline) - new Date()) / 86400000)
  if (diff < 0) return 'overdue'
  if (diff <= 3) return 'upcoming'
  return 'on-time'
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function TaskCard({ task }) {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  // ✅ USER: submit for review
  const handleSubmit = async (e) => {
    e.stopPropagation() // 🚨 prevent card click navigation
    try {
      await api.put(`/tasks/${task._id}/submit`)
      window.location.reload()
    } catch (err) {
      console.error(err)
    }
  }

  // ✅ ADMIN: approve task
  const handleApprove = async (e) => {
    e.stopPropagation() // 🚨 prevent navigation
    try {
      await api.put(`/tasks/${task._id}/approve`)
      window.location.reload()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div
      className={`task-card priority-${task.priority}`}
      onClick={() => navigate(`/tasks/${task._id}`)}
    >
      <div className="task-card-header">
        <h4>{task.title}</h4>
        <StatusBadge status={task.status} />
      </div>

      {task.description && (
        <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 8, lineHeight: 1.5 }}>
          {task.description.length > 100
            ? `${task.description.slice(0, 100)}...`
            : task.description}
        </p>
      )}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        <StatusBadge status={task.priority} />
        {task.tags?.map((tag, i) => (
          <span key={i} className="tag">{tag}</span>
        ))}
      </div>

      <div className="task-card-meta">
        <span><FiUser size={12} /> {task.assignedTo?.name || 'Unassigned'}</span>
        <span className={`deadline ${getDeadlineClass(task.deadline, task.status)}`}>
          <FiClock size={12} /> {formatDate(task.deadline)}
        </span>
        {task.project && (
          <span style={{ color: 'var(--primary)' }}>{task.project.name}</span>
        )}
      </div>

      {/* ✅ ACTION SECTION (ADD HERE — bottom of card) */}
      <div style={{ marginTop: 10 }}>
        
        

        {/* USER WAITING */}
        {!isAdmin && task.status === 'review' && (
          <p style={{ color: 'orange', fontSize: 12 }}>
            Waiting for admin approval
          </p>
        )}

        
      </div>
    </div>
  )
}