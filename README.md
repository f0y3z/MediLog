# MediLog

MediLog is a personal health workspace for clinical visits, lab reports, symptom history, timeline review, and AI-assisted health insights.

## Run Locally

Use three terminals.

### 1. Backend API

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 manage.py migrate
python3 manage.py runserver
```

The API runs on `http://127.0.0.1:8000/api/`.

### 2. Redis And Celery

```bash
sudo systemctl start redis-server
cd backend
source venv/bin/activate
celery -A config worker --loglevel=info
```

Celery processes uploaded prescriptions and lab reports.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL, usually `http://127.0.0.1:5173/`.

## Environment

Create `backend/.env` for AI parsing:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## Notes

- The local frontend proxies `/api` to `http://127.0.0.1:8000`.
- Users only see their own visits, reports, symptoms, timeline, and intelligence data.
- After clearing the database, create a new account from the frontend.

More backend details are in [backend/README.md](backend/README.md).
