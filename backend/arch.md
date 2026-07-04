medilog_project/
│
├── core/                       # Project configuration (settings.py, urls.py, celery.py)
│
└── apps/                       # Custom apps directory
    ├── users/                  # Auth, Profiles
    ├── clinical/               # Visits, Prescriptions, Tests Ordered
    ├── diagnostics/            # Lab Reports, JSON Metrics
    ├── tracking/               # Symptom Logs
    └── intelligence/           # Gemini Integration, Celery Tasks, Health Suggestions
