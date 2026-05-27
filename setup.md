# Project Setup

This document explains how to set up and run this repository locally (backend, frontend, and mobile/web client). It assumes you're on Windows (developer machine), but commands for macOS/Linux are similar (activate virtualenv differently).

## Prerequisites
- Python 3.10+ (3.11 recommended)
- Node.js 16+ / 18+ and `npm` or `yarn`
- Git
- (Optional) Docker if you prefer containerized services

## Repository layout (relevant folders)
- `manage.py` — Django backend entrypoint
- `requirements.txt` — Python dependencies for backend
- `frontend/` — Vite React web frontend (install with `npm`/`yarn`)
- `mobile/` — app (check `package.json` in that folder for details)
- `staticfiles/`, `media/` — static & uploaded media content

---

## Backend (Django) setup

1. Create and activate a virtual environment

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1   # PowerShell
# or .venv\Scripts\activate.bat  # cmd.exe
```

2. Install Python dependencies

```powershell
pip install -r requirements.txt
```

3. Environment variables

- Create a `.env` file at the project root (or provide env vars to your environment). The project reads settings from `config/settings.py` — adjust as needed.

Example `.env` (adjust values):

```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
# DATABASE settings: use DATABASE_URL or configure settings.py
# e.g. for PostgreSQL: DATABASE_URL=postgres://user:pass@localhost:5432/dbname

# Optional Cloudinary or storage variables if used
# CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

4. Database migrations

```powershell
python manage.py migrate
```

5. Create a superuser (admin)

```powershell
python manage.py createsuperuser
```

6. Run the development server

```powershell
python manage.py runserver
```

Notes:
- If you are using a different DB (Postgres), ensure the DB server is running and `DATABASE_URL` or `DATABASES` in `config/settings.py` is configured.
- To collect static files for production: `python manage.py collectstatic` (configure `STATIC_ROOT`).

---

## Frontend (web) setup — `frontend/`

1. Install dependencies

```powershell
cd frontend
npm install
# or yarn
```

2. Run the dev server (Vite)

```powershell
npm run dev
# default Vite port is 5173 (check output)
```

3. Build for production

```powershell
npm run build
# serve with a static host or a simple server
```

4. API base URL

- The frontend calls the backend API. Open `frontend/src/api/axios.js` and/or `frontend/package.json` env overrides to point to your Django dev server (e.g. `http://localhost:8000`). There may be environment variables in the frontend (e.g., `VITE_API_URL`).

---

## Mobile / app (folder: `mobile/`)

The `mobile/` folder contains a TypeScript React app. Check `mobile/package.json` for exact scripts (it may be a Next.js app or Expo-managed app). General steps:

```powershell
cd mobile
npm install
npm run dev
# or `expo start` if this is an Expo app — check package.json scripts
```

If the app expects a running API server, point its config/env to the backend URL.

---

## Running tests

- Backend Django tests:

```powershell
python manage.py test
```

- Frontend tests: see `frontend/package.json` for test scripts (e.g., `npm test`).

---

## Common troubleshooting

- Port conflicts: make sure Django (8000) and Vite (5173) ports are free.
- Virtual environment: confirm you activated the same Python environment where you installed dependencies.
- Node version: use the Node version required by the frontend/mobile — mismatched versions can break the dev server.
- Missing `.env`: if features fail (e.g., external storage), verify required env vars are present.

---

## Next steps / notes for contributors

- If you plan to run locally with Postgres or other services, consider adding a `docker-compose.yml` for DB and other services.
- Add a `.env.example` with safe example values to document required env vars.
- If you want, I can add a `Makefile` or PowerShell script to automate the common setup steps.

---

If anything here needs tailoring (e.g., exact env var names used by `config/settings.py`, or mobile is an Expo app), tell me and I will update this document accordingly.
