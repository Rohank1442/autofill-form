#!/usr/bin/env bash
source ./venv/bin/activate
export $(cat .env | xargs)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload