# PodWave - Sharing Checklist

## BEFORE Sharing (Do These)

### 1. Stop All Running Processes
Close any terminals running `npm run dev`

### 2. Delete These Folders (They Will Be Reinstalled)
These folders are LARGE and should NOT be shared:
- [ ] `admin-system/client/node_modules/`
- [ ] `admin-system/server/node_modules/`
- [ ] `editor-system/node_modules/`
- [ ] `editor-system/.next/`
- [ ] `public-system/client/node_modules/`
- [ ] `public-system/server/node_modules/`

### 3. Delete These Files (Sensitive/Generated)
- [ ] `admin-system/server/.env` (keep `.env.example`)
- [ ] Any `.env` files (keep `.env.example` files)
- [ ] `package-lock.json` files (optional, will regenerate)

### 4. Keep These Important Files
- ✅ `SETUP_GUIDE.md` - Instructions for setup
- ✅ `admin-system/server/database/schema.sql` - Database schema
- ✅ All `.env.example` files
- ✅ `design-reference/` folder - Design mockups
- ✅ All `package.json` files

---

## Folder Size After Cleanup

| Folder | Approximate Size |
|--------|------------------|
| Before cleanup (with node_modules) | ~500 MB - 1 GB |
| After cleanup (without node_modules) | ~5-10 MB |

---

## How to Share

### Option 1: Google Drive (Recommended)
1. Delete `node_modules` folders
2. Delete `.env` files (keep `.env.example`)
3. Right-click folder → Send to → Compressed (zipped) folder
4. Upload zip to Google Drive
5. Share link with your teammate

### Option 2: GitHub
1. Create new repository
2. Push code (`.gitignore` will exclude node_modules)
3. Share repository link

---

## What Your Teammate Needs to Do

### Step 1: Download and Extract
1. Download from Google Drive
2. Extract zip file
3. Open folder in VS Code

### Step 2: Install Node.js
Download from: https://nodejs.org/
Choose LTS version

### Step 3: Install Dependencies
Open terminal and run:
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
```

### Step 4: Install MySQL (for Admin Backend)
1. Download XAMPP: https://www.apachefriends.org/
2. Install XAMPP
3. Open XAMPP Control Panel
4. Start MySQL

### Step 5: Create Database
```powershell
# Using XAMPP MySQL
C:\xampp\mysql\bin\mysql.exe -u root < admin-system/server/database/schema.sql
```

### Step 6: Create Environment Files
Copy `.env.example` to `.env` in:
- `admin-system/server/.env`
- `editor-system/.env.local` (for Supabase - later phase)
- `public-system/server/.env` (for MongoDB - later phase)

### Step 7: Run the Project
```powershell
# Admin Frontend (Terminal 1)
cd admin-system/client
npm run dev

# Admin Backend (Terminal 2)
cd admin-system/server
npm run dev

# Editor System (Terminal 3)
cd editor-system
npm run dev

# Public Frontend (Terminal 4)
cd public-system/client
npm run dev
```

### Step 8: Open in Browser
- Admin: http://localhost:3001
- Editor: http://localhost:3002
- Public: http://localhost:3003
- Admin API: http://localhost:4001/api/health

---

## Quick Install Script (PowerShell)

Save as `install-all.ps1` and run:
```powershell
Write-Host "Installing Admin Frontend..."
Set-Location admin-system/client
npm install

Write-Host "Installing Admin Backend..."
Set-Location ../server
npm install

Write-Host "Installing Editor System..."
Set-Location ../../editor-system
npm install

Write-Host "Installing Public Frontend..."
Set-Location ../public-system/client
npm install

Write-Host "Installing Public Backend..."
Set-Location ../server
npm install

Write-Host "All dependencies installed!"
Set-Location ../..
```

---

## Files Summary

### Total Files Created/Modified:
- **Admin Frontend**: 18 Vue/JS/CSS files
- **Admin Backend**: 10 JS/SQL files
- **Editor Frontend**: 14 JS/CSS files
- **Public Frontend**: 12 Vue/JS/CSS files
- **Public Backend**: 1 JS file (basic)
- **Database Schema**: 1 SQL file
- **Documentation**: README.md, SETUP_GUIDE.md, this file

### Lines of Code (Approximate):
- Admin Frontend: ~2,500 lines
- Admin Backend: ~1,200 lines
- Editor Frontend: ~1,800 lines
- Public Frontend: ~2,200 lines
- Total: ~7,700+ lines
