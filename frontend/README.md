# 🚀 NASA Near-Earth Orbit (NEO) Full Stack Dashboard

A full-stack space data explorer using FastAPI (backend) and React + Material UI (frontend).

---

## 🔧 Backend Setup (FastAPI)

### 1️⃣ Install Python (use Python 3.11.x)
- [Download Python 3.11](https://www.python.org/downloads/release/python-31113/)
- ✅ Add to PATH during install.

### 2️⃣ Setup virtual environment
```bash
cd backend
python -m venv venv
# Activate venv (Windows)
venv\Scripts\activate
# or (Mac/Linux)
source venv/bin/activate
```

### 3️⃣ Install dependencies
```bash
pip install -r requirements.txt
```

### 4️⃣ Setup environment variables
Create a `.env` file in `backend/`:
```env
NASA_API_KEY=your_nasa_api_key_here
DB_NAME=nasa_dashboard
MONGO_URL=mongodb://localhost:27017
```

### 5️⃣ Start backend server
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```
- Access docs at: http://localhost:8000/docs

---

## 🔧 Frontend Setup (React + MUI)

### 1️⃣ Install Node.js
- [Download Node.js LTS](https://nodejs.org/en)
- ✅ Verify: `node -v` and `npm -v`

### 2️⃣ Setup React project
```bash
cd frontend
npm install
```

### 3️⃣ Setup frontend environment variables
Create a `.env` file in `frontend/`:
```env
VITE_BACKEND_URL=http://localhost:8000
```

### 4️⃣ Start frontend dev server
```bash
npm run dev
```
- App runs at: http://localhost:5173

---

## ✅ Project Structure

```bash
frontend/src/
  App.jsx
  main.jsx
  api/nasaApi.js
  components/
    Dashboard.jsx
    NEODashboard.jsx
    MarsExplorer.jsx
    APODExplorer.jsx
backend/
  server.py
  models.py
  requirements.txt
  .env
```

---

✅ Fully MUI-powered, modular, scalable NASA dashboard!

---

Happy coding! 🚀
