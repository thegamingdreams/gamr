# YoungFounder AI

A React + Vite MVP for a teen founder operating system. The app ranks 180 teen-friendly business paths, lets a user lock one path, and focuses the dashboard, AI coach, tools, CRM, finance tracker, goals, notes, XP, and achievements around that path.

## Run locally

```bash
npm install
npm install express cors ollama
node server/index.js
npm run dev
```

The backend defaults to `http://localhost:5050` and uses Ollama model `llama3:8b`. Set `OLLAMA_MODEL` to override.

If Ollama is unavailable, `/recommend`, `/chat`, and `/generate` return deterministic fallback responses so the MVP remains usable.
