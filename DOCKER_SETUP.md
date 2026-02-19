# Docker Setup - Run Everything with Docker

## ✅ What I've Done For You

1. ✅ Created `.env` file with correct Docker configuration
2. ✅ Updated `docker-compose.yml` (removed obsolete version field)
3. ✅ All Dockerfiles are ready (backend & frontend)

## 🚀 How to Run (One Command!)

**Make sure Docker Desktop is running first!**

Then run:

```powershell
docker-compose up --build
```

This will:
- ✅ Build backend container (installs Python dependencies automatically)
- ✅ Build frontend container (installs Node dependencies automatically)
- ✅ Start PostgreSQL database
- ✅ Start all services

## 📍 Access Your App

- **Frontend:** http://localhost:5000
- **Backend API:** http://localhost:8000
- **API Health Check:** http://localhost:8000/api/health

## 🛑 Stop Everything

Press `Ctrl+C` in the terminal, or run:

```powershell
docker-compose down
```

## 🔍 Check Status

```powershell
docker-compose ps
```

## 📋 View Logs

```powershell
# All services
docker-compose logs

# Just frontend
docker-compose logs frontend

# Just backend
docker-compose logs backend

# Follow logs (live)
docker-compose logs -f
```

## 🔄 Rebuild After Changes

If you change dependencies:

```powershell
docker-compose up --build
```

## ⚠️ Troubleshooting

### Docker Desktop Not Running
- Open Docker Desktop application
- Wait for it to fully start (whale icon in system tray)

### Port Already in Use
- Check what's using the port: `netstat -ano | findstr :5000`
- Stop the conflicting service or change ports in `docker-compose.yml`

### Containers Won't Start
- Check logs: `docker-compose logs`
- Rebuild: `docker-compose up --build --force-recreate`

## 🎯 Benefits of Docker

✅ **No local Python/Node installation needed**  
✅ **Consistent environment** (works same on all machines)  
✅ **Isolated dependencies** (doesn't pollute your system)  
✅ **Easy cleanup** (just `docker-compose down`)  
✅ **Hot reload** (code changes reflect automatically)
