# Resume Builder

A full-stack resume builder application with Python FastAPI backend and React frontend.

## 🏗️ Architecture

- **Backend**: Python FastAPI (`backend/`)
- **Frontend**: React + Vite + TypeScript (`client/`)
- **Shared**: TypeScript types and schemas (`shared/`)
- **Database**: PostgreSQL (via Docker)

## 📁 Project Structure

```
resume-builder/
├── backend/          # Python FastAPI backend
│   ├── app/
│   │   └── main.py  # FastAPI application
│   ├── Dockerfile
│   └── requirements.txt
├── client/           # React frontend
│   ├── src/
│   └── index.html
├── shared/           # Shared TypeScript types/schemas
├── script/           # Build scripts
├── docker-compose.yml
├── package.json      # Frontend dependencies
└── vite.config.ts    # Vite configuration with API proxy
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose (for database)

### Local Development

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/resume_builder
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the database:**
   ```bash
   docker-compose up db -d
   ```

5. **Start the backend (in one terminal):**
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

6. **Start the frontend (in another terminal):**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5000` and will proxy API requests to `http://localhost:8000`.

### Docker Development

Run everything with Docker Compose:

```bash
docker-compose up
```

This will start:
- Backend API on `http://localhost:8000`
- Frontend on `http://localhost:5000`
- PostgreSQL database on `localhost:5432`

## 📝 Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run check` - Type check TypeScript
- `npm run db:push` - Push database schema changes (Drizzle)

## 🔧 Configuration

### Vite Proxy

The Vite dev server proxies `/api/*` requests to the Python backend. Configure via `VITE_API_URL` environment variable (defaults to `http://localhost:8000`).

### Database

Uses Drizzle ORM for schema management. Schema definitions are in `shared/schema.ts`. Run migrations with:

```bash
npm run db:push
```

## 🚢 Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. The built files will be in `dist/public/`

3. Configure your production backend to serve static files from `dist/public/`

## 📦 Tech Stack

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Radix UI components
- TanStack Query
- Wouter (routing)
- Zod (validation)

### Backend
- FastAPI
- Python 3.11
- SQLAlchemy
- PostgreSQL

## 🔐 Git Setup

To initialize Git and push to GitLab:

1. **Initialize repository:**
   ```bash
   git init
   git config user.name "Your Name"
   git config user.email "your.email@example.com"
   ```

2. **Add files and commit:**
   ```bash
   git add .
   git commit -m "Initial commit: Resume Builder with Python FastAPI backend"
   ```

3. **Add GitLab remote:**
   ```bash
   git remote add origin https://gitlab.com/akshaygoswami87/resume-builder.git
   git branch -M main
   git push -u origin main
   ```

## 📄 License

MIT
