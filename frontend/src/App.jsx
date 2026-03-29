import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

import { AuthProvider, useAuth } from './context/AuthContext'
import Loading from './components/Loading'
import Sidebar from './components/Sidebar'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Teams from './pages/Teams'
import TeamDetail from './pages/TeamDetail'
import CreateTeam from './pages/CreateTeam'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import CreateProject from './pages/CreateProject'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
import CreateTask from './pages/CreateTask'
import AdminPanel from './pages/AdminPanel'
import Profile from './pages/Profile'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  return user ? children : <Navigate to="/login" />
}

// Only admin can access these routes
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" />
  if (!isAdmin) return <Navigate to="/dashboard" />
  return children
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />

      {/* TEAMS */}
      <Route path="/teams" element={<PrivateRoute><AppLayout><Teams /></AppLayout></PrivateRoute>} />
      <Route path="/teams/create" element={<AdminRoute><AppLayout><CreateTeam /></AppLayout></AdminRoute>} />
      <Route path="/teams/:id" element={<PrivateRoute><AppLayout><TeamDetail /></AppLayout></PrivateRoute>} />

      {/* PROJECTS */}
      <Route path="/projects" element={<PrivateRoute><AppLayout><Projects /></AppLayout></PrivateRoute>} />
      <Route path="/projects/create" element={<AdminRoute><AppLayout><CreateProject /></AppLayout></AdminRoute>} />
      <Route path="/projects/:id" element={<PrivateRoute><AppLayout><ProjectDetail /></AppLayout></PrivateRoute>} />

      {/* TASKS */}
      <Route path="/tasks" element={<PrivateRoute><AppLayout><Tasks /></AppLayout></PrivateRoute>} />
      <Route path="/tasks/create" element={<AdminRoute><AppLayout><CreateTask /></AppLayout></AdminRoute>} />
      <Route path="/tasks/:id" element={<PrivateRoute><AppLayout><TaskDetail /></AppLayout></PrivateRoute>} />

      {/* ADMIN */}
      <Route path="/admin" element={<AdminRoute><AppLayout><AdminPanel /></AppLayout></AdminRoute>} />
      <Route path="/profile" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />

      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  )
}