# SuriCare - Child Health Monitoring Application

A comprehensive child health monitoring application for parents and caregivers.

## 🚀 Quick Start (Demo)

```bash
# Install dependencies
npm run install-all

# Start demo (both frontend and backend)
npm run demo
```

**Demo Login:**
- Email: `admin@suricare.com`
- Password: `admin123!`

## 📋 Available Commands

```bash
# Development
npm run dev          # Start both frontend and backend
npm run demo         # Start demo with login info displayed
npm run frontend     # Start only frontend (port 3000)
npm run backend      # Start only backend (port 8000)

# Setup
npm run install-all  # Install all dependencies
npm run setup        # Full setup (install + admin user)

# Admin utilities
npm run admin status # Check admin setup
npm run admin setup  # Create admin user
npm run admin reset  # Reset admin user

# Build
npm run build        # Build frontend for production
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Admin Panel**: Use `npm run admin` commands

## 🏗️ Architecture

- **Frontend**: Vue 3 + Vuetify 3 + TypeScript
- **Backend**: FastAPI Python
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: Google Gemini integration

## 🔧 Requirements

- Node.js 18+
- Python 3.8+
- Supabase account
- Environment variables configured

## 📁 Project Structure

```
SuriCare/
├── frontend/           # Vue.js frontend
│   ├── src/
│   ├── admin/         # Admin utilities
│   └── package.json
├── backend/           # FastAPI backend
│   └── app/
├── package.json       # Root package manager
└── README.md
```

## 🎬 Demo Preparation

1. **One-time setup:**
   ```bash
   npm run setup
   ```

2. **Start demo:**
   ```bash
   npm run demo
   ```

3. **Open browser:** http://localhost:3000

4. **Login** with admin credentials shown in terminal

That's it! 🎉

## 👥 Team

- Wei Ching
- Ong KS
- Pui Sim
- Zaid
- Zamil

*Gamuda Academy Project*
