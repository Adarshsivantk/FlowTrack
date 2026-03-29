import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Loading from '../components/Loading'
import StatusBadge from '../components/StatusBadge'
import { toast } from 'react-toastify'
import {
  FiArrowLeft, FiTrash2, FiClock, FiUser,
  FiFolder, FiGithub, FiExternalLink, FiTag,
  FiMessageSquare, FiEdit2, FiSend, FiCheck, FiX,
} from 'react-icons/fi'

function formatDate(d) {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatDateTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function getDeadlineClass(deadline, status) {
  if (status === 'completed') return 'on-time'
  const diff = Math.ceil((new Date(deadline) - new Date()) / 86400000)
  if (diff < 0) return 'overdue'
  if (diff <= 3) return 'upcoming'
  return 'on-time'
}

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin, isTeamLead } = useAuth()

  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [noteContent, setNoteContent] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showStatusForm, setShowStatusForm] = useState(false)
  const [statusForm, setStatusForm] = useState({ status: '', statusNote: '' })
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const canManage = isAdmin || isTeamLead
  const isAssignee = task?.assignedTo?._id === user?._id

  const fetchTask = useCallback(async () => {
    if (!id || id === 'undefined' || !/^[0-9a-fA-F]{24}$/.test(id)) {
      navigate('/tasks', { replace: true })
      return
    }
    try {
      const { data } = await api.get(`/tasks/${id}`)
      setTask(data)
      setStatusForm({ status: data.status, statusNote: data.statusNote || '' })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Task not found')
      navigate('/tasks', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { fetchTask() }, [fetchTask])

  const handleSubmitForApproval = async () => {
    if (!confirm('Submit this task for approval?')) return
    setSubmitting(true)
    try {
      const { data } = await api.post(`/tasks/${id}/submit`)
      setTask(data)
      toast.success('Task submitted for approval!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Approve this task and mark it as completed?')) return
    setApproving(true)
    try {
      const { data } = await api.post(`/tasks/${id}/approve`)
      setTask(data)
      toast.success('Task approved!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve')
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    if (!rejectionReason.trim()) return toast.error('Please provide a rejection reason')
    setRejecting(true)
    try {
      const { data } = await api.post(`/tasks/${id}/reject`, { reason: rejectionReason })
      setTask(data)
      setShowRejectForm(false)
      setRejectionReason('')
      toast.success('Task sent back for revision')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject')
    } finally {
      setRejecting(false)
    }
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    setUpdatingStatus(true)
    try {
      const { data } = await api.put(`/tasks/${id}/status`, statusForm)
      setTask(data)
      setShowStatusForm(false)
      toast.success('Status updated')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!noteContent.trim()) return
    setAddingNote(true)
    try {
      const { data } = await api.post(`/tasks/${id}/notes`, { content: noteContent.trim() })
      setTask(data)
      setNoteContent('')
      toast.success('Note added')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add note')
    } finally {
      setAddingNote(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task? This cannot be undone.')) return
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Task deleted')
      navigate('/tasks', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete')
    }
  }

  if (loading) return <Loading />
  if (!task) return null

  const isPendingReview = task.status === 'review'
  const isCompleted = task.status === 'completed'
  const canSubmit = isAssignee && !isPendingReview && !isCompleted

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-icon" onClick={() => navigate('/tasks')}>
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1>{task.title}</h1>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiFolder size={13} /> {task.project?.name || 'No Project'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusBadge status={task.status} />

          {/* USER: Submit for Approval */}
          {canSubmit && (
            <button className="btn btn-primary" onClick={handleSubmitForApproval} disabled={submitting}>
              <FiSend size={14} /> {submitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          )}

          {/* ADMIN/LEAD: Approve & Reject when in review */}
          {canManage && isPendingReview && (
            <>
              <button
                onClick={handleApprove}
                disabled={approving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: '#10b981', color: '#fff', fontWeight: 600,
                  fontSize: 14, cursor: 'pointer',
                }}
              >
                <FiCheck size={14} /> {approving ? 'Approving...' : 'Approve'}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setShowRejectForm((p) => !p)}
              >
                <FiX size={14} /> Reject
              </button>
            </>
          )}

          {/* ADMIN/LEAD: Manual status update when not in review */}
          {canManage && !isPendingReview && (
            <button className="btn btn-secondary" onClick={() => setShowStatusForm((p) => !p)}>
              <FiEdit2 size={14} /> Update Status
            </button>
          )}

          {canManage && (
            <button className="btn btn-danger" onClick={handleDelete}>
              <FiTrash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Awaiting Approval Banner */}
      {isPendingReview && (
        <div style={{
          background: '#fefce8', border: '1px solid #fde047', borderRadius: 10,
          padding: '14px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>⏳</span>
          <div>
            <p style={{ fontWeight: 600, color: '#854d0e', marginBottom: 2 }}>Awaiting Approval</p>
            <p style={{ fontSize: 13, color: '#a16207' }}>
              {isAssignee
                ? 'You submitted this task for review. An admin or team lead will approve or reject it.'
                : 'This task has been submitted and is waiting for your review.'}
            </p>
          </div>
        </div>
      )}

      {/* Rejection Reason Banner */}
      {task.rejectionReason && task.status === 'in_progress' && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10,
          padding: '14px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>❌</span>
          <div>
            <p style={{ fontWeight: 600, color: '#991b1b', marginBottom: 4 }}>Task Rejected — Needs Revision</p>
            <p style={{ fontSize: 14, color: '#7f1d1d' }}>
              <strong>Reason:</strong> {task.rejectionReason}
            </p>
          </div>
        </div>
      )}

      {/* Reject Form */}
      {showRejectForm && canManage && (
        <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid #ef4444' }}>
          <div className="card-header"><h3>Reject Task</h3></div>
          <div className="card-body">
            <form onSubmit={handleReject}>
              <div className="form-group">
                <label>Rejection Reason *</label>
                <textarea
                  className="form-control"
                  placeholder="Explain what needs to be fixed..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-danger" disabled={rejecting}>
                  {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
                <button type="button" className="btn btn-secondary"
                  onClick={() => { setShowRejectForm(false); setRejectionReason('') }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Status Update Form */}
      {showStatusForm && canManage && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>Update Status</h3></div>
          <div className="card-body">
            <form onSubmit={handleStatusUpdate}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>New Status *</label>
                  <select className="form-control" value={statusForm.status}
                    onChange={(e) => setStatusForm((p) => ({ ...p, status: e.target.value }))} required>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="bug">Bug</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status Note (optional)</label>
                  <input className="form-control" placeholder="Add a note..."
                    value={statusForm.statusNote}
                    onChange={(e) => setStatusForm((p) => ({ ...p, statusNote: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={updatingStatus}>
                  {updatingStatus ? 'Saving...' : 'Save Status'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowStatusForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="detail-grid">
        <div>
          {/* Task Details Card */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h3>Task Details</h3>
              <StatusBadge status={task.priority} />
            </div>
            <div className="card-body">
              {task.description
                ? <p style={{ marginBottom: 20, lineHeight: 1.7, color: 'var(--dark-2)' }}>{task.description}</p>
                : <p style={{ marginBottom: 20, color: 'var(--gray)', fontStyle: 'italic' }}>No description provided.</p>
              }
              {task.statusNote && (
                <div style={{
                  background: 'var(--light)', borderRadius: 8, padding: '10px 14px',
                  marginBottom: 16, fontSize: 13, borderLeft: '3px solid var(--primary)',
                }}>
                  <strong>Status Note:</strong> {task.statusNote}
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label"><FiUser size={13} /> Assigned To</span>
                <span className="detail-value">{task.assignedTo?.name || 'Unassigned'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><FiUser size={13} /> Assigned By</span>
                <span className="detail-value">{task.assignedBy?.name || 'Unknown'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><FiFolder size={13} /> Project</span>
                <span className="detail-value" style={{ color: 'var(--primary)', cursor: 'pointer' }}
                  onClick={() => task.project?._id && navigate(`/projects/${task.project._id}`)}>
                  {task.project?.name || 'No Project'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><FiClock size={13} /> Deadline</span>
                <span className={`detail-value deadline ${getDeadlineClass(task.deadline, task.status)}`}>
                  {formatDate(task.deadline)}
                </span>
              </div>
              {task.project?.githubLink && (
                <div className="detail-row">
                  <span className="detail-label"><FiGithub size={13} /> GitHub</span>
                  <span className="detail-value">
                    <a href={task.project.githubLink} target="_blank" rel="noopener noreferrer" className="github-link">
                      View Repository <FiExternalLink size={12} />
                    </a>
                  </span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Created</span>
                <span className="detail-value" style={{ fontSize: 13, color: 'var(--gray)' }}>
                  {formatDate(task.createdAt)}
                </span>
              </div>
              {task.tags?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiTag size={12} /> Tags
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {task.tags.map((tag, i) => <span key={i} className="tag">{tag}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <div className="card-header">
              <h3><FiMessageSquare size={16} /> Notes ({task.notes?.length || 0})</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddNote} style={{ marginBottom: 20 }}>
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <textarea className="form-control" placeholder="Add a note..."
                    value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={3} />
                </div>
                <button type="submit" className="btn btn-primary btn-sm"
                  disabled={addingNote || !noteContent.trim()}>
                  {addingNote ? 'Adding...' : 'Add Note'}
                </button>
              </form>
              {task.notes?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[...task.notes].reverse().map((note) => (
                    <div key={note._id} style={{ background: 'var(--light)', borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{note.createdBy?.name || 'Unknown'}</span>
                        <span style={{ fontSize: 12, color: 'var(--gray)' }}>{formatDateTime(note.createdAt)}</span>
                      </div>
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--dark-2)' }}>{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--gray)', fontSize: 14, padding: 20 }}>No notes yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className="card">
            <div className="card-header"><h3>Status Overview</h3></div>
            <div className="card-body">
              {['pending', 'in_progress', 'review', 'bug', 'completed'].map((s) => (
                <div key={s} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 8, marginBottom: 4,
                  background: task.status === s ? 'var(--light)' : 'transparent',
                  border: task.status === s ? '1px solid var(--light-2)' : '1px solid transparent',
                }}>
                  <StatusBadge status={s} />
                  {task.status === s && <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>Current</span>}
                </div>
              ))}
            </div>
          </div>

          {/* How to Complete guide for assignee */}
          {isAssignee && !isCompleted && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-header"><h3>How to Complete</h3></div>
              <div className="card-body">
                {[
                  { step: '1', text: 'Work on the task and update status to In Progress' },
                  { step: '2', text: 'When done, click "Submit for Approval"' },
                  { step: '3', text: 'Admin or team lead will approve or reject it' },
                  { step: '4', text: 'If rejected, check the reason and resubmit' },
                ].map(({ step, text }) => (
                  <div key={step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>{step}</div>
                    <p style={{ fontSize: 13, color: 'var(--dark-2)', lineHeight: 1.5, marginTop: 3 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}