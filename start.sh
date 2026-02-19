#!/bin/bash

echo "Starting Resume Builder..."

# Start the backend server
cd backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start the frontend dev server
cd ..
npm run dev &
FRONTEND_PID=$!

echo "Backend running on port 8000 (PID: $BACKEND_PID)"
echo "Frontend running on port 5000 (PID: $FRONTEND_PID)"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
