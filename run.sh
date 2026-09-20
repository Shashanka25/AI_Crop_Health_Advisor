#!/usr/bin/env bash
# Start the backend and serve the app from one place.
set -e
cd "$(dirname "$0")"

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "ANTHROPIC_API_KEY is not set — the app will fall back to sample cases."
  echo "  export ANTHROPIC_API_KEY=sk-ant-..."
  echo
fi

python3 -m pip install -q -r backend/requirements.txt
echo "Patta running on http://127.0.0.1:8000"
exec python3 -m uvicorn backend.main:app --reload --port 8000
