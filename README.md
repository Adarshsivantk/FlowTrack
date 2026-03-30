<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=1E40AF&height=200&section=header&text=FlowTrack&fontSize=80&fontColor=ffffff&fontAlignY=35&desc=Project%20Management%20System&descAlignY=55&descSize=20&descColor=93C5FD" width="100%"/>
</div>

### *"Work, Track, Analyze"*

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express_4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB_7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

![Version](https://img.shields.io/badge/Version-1.0.0-orange?style=flat-square)

---

## 📋 Table of Contents

<details>
<summary>Click to expand</summary>

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📂 File Structure](#-file-structure)
- [📚 Documentation](#-documentation)
- [🚀 Getting Started](#-getting-started)
- [🔑 Environment Variables](#-environment-variables)
- [🐳 Docker Deployment](#-docker-deployment)
- [📡 API Reference](#-api-reference)
- [🔒 Role & Permission Matrix](#-role--permission-matrix)
- [🔮 Future Improvements](#-future-improvements)
- [🤝 Contributing](#-contributing)


</details>

---

## 🌟 Overview

**FlowTrack** is a full-stack project management web application designed for small to medium-sized software development teams. It provides a structured, role-aware workflow for managing teams, projects, and tasks — with a formal approval system that ensures no work gets marked complete without proper admin review.

Inspired by tools like **Jira** and **Trello**, FlowTrack is lightweight yet powerful, featuring:

<table>
<tr>
<td>

🔐 **Secure Auth**
httpOnly cookie JWTs — XSS-proof by design

</td>
<td>

🎯 **Role Separation**
Admin, Team Lead & User with strict boundaries

</td>
<td>

✅ **Approval Workflow**
Submit → Review → Approve/Reject cycle

</td>
<td>

🐳 **Docker Ready**
One command to spin up the entire stack

</td>
</tr>
</table>

> **Core Philosophy:** Every team member has exactly the permissions they need — no more, no less. Admins manage, users execute, and nothing gets marked complete without proper review.

---

## ✨ Features

<details open>
<summary><strong>🔐 Authentication & Security</strong></summary>

<br/>

- **httpOnly Cookie-based JWT** — tokens are completely inaccessible to JavaScript, preventing XSS attacks
- Session restoration on page reload via `/auth/me` — seamless UX without storing sensitive data
- Automatic logout on token expiry with redirect to `/login`
- Server-side cookie clearing on logout — zero token persistence after session ends

</details>

<details open>
<summary><strong>👥 Team Management</strong></summary>

<br/>

- Create teams with **unique names** enforced at the database level
- Assign a dedicated **Team Lead** and multiple members per team
- Team Lead status determined **dynamically** from team membership — not hardcoded as a user role
- A user can be Team Lead of one team and a regular member of another simultaneously
- Add / remove members from teams at any time

</details>

<details open>
<summary><strong>📁 Project Management</strong></summary>

<br/>

- Create projects linked to a specific team with deadline and priority
- Assign members exclusively from the project's team
- Track project status: `Planning` → `In Progress` → `Completed` → `On Hold`
- Priority levels: `Low` `Medium` `High` `Critical`
- Attach GitHub repository links directly to projects

</details>

<details open>
<summary><strong>✅ Task Management & Approval Workflow</strong></summary>

<br/>

```
Pending ──► In Progress ──► Review ──► Completed
                               │
                               ▼
                           Rejected ──► In Progress (with reason)
```

- Assign tasks to specific project members with deadlines, priority levels, and tags
- Users work on tasks and **Submit for Approval** when complete
- **Admin Approve** → task marked as `Completed`
- **Admin Reject** → mandatory rejection reason required; task returns to `In Progress` with banner
- Full **notes thread** on each task — timestamped audit trail of all activity
- Filter tasks by status and project

</details>

<details open>
<summary><strong>🛡️ Admin Panel</strong></summary>

<br/>

- View all registered users with join date
- Promote users to Admin or demote back to User
- Delete non-admin users — admin accounts are fully protected
- Real-time user count stats

</details>

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|:----------|:-------:|:--------|
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black&style=flat-square) React | 19 | UI framework |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white&style=flat-square) Vite | 6 | Build tool & dev server |
| ![Router](https://img.shields.io/badge/-React_Router-CA4245?logo=react-router&logoColor=white&style=flat-square) React Router | 7 | Client-side routing |
| ![Axios](https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white&style=flat-square) Axios | 1.7 | HTTP client with interceptors |
| ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white&style=flat-square) Tailwind CSS | 4 | Utility-first styling |
| React Toastify | 11 | Toast notifications |
| React Icons | 5 | Icon library |

### Backend

| Technology | Version | Purpose |
|:----------|:-------:|:--------|
| ![Node](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white&style=flat-square) Node.js | 20 | JavaScript runtime |
| ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white&style=flat-square) Express | 4 | REST API framework |
| ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white&style=flat-square) MongoDB | 7 | NoSQL database |
| Mongoose | 7 | ODM & schema modeling |
| JSON Web Token | 9 | Authentication tokens |
| bcrypt | 6 | Password hashing |
| cookie-parser | 1.4 | Cookie parsing middleware |
| cors | 2.8 | Cross-origin resource sharing |
| dotenv | 16 | Environment variable management |

### DevOps

| Technology | Purpose |
|:----------|:--------|
| ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white&style=flat-square) Docker | Containerization |
| Docker Compose | Multi-container orchestration |



## 📂 File Structure

```
flowtrack/
│
├── 📄 docker-compose.yml              # Multi-container orchestration
├── 📄 README.md
│
├── 📁 docs/
│   ├── 📄 FlowTrack_Documentation.pdf
│   └── 📁 screenshots/
│
├── 🔵 backend/
│   ├── 📄 Dockerfile                  # Node.js 20 container
│   ├── 📄 package.json
│   ├── 📄 server.js                   # Express app & middleware setup
│   ├── 📄 seed.js                     # Admin user seeder script
│   │
│   ├── 📁 config/
│   │   └── db.js                      # Mongoose connection
│   │
│   ├── 📁 middleware/
│   │   └── auth.js                    # protect · admin · adminOrTeamLead
│   │
│   ├── 📁 models/
│   │   ├── User.js                    # role: "admin" | "user"
│   │   ├── Team.js                    # unique name · teamLead ref
│   │   ├── Project.js                 # team · members · deadline · status
│   │   └── Task.js                    # status · rejectionReason · notes[]
│   │
│   ├── 📁 controllers/
│   │   ├── authController.js          # register · login · logout · getMe
│   │   ├── userController.js          # getAllUsers · updateRole · deleteUser
│   │   ├── teamController.js          # CRUD · addMember · removeMember
│   │   ├── projectController.js       # CRUD · removeMemberFromProject
│   │   └── taskController.js          # CRUD · submit · approve · reject · addNote
│   │
│   └── 📁 routes/
│       ├── authRoutes.js
│       ├── userRoutes.js
│       ├── teamRoutes.js
│       ├── projectRoutes.js
│       └── taskRoutes.js
│
└── 🟢 frontend/
    ├── 📄 Dockerfile                  # Node.js build container
    ├── 📄 vite.config.js              # Vite + Tailwind + dev proxy
    ├── 📄 package.json
    ├── 📄 index.html
    │
    └── 📁 src/
        ├── main.jsx                   # React DOM entry
        ├── App.jsx                    # Router · PrivateRoute · AdminRoute
        ├── App.css                    # Global CSS variables & base styles
        │
        ├── 📁 context/
        │   └── AuthContext.jsx        # user state · login · logout · isAdmin · isTeamLead
        │
        ├── 📁 utils/
        │   └── api.js                 # Axios (withCredentials · 401 interceptor)
        │
        ├── 📁 components/
        │   ├── Loading.jsx            # Full-page spinner
        │   ├── Navbar.jsx             # Top bar with user info
        │   ├── Sidebar.jsx            # Role-aware navigation links
        │   ├── StatusBadge.jsx        # Colored status/priority chip
        │   ├── TaskCard.jsx           # Task summary card + submit button
        │   └── PrivateRoute.jsx       # Auth guard wrapper
        │
        └── 📁 pages/
            ├── Login.jsx              # Login form
            ├── Register.jsx           # Registration (no auto-login)
            ├── Dashboard.jsx          # Stats overview + recent tasks
            ├── Teams.jsx              # Team listing
            ├── TeamDetail.jsx         # Team info + member management
            ├── CreateTeam.jsx         # ⚙️ Admin only
            ├── Projects.jsx           # Project listing + filters
            ├── ProjectDetail.jsx      # Project info + task list
            ├── CreateProject.jsx      # ⚙️ Admin only
            ├── Tasks.jsx              # Task listing with status/project filters
            ├── TaskDetail.jsx         # Full task view + approval UI
            ├── CreateTask.jsx         # ⚙️ Admin only
            ├── AdminPanel.jsx         # 🔑 User management
            └── Profile.jsx            # Update name, email, password
```

---

## 🎬 Application Demo

📹 **Demo Video**

> _[https://drive.google.com/file/d/1hdeGThs4qUiE7IEn46K5mFKAcriWTq2v/view?usp=sharing]_



## 🚀 Getting Started

### Prerequisites

| Tool | Minimum Version | Check |
|:-----|:---------------|:------|
| Docker | 24+ | `docker --version` |
| Docker Compose | 2.20+ | `docker compose version` |
| Node.js *(local dev only)* | 20+ | `node --version` |
| MongoDB *(local dev only)* | 6+ | `mongod --version` |

---

### 🐳 Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/Adarshsivantk/FlowTrack.git
cd FlowTrack

# 2. Start all containers
docker-compose up --build

# 3. Seed the admin user (in a new terminal)
docker exec -it api node seed.js

# 4. Open in browser
open http://localhost:5173
```

| 🔑 Default Admin Credentials | |
|:------------------------------|:--|
| **Email** | `admin@example.com` |
| **Password** | `123456` |

---

### 💻 Option 2: Local Development

```bash
# 1. Clone the repository
git clone https://github.com/Adarshsivantk/FlowTrack.git

# 2. Setup & start backend
cd FlowTrack/backend
npm install
npm run seed    # creates admin@example.com
npm run dev     # starts on http://localhost:8000

# 3. Setup & start frontend (new terminal)
cd ../frontend
npm install
npm run dev     # starts on http://localhost:5173
```

**Backend `.env` file** (`backend/.env`):
```env
PORT=8000
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://mongodb:27017/flowtrackDB
```

> 💡 **Tip:** For the fastest development workflow, run MongoDB + API in Docker and the frontend locally for hot-reload:
> ```bash
> docker-compose up mongodb api   # Docker for backend
> cd frontend && npm run dev      # Local for frontend (instant HMR)
> ```

---

## 🔑 Environment Variables

| Variable | Description | Example |
|:--------|:-----------|:--------|
| `PORT` | API server port | `8000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongodb:27017/flowtrackDB` |
| `JWT_SECRET` | Secret for signing JWTs | `your_super_secret_key_here` |
| `NODE_ENV` | Runtime environment | `development` / `production` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:5173` |

> ⚠️ **Security:** Never commit your `.env` file. Add `backend/.env` to `.gitignore`. Always replace the default `JWT_SECRET` with a long, random string in production.

---

## 🐳 Docker Deployment

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   frontend   │    │     api      │    │   mongodb    │
│  Vite:5173   │───►│  node:8000   │───►│  mongo:27017 │
│  port 5173   │    │              │    │  persistent  │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Commands Reference

```bash
# ── Start ──────────────────────────────────────────────────────
docker-compose up --build          # Full rebuild and start
docker-compose up --build api      # Rebuild backend only
docker-compose up --build ui       # Rebuild frontend only
docker-compose up -d               # Run in background (detached)

# ── Monitor ────────────────────────────────────────────────────
docker-compose logs -f             # All logs
docker-compose logs -f api         # Backend logs only
docker-compose ps                  # Container status

# ── Stop ───────────────────────────────────────────────────────
docker-compose down                # Stop containers
docker-compose down -v             # Stop + wipe database volume

# ── Utilities ──────────────────────────────────────────────────
docker exec -it api node seed.js                    # Seed admin user
docker exec -it mongodb mongosh flowtrackDB         # MongoDB shell
```

---

## 📡 API Reference

<details>
<summary><strong>🔐 Auth Routes — /api/auth</strong></summary>

| Method | Endpoint | Access | Description |
|:------:|:--------|:------:|:-----------|
| `POST` | `/register` | Public | Register a new user |
| `POST` | `/login` | Public | Login & set httpOnly cookie |
| `POST` | `/logout` | Protected | Clear auth cookie |
| `GET` | `/me` | Protected | Get current user + isTeamLead |
| `PUT` | `/profile` | Protected | Update name, email, password |

</details>

<details>
<summary><strong>👤 User Routes — /api/users</strong></summary>

| Method | Endpoint | Access | Description |
|:------:|:--------|:------:|:-----------|
| `GET` | `/` | Protected | Get all users |
| `GET` | `/:id` | Protected | Get user by ID |
| `PUT` | `/:id/role` | Admin | Update user role |
| `DELETE` | `/:id` | Admin | Delete user (non-admin only) |

</details>

<details>
<summary><strong>👥 Team Routes — /api/teams</strong></summary>

| Method | Endpoint | Access | Description |
|:------:|:--------|:------:|:-----------|
| `POST` | `/` | Admin | Create team |
| `GET` | `/` | Protected | Get teams (filtered by role) |
| `GET` | `/:id` | Protected | Get team by ID |
| `PUT` | `/:id` | Admin/Lead | Update team |
| `POST` | `/:id/add-member` | Admin/Lead | Add member |
| `POST` | `/:id/remove-member` | Admin/Lead | Remove member |
| `DELETE` | `/:id` | Admin | Delete team |

</details>

<details>
<summary><strong>📁 Project Routes — /api/projects</strong></summary>

| Method | Endpoint | Access | Description |
|:------:|:--------|:------:|:-----------|
| `POST` | `/` | Admin | Create project |
| `GET` | `/` | Protected | Get projects (filtered by role) |
| `GET` | `/:id` | Protected | Get project by ID |
| `PUT` | `/:id` | Admin | Update project |
| `POST` | `/:id/remove-member` | Admin | Remove project member |
| `DELETE` | `/:id` | Admin | Delete project |

</details>

<details>
<summary><strong>✅ Task Routes — /api/tasks</strong></summary>

| Method | Endpoint | Access | Description |
|:------:|:--------|:------:|:-----------|
| `GET` | `/dashboard-stats` | Protected | Dashboard statistics |
| `POST` | `/` | Admin | Create & assign task |
| `GET` | `/` | Protected | Get tasks (filtered by role) |
| `GET` | `/:id` | Protected | Get task by ID |
| `PUT` | `/:id` | Admin | Update task details |
| `PUT` | `/:id/status` | Protected | Update task status |
| `POST` | `/:id/submit` | Protected | Submit task for approval |
| `POST` | `/:id/approve` | **Admin only** | Approve task → Completed |
| `POST` | `/:id/reject` | **Admin only** | Reject task with reason |
| `POST` | `/:id/notes` | Protected | Add note to task |
| `DELETE` | `/:id` | Admin | Delete task |

</details>

---


---

## 🔮 Future Improvements

| # | 🚀 Feature | 📝 Description |
|:-:|:----------|:-------------|
| 1 | **Real-Time Notifications** | WebSocket (Socket.io) push alerts for task assignments, approvals & rejections |
| 2 | **File Attachments** | Upload files to tasks via AWS S3 or Cloudinary |
| 3 | **Analytics Dashboard** | Team velocity, completion rates, overdue trends, contributor performance |
| 4 | **GitHub Integration** | Link tasks to PRs; auto-update status on merge via webhooks |
| 5 | **Email Notifications** | Automated emails for assignments, deadlines & decisions (SendGrid) |
| 6 | **Time Tracking** | Log time per task; per-project and per-user time reports |
| 7 | **Two-Factor Auth (2FA)** | TOTP-based 2FA via Google Authenticator for admin accounts |
| 8 | **Audit Log** | Full system action history accessible to admins |
| 9 | **Multi-Language (i18n)** | Internationalisation via react-i18next |
| 10 | **Dark Mode** | System-aware and manually togglable dark theme |


---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/Adarshsivantk/FlowTrack.git

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make your changes and commit
git commit -m 'feat: add your feature description'

# 5. Push and open a Pull Request
git push origin feature/your-feature-name
```

Please follow [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:`, `refactor:`, etc.



<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=1E40AF&height=120&section=footer&text=FlowTrack&fontSize=30&fontColor=ffffff&fontAlignY=65" width="100%"/>

**Built with ❤️ using React · Express · Node.js · MongoDB · Docker**

*FlowTrack — Work, Track, Analyze.*

⭐ **Star this repo if you found it helpful!** ⭐

</div>
