import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Loading from '../components/Loading'
import { FiUsers, FiPlus, FiArrowRight } from 'react-icons/fi'

export default function Teams() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTeams = useCallback(async () => {
    try {
      const { data } = await api.get('/teams')
      setTeams(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTeams() }, [fetchTeams])

  if (loading) return <Loading />

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Teams</h1>
          <p>Manage your teams and members</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/teams/create')}>
            <FiPlus /> Create Team
          </button>
        )}
      </div>

      {teams.length > 0 ? (
        <div className="grid grid-3">
          {teams.map((team) => (
            <div key={team._id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/teams/${team._id}`)}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 45, height: 45, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
                    <FiUsers />
                  </div>
                  <FiArrowRight style={{ color: 'var(--gray-light)' }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{team.name}</h3>
                {team.description && (
                  <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 16, lineHeight: 1.5 }}>
                    {team.description.length > 80 ? `${team.description.slice(0, 80)}...` : team.description}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--light-2)' }}>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 2 }}>Team Lead</p>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{team.teamLead?.name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 2 }}>Members</p>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{team.members?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="icon">👥</div>
            <h3>No Teams Found</h3>
            <p>No teams have been created yet</p>
          </div>
        </div>
      )}
    </div>
  )
}