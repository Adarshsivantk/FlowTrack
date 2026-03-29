import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Loading from '../components/Loading'
import TaskCard from '../components/TaskCard'
import { FiPlus, FiFilter } from 'react-icons/fi'

export default function Tasks() {
  const { isAdmin, isTeamLead } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (projectFilter) params.append('project', projectFilter)
      const { data } = await api.get(`/tasks?${params}`)
      setTasks(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [statusFilter, projectFilter])

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await api.get('/projects')
      setProjects(data)
    } catch (err) { console.error(err) }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])
  useEffect(() => { fetchProjects() }, [fetchProjects])

  if (loading) return <Loading />

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>Tasks</h1><p>View and manage all your tasks</p></div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/tasks/create')}><FiPlus /> Assign Task</button>
        )}
      </div>

      <div className="filters-bar">
        <FiFilter style={{ color: 'var(--gray)' }} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="bug">Bug</option>
          <option value="review">Review</option>
        </select>
        <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        {(statusFilter || projectFilter) && (
          <button className="btn btn-sm btn-secondary" onClick={() => { setStatusFilter(''); setProjectFilter('') }}>Clear Filters</button>
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="grid grid-2">{tasks.map((t) => <TaskCard key={t._id} task={t} />)}</div>
      ) : (
        <div className="card"><div className="empty-state"><div className="icon">📋</div><h3>No Tasks Found</h3><p>{statusFilter || projectFilter ? 'No tasks match your filters' : 'No tasks have been assigned yet'}</p></div></div>
      )}
    </div>
  )
}