import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { toast } from 'react-toastify'
import { FiArrowLeft, FiX } from 'react-icons/fi'

export default function CreateTask() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [tagInput, setTagInput] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    deadline: '',
    priority: 'medium',
    tags: [],
  })

  const fetchData = useCallback(async () => {
    try {
      const [p, u] = await Promise.all([api.get('/projects'), api.get('/users')])
      setProjects(p.data)
      setUsers(u.data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  // FIX 1: reset assignedTo whenever project changes
  const handleProjectChange = (e) => {
    setForm((p) => ({ ...p, project: e.target.value, assignedTo: '' }))
    setErrors((p) => ({ ...p, project: '', assignedTo: '' }))
  }

  const selectedProject = projects.find((p) => p._id === form.project)

  // Members come from selectedProject.members (already populated by the API)
  const availableUsers = selectedProject
    ? selectedProject.members?.filter((m) => m.role !== 'admin') ?? []
    : []

  // FIX 2: tag chip logic
  const addTag = (raw) => {
    const tag = raw.trim()
    if (!tag) return
    if (form.tags.includes(tag)) return
    setForm((p) => ({ ...p, tags: [...p.tags, tag] }))
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
      setTagInput('')
    } else if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
      setForm((p) => ({ ...p, tags: p.tags.slice(0, -1) }))
    }
  }

  const handleTagBlur = () => {
    if (tagInput.trim()) {
      addTag(tagInput)
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))
  }

  // FIX 3: validation before submit
  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Task title is required'
    if (!form.project) e.project = 'Please select a project'
    if (!form.assignedTo) e.assignedTo = 'Please assign this task to someone'
    if (!form.deadline) e.deadline = 'Deadline is required'
    else if (new Date(form.deadline) < new Date().setHours(0, 0, 0, 0))
      e.deadline = 'Deadline cannot be in the past'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (field) => (e) => {
    update(field)(e)
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix the errors before submitting')
      return
    }
    setLoading(true)
    try {
      await api.post('/tasks', form)
      toast.success('Task assigned!')
      navigate('/tasks')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (field) =>
    errors[field] ? (
      <p style={{ color: 'var(--danger, #ef4444)', fontSize: 12, marginTop: 4 }}>
        {errors[field]}
      </p>
    ) : null

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-icon" onClick={() => navigate('/tasks')}>
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1>Assign Task</h1>
            <p>Create and assign a new task to a team member</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate>

            {/* Task Title */}
            <div className="form-group">
              <label>Task Title *</label>
              <input
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                placeholder="Enter task title"
                value={form.title}
                onChange={handleChange('title')}
                style={errors.title ? { borderColor: '#ef4444' } : {}}
              />
              {fieldError('title')}
            </div>

            <div className="grid grid-2">
              {/* Project */}
              <div className="form-group">
                <label>Project *</label>
                <select
                  className="form-control"
                  value={form.project}
                  onChange={handleProjectChange}
                  style={errors.project ? { borderColor: '#ef4444' } : {}}
                >
                  <option value="">Select project...</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
                {fieldError('project')}
              </div>

              {/* Assign To */}
              <div className="form-group">
                <label>Assign To *</label>
                <select
                  className="form-control"
                  value={form.assignedTo}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, assignedTo: e.target.value }))
                    if (errors.assignedTo) setErrors((p) => ({ ...p, assignedTo: '' }))
                  }}
                  disabled={!form.project}
                  style={errors.assignedTo ? { borderColor: '#ef4444' } : {}}
                >
                  <option value="">
                    {form.project ? 'Select user...' : 'Select project first'}
                  </option>
                  {availableUsers.length > 0
                    ? availableUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email})
                        </option>
                      ))
                    : form.project && (
                        <option disabled>No members assigned to this project</option>
                      )}
                </select>
                {fieldError('assignedTo')}
              </div>

              {/* Deadline */}
              <div className="form-group">
                <label>Deadline *</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.deadline}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, deadline: e.target.value }))
                    if (errors.deadline) setErrors((p) => ({ ...p, deadline: '' }))
                  }}
                  style={errors.deadline ? { borderColor: '#ef4444' } : {}}
                />
                {fieldError('deadline')}
              </div>

              {/* Priority */}
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

            {/* Description */}
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                placeholder="Describe the task in detail..."
                value={form.description}
                onChange={update('description')}
                rows={5}
              />
            </div>

            {/* FIX 2: Tags as chips
            <div className="form-group">
              <label>Tags</label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  border: '1px solid var(--light-2)',
                  borderRadius: 8,
                  background: 'var(--white)',
                  cursor: 'text',
                  minHeight: 42,
                }}
                onClick={() => document.getElementById('tag-input').focus()}
              >
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      borderRadius: 20,
                      background: 'var(--light)',
                      border: '1px solid var(--light-2)',
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--dark)',
                    }}
                  >
                    {tag}
                    <FiX
                      size={11}
                      style={{ cursor: 'pointer', color: 'var(--gray)' }}
                      onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
                    />
                  </span>
                ))}
                <input
                  id="tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={handleTagBlur}
                  placeholder={form.tags.length === 0 ? 'Type a tag and press Enter or comma...' : ''}
                  style={{
                    border: 'none',
                    outline: 'none',
                    flex: 1,
                    minWidth: 140,
                    fontSize: 14,
                    background: 'transparent',
                    padding: '2px 0',
                  }}
                />
              </div>
              <p style={{ fontSize: 12, color: 'var(--gray)', marginTop: 4 }}>
                Press <kbd style={{ padding: '1px 5px', borderRadius: 3, border: '1px solid var(--light-2)', fontSize: 11 }}>Enter</kbd> or <kbd style={{ padding: '1px 5px', borderRadius: 3, border: '1px solid var(--light-2)', fontSize: 11 }}>,</kbd> to add a tag. Backspace to remove the last one.
              </p>
            </div> */}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Assign Task'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/tasks')}
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