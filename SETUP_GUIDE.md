# PodWave Project - Setup Guide

## Project Overview
PodWave is a podcast directory and player platform with **THREE separate subsystems**:
- **Admin System**: React + Vite (frontend), Express.js (backend), MySQL
- **Editor System**: Next.js + Supabase PostgreSQL
- **Public User System**: Vue 3 + Vite (frontend), Express.js (backend), MongoDB Atlas

---

## Prerequisites (Must Install Before Running)

### 1. Node.js (Required for ALL systems)
- Download from: https://nodejs.org/
- Install **LTS version** (v20 or higher recommended)
- Verify installation:
  ```powershell
  node --version
  npm --version
  ```

### 2. MySQL (Required for Admin System)
- **Option A: XAMPP** (Recommended for Windows)
  - Download from: https://www.apachefriends.org/
  - Install and start MySQL from XAMPP Control Panel
  
- **Option B: MySQL Community Server**
  - Download from: https://dev.mysql.com/downloads/mysql/

### 3. MongoDB (Required for Public System - Phase 6+)
- **Option A: MongoDB Atlas** (Cloud - Recommended)
  - Create free account at: https://www.mongodb.com/atlas
  - Create a cluster and get connection string
  
- **Option B: Local MongoDB**
  - Download from: https://www.mongodb.com/try/download/community

### 4. Supabase Account (Required for Editor System - Phase 6+)
- Create free account at: https://supabase.com/
- Create a new project and get API credentials

---

## Installation Steps

### Step 1: Copy Project Folder
Copy the entire `podwave_project` folder to the new computer.

### Step 2: Install Dependencies for Each System

Open terminal in the project root and run:

```powershell
# Admin Frontend
cd admin-system/client
npm install

# Admin Backend
cd ../server
npm install

# Editor System
cd ../../editor-system
npm install

# Public Frontend
cd ../public-system/client
npm install

# Public Backend
cd ../server
npm install

# Go back to project root
cd ../..
```

### Step 3: Configure Environment Variables

#### Admin Backend (.env)
Create file: `admin-system/server/.env`
```env
ADMIN_PORT=4001
ADMIN_CLIENT_URL=http://localhost:3001
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=podwave_admin
JWT_SECRET=local_dev_secret_change_later
ADMIN_JWT_SECRET=replace_with_long_random_string
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=replace_with_bcrypt_hash
JWT_EXPIRES_IN=8h
SERVICE_TOKEN=replace_with_another_long_random_string
EDITOR_API_URL=http://localhost:3002
ADMIN_TO_EDITOR_SERVICE_TOKEN=local_admin_editor_token
```

Generate the admin password hash with:

```powershell
cd admin-system/server
node -e "require('bcryptjs').hash('yourpassword',10).then(console.log)"
```

#### Editor System (.env)
Create file: `editor-system/.env`
```env
NEXT_PUBLIC_EDITOR_APP_URL=http://localhost:3002
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_server_only
EDITOR_USERNAME=editor
EDITOR_PASSWORD_HASH=replace_with_bcrypt_hash
EDITOR_JWT_SECRET=replace_with_secure_editor_jwt_secret
EDITOR_JWT_EXPIRES_IN=8h
ADMIN_TO_EDITOR_SERVICE_TOKEN=local_admin_editor_token
PUBLIC_API_URL=http://localhost:4003
EDITOR_TO_PUBLIC_SERVICE_TOKEN=local_editor_public_token
```

#### Public Backend (.env)
Create file: `public-system/server/.env`
```env
PUBLIC_PORT=4003
PUBLIC_CLIENT_URL=http://localhost:3003
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/podwave_public
PUBLIC_JWT_SECRET=replace_with_secure_public_jwt_secret
PUBLIC_JWT_EXPIRES_IN=30d
EDITOR_TO_PUBLIC_SERVICE_TOKEN=local_editor_public_token
```

### Step 4: Setup MySQL Database (Admin System)

#### Using XAMPP/phpMyAdmin:
1. Start XAMPP Control Panel
2. Start Apache and MySQL
3. Open browser: http://localhost/phpmyadmin
4. Click "New" → Create database named `podwave_admin`
5. Select the database → Go to "Import" tab
6. Import file: `admin-system/server/database/schema.sql`

#### Using MySQL CLI:
```powershell
mysql -u root -p < admin-system/server/database/schema.sql
```

---

## Running the Project

