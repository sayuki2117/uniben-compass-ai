# Backend Setup

## 1. Open Git Bash

```bash
cd ~/Desktop/FULL-STACK-AI/uniben-compass-ai/backend
```

## 2. Create Virtual Environment

```bash
py -3.11 -m venv .venv
```

If `py -3.11` does not work, try:

```bash
python -m venv .venv
```

## 3. Activate Virtual Environment

```bash
source .venv/Scripts/activate
```

## 4. Install Dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 5. Create Environment File

```bash
cp .env.example .env
```

Then fill in your API keys inside `.env`.

## 6. Run Backend

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8005
```

Open:

```text
http://localhost:8005/docs
```

## 7. Ingest Knowledge Base

After Supabase and OpenAI are configured:

```bash
python scripts/ingest_knowledge.py
```

