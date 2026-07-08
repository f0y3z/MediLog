# MediLog Backend

## Requirements

- Python 3.12+
- Redis server
- Node.js 20+ for the frontend
- A Gemini API key for AI parsing and intelligence features

## Backend Setup

From `backend/`:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Apply database migrations:

```bash
python3 manage.py migrate
```

Run the API server:

```bash
python3 manage.py runserver
```

The API runs at `http://127.0.0.1:8000/api/`.

## Redis And Celery

In a separate terminal:

```bash
sudo systemctl start redis-server
```

With the backend virtual environment active, start Celery:

```bash
celery -A config worker --loglevel=info
```

Celery is needed for prescription and lab report parsing. The app still runs without it, but uploaded files will stay in a pending state.

## Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://127.0.0.1:5173/`.

Local frontend requests to `/api` are proxied to Django at `http://127.0.0.1:8000`.

## Clean Local Data

From the project root, clear local users, visits, reports, symptoms, and sessions while keeping the database schema:

```bash
sqlite3 backend/db.sqlite3 "PRAGMA foreign_keys=OFF; DELETE FROM django_admin_log; DELETE FROM django_session; DELETE FROM clinical_testsordered; DELETE FROM clinical_prescription; DELETE FROM labreports_labreport; DELETE FROM symptoms_symptomlog; DELETE FROM clinical_doctorvisit; DELETE FROM users_user_groups; DELETE FROM users_user_user_permissions; DELETE FROM users_user; DELETE FROM sqlite_sequence WHERE name IN ('django_admin_log','django_session','clinical_testsordered','clinical_prescription','labreports_labreport','symptoms_symptomlog','clinical_doctorvisit','users_user_groups','users_user_user_permissions','users_user'); PRAGMA foreign_keys=ON; VACUUM;"
```

After clearing users, sign up again from the frontend.