### Current Phase (Phase 6B) - Frontend Only

The frontend systems work with mock data. Run them separately:

#### Admin Frontend (Port 3001):
```powershell
cd admin-system/client
npm run dev
```
Open: http://localhost:3001

#### Editor System (Port 3002):
```powershell
cd editor-system
npm run dev
```
Open: http://localhost:3002

#### Public Frontend (Port 3003):
```powershell
cd public-system/client
npm run dev
```
Open: http://localhost:3003

#### Admin Backend (Port 4001):
```powershell
cd admin-system/server
npm run dev
```
Test: http://localhost:4001/api/health

---

## Project Structure

```
podwave_project/
├── admin-system/
│   ├── client/           # React + Vite frontend (Port 3001)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── dashboard/
│   │   │   │   └── layout/
│   │   │   ├── data/
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── server/           # Express.js backend (Port 4001)
│       ├── src/
│       │   ├── controllers/
│       │   ├── db/
│       │   ├── middleware/
│       │   ├── routes/
│       │   ├── utils/
│       │   └── index.js
│       ├── database/
│       │   └── schema.sql
│       ├── package.json
│       ├── .env.example
│       └── .env          # (Create from .env.example)
│
├── editor-system/        # Next.js app (Port 3002)
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   └── layout/
│   │   ├── data/
│   │   ├── layout.js
│   │   └── page.js
│   ├── package.json
│   └── .env.example
│
├── public-system/
│   ├── client/           # Vue 3 + Vite frontend (Port 3003)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── dashboard/
│   │   │   │   └── layout/
│   │   │   ├── data/
│   │   │   ├── App.vue
│   │   │   ├── main.js
│   │   │   └── style.css
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── server/           # Express.js backend (Port 4003)
│       ├── src/
│       │   └── index.js
│       ├── package.json
│       └── .env.example
│
├── design-reference/     # HTML design mockups (DO NOT MODIFY)
│   ├── admin_desktop.html
│   ├── admin_mobile.html
│   ├── editor_desktop.html
│   ├── editor_mobile.html
│   ├── public_desktop.html
│   └── public_mobile.html
│
├── docs/
├── README.md
└── .gitignore
```

---

## Current Status (As of Phase 6B)

| System | Frontend | Backend | Database | Status |
|--------|----------|---------|----------|--------|
| Admin | ✅ Complete (mock data) | ✅ Complete | ⚠️ MySQL needed | Phase 6B |
| Editor | ✅ Complete (mock data) | ❌ Not started | ⚠️ Supabase needed | Phase 5 |
| Public | ✅ Complete (mock data) | ✅ Basic | ⚠️ MongoDB needed | Phase 5B |

### What Works Now (Without Database):
- ✅ Admin Frontend UI - All components, navigation, mock data
- ✅ Editor Frontend UI - All components, navigation, mock data
- ✅ Public Frontend UI - All components, podcast detail, mock data
- ✅ Admin Backend API - Health endpoints, RSS URL validation
- ✅ Admin Backend Security - Rate limiting, CORS, Helmet, input validation

### What Needs Database:
- ⚠️ Admin: Feed management, job tracking, statistics
- ⚠️ Editor: Content management (needs Supabase)
- ⚠️ Public: Real podcast data (needs MongoDB)

---

## Ports Reference

| Service | Port |
|---------|------|
| Admin Frontend | 3001 |
| Admin Backend | 4001 |
| Editor System | 3002 |
| Public Frontend | 3003 |
| Public Backend | 4003 |
| MySQL | 3306 |
| MongoDB | 27017 |

---

## Troubleshooting

### "npm not found"
- Install Node.js from https://nodejs.org/

### "Port 3001/3002/3003 already in use"
```powershell
# Find process using port
netstat -ano | findstr :3001
# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

### "MySQL connection failed"
- Ensure MySQL is running in XAMPP Control Panel
- Check credentials in `admin-system/server/.env`

### "Module not found" errors
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## Next Steps After Setup

1. **Phase 7**: Connect Admin frontend to backend API
2. **Phase 8**: Editor backend + Supabase
3. **Phase 9**: Public backend + MongoDB
4. **Phase 10**: Cross-system integration
5. **Phase 11**: Testing and polish

---

## Contact
If you encounter issues, check:
1. All dependencies are installed (`npm install` in each folder)
2. Environment files are created (`.env` files)
3. Database is running (MySQL for Admin)
4. Correct ports are available
