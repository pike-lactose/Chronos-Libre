import { useState, useEffect, useCallback } from "react";
import SearchBar from "./components/SearchBar";
import FilterTabs from "./components/FilterTabs";
import FeedCard from "./components/FeedCard";
import { fetchFeed, fetchTrending } from "./api";
import { deriveKey, encrypt, decrypt } from "./crypto";

export default function FeedPage({ session, cryptoKey }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("technology");
  const [source, setSource] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeed(query, source);
      setItems(data.items || []);
      if (data.errors?.length) {
        setError(data.errors.map((e) => e.error).join("; "));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [query, source]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleSave = async (item) => {
    if (!session || !cryptoKey) return;
    try {
      const { ciphertext, iv } = await encrypt(cryptoKey, JSON.stringify(item));
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ciphertext, iv }),
      });
      if (res.ok) {
        setSavedIds((prev) => new Set(prev).add(item.source_id));
      }
    } catch (e) {
      console.error("Save failed:", e);
    }
  };

  const handleBookmark = async (item) => {
    if (!session || !cryptoKey) return;
    try {
      const { ciphertext, iv } = await encrypt(cryptoKey, JSON.stringify(item));
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ciphertext, iv }),
      });
      if (res.ok) {
        setBookmarkedIds((prev) => new Set(prev).add(item.source_id));
      }
    } catch (e) {
      console.error("Bookmark failed:", e);
    }
  };

  return (
    <div className="feed-page">
      <h1>Chronos Libre</h1>
      <p className="subtitle">World Monitor — Research & News</p>

      <SearchBar onSearch={(q) => setQuery(q)} />
      <FilterTabs active={source} onChange={setSource} />

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">Error: {error}</p>}

      <div className="feed-list">
        {items.map((item) => (
          <FeedCard
            key={item.source_id}
            item={item}
            onSave={handleSave}
            onBookmark={handleBookmark}
            isSaved={savedIds.has(item.source_id)}
            isBookmarked={bookmarkedIds.has(item.source_id)}
          />
        ))}
      </div>
    </div>
  );
}
