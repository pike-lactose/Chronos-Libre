-- Chronos Libre — Database Schema
-- Run this in Supabase SQL Editor

-- Encrypted reading history (server sees only ciphertext)
CREATE TABLE IF NOT EXISTS history (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ciphertext   TEXT NOT NULL,          -- AES-GCM encrypted FeedItem JSON (base64)
    iv           TEXT NOT NULL,          -- 12-byte random nonce (base64)
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Encrypted bookmarks (same pattern)
CREATE TABLE IF NOT EXISTS bookmarks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ciphertext   TEXT NOT NULL,
    iv           TEXT NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: users can only access their own rows
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- History policies
CREATE POLICY "Users read own history" ON history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own history" ON history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own history" ON history
    FOR DELETE USING (auth.uid() = user_id);

-- Bookmark policies
CREATE POLICY "Users read own bookmarks" ON bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own bookmarks" ON bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own bookmarks" ON bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
