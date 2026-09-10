# Chronos Libre

A zero-knowledge world monitoring app that aggregates scientific papers and news into a unified feed.

## Features

- Unified feed from Semantic Scholar + NewsAPI
- Client-side AES-GCM encryption for history and bookmarks
- Zero-knowledge: server never sees plaintext
- Sentence truncation with expand/collapse
- Keyword highlighting for skimming
- Filter tabs: All / News / Research
- Debounced search

## Setup

### 1. Supabase

1. Create a Supabase project
2. Run `supabase/schema.sql` in SQL Editor
3. Copy your URL and keys to the env files

### 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in your API keys
pip install -r requirements.txt
python app.py
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Fill in Supabase URL and anon key
npm install
npm run dev
```

## Environment Variables

**Backend (.env)**
- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_SERVICE_KEY` — Service role key (keep secret)
- `SEMANTIC_SCHOLAR_API_KEY` — Get at https://www.semanticscholar.org/product/api
- `NEWS_API_KEY` — Get at https://newsapi.org

**Frontend (.env)**
- `VITE_API_URL` — Backend URL (default: http://localhost:5000)
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

## Security

- All history and bookmarks are encrypted client-side with AES-GCM-256
- Key derived from password via PBKDF2 (600k iterations)
- Server stores only ciphertext — cannot decrypt even with full DB access
- Losing your password = losing your history (by design)
