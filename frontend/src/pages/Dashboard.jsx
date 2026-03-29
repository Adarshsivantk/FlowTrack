import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import TaskCard from '../components/TaskCard'
import Loading from '../components/Loading'
import {FiCheckSquare, FiClock, FiAlertTriangle,} from 'react-icons/fi'

const STAT_CONFIG = [
  { key: 'totalTasks', label: 'Total Tasks', icon: FiCheckSquare, color: 'blue' },
  { key: 'pendingTasks', label: 'Pending', icon: FiClock, color: 'yellow' },
  { key: 'overdueTasks', label: 'Overdue', icon: FiAlertTriangle, color: 'red' },
]

const STAT_CONFIG_2 = [
] 

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks/dashboard-stats')
      setStats(data)
    } catch (err) {
      console.error('Dashboard stats error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  if (loading) return <Loading />

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Here&apos;s what&apos;s happening with your projects today.</p>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 30 }}>
        {STAT_CONFIG.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="stat-card">
            <div className={`stat-icon ${color}`}><Icon /></div>
            <div className="stat-info">
              <h3>{stats?.[key] || 0}</h3>
              <p>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 30 }}>
        {STAT_CONFIG_2.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="stat-card">
            <div className={`stat-icon ${color}`}><Icon /></div>
            <div className="stat-info">
              <h3>{stats?.[key] || 0}</h3>
              <p>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Tasks</h3>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate('/tasks')}>View All</button>
        </div>
        <div className="card-body">
          {stats?.recentTasks?.length > 0 ? (
            <div className="grid grid-2">
              {stats.recentTasks.map((t) => <TaskCard key={t._id} task={t} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="icon">📋</div>
              <h3>No Tasks Yet</h3>
              <p>Tasks assigned to you will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}