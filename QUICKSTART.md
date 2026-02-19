# Quick Start Guide - Run Locally

## Prerequisites Check

Make sure you have installed:
- ✅ **Node.js 20+** - Check: `node --version`
- ✅ **Python 3.11+** - Check: `python --version` or `python3 --version`
- ✅ **Docker Desktop** (for PostgreSQL database)

## Step-by-Step Setup

### 1. Install Frontend Dependencies

Open PowerShell/Terminal in the project root:

```powershell
npm install
```

This installs all React/Vite dependencies.

### 2. Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
cd ..
```

**Note:** If you have both `python` and `python3`, use `python3` instead.

### 3. Create Environment File

Create a `.env` file in the root directory:

```powershell
# Copy from example (if exists) or create new
New-Item -Path .env -ItemType File
```

Add this content to `.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/resume_builder
VITE_API_URL=http://localhost:8000
```

### 4. Start PostgreSQL Database

```powershell
docker-compose up db -d
```

This starts PostgreSQL in the background. Verify it's running:

```powershell
docker ps
```

You should see a `postgres:15` container running.

### 5. Start Backend API (Terminal 1)

Open a **new terminal** and run:

```powershell
cd backend
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test the backend:** Open http://localhost:8000/api/health in your browser. You should see:
```json
{"status": "healthy", "database": "configured"}
```

### 6. Start Frontend (Terminal 2)

Open **another terminal** (keep backend running) and run:

```powershell
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5000/
  ➜  Network: use --host to expose
```

### 7. Open in Browser

Open **http://localhost:5000** in your browser.

The frontend will automatically proxy API requests to `http://localhost:8000`.

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.11+)
- Check if port 8000 is free: `netstat -ano | findstr :8000`
- Try: `python -m uvicorn app.main:app --reload --port 8000`

### Frontend won't start
- Check Node version: `node --version` (need 20+)
- Check if port 5000 is free: `netstat -ano | findstr :5000`
- Delete `node_modules` and reinstall: `rm -r node_modules && npm install`

### Database connection issues
- Make sure Docker is running: `docker ps`
- Check if PostgreSQL is up: `docker-compose ps`
- Restart database: `docker-compose restart db`

### CORS errors
- Make sure backend is running on port 8000
- Check `VITE_API_URL` in `.env` matches backend URL

## Stop Everything

1. **Stop Frontend:** Press `Ctrl+C` in Terminal 2
2. **Stop Backend:** Press `Ctrl+C` in Terminal 1
3. **Stop Database:** `docker-compose down`

## Quick Commands Reference

```powershell
# Install everything
npm install
cd backend && pip install -r requirements.txt && cd ..

# Start database
docker-compose up db -d

# Start backend (Terminal 1)
cd backend
uvicorn app.main:app --reload --port 8000

# Start frontend (Terminal 2)
npm run dev

# Stop database
docker-compose down
```
