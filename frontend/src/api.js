const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function fetchFeed(query = "technology", source = "all") {
  const res = await fetch(`${API_BASE}/api/feed?q=${encodeURIComponent(query)}&source=${source}`);
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json();
}

export async function fetchTrending() {
  const res = await fetch(`${API_BASE}/api/feed/trending`);
  if (!res.ok) throw new Error("Failed to fetch trending");
  return res.json();
}

export async function getHistory(token) {
  const res = await fetch(`${API_BASE}/api/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function addHistory(token, ciphertext, iv) {
  const res = await fetch(`${API_BASE}/api/history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ciphertext, iv }),
  });
  if (!res.ok) throw new Error("Failed to add history");
  return res.json();
}

export async function deleteHistory(token, id) {
  const res = await fetch(`${API_BASE}/api/history/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete history");
  return res.json();
}

export async function getBookmarks(token) {
  const res = await fetch(`${API_BASE}/api/bookmarks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch bookmarks");
  return res.json();
}

export async function addBookmark(token, ciphertext, iv) {
  const res = await fetch(`${API_BASE}/api/bookmarks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ciphertext, iv }),
  });
  if (!res.ok) throw new Error("Failed to add bookmark");
  return res.json();
}

export async function deleteBookmark(token, id) {
  const res = await fetch(`${API_BASE}/api/bookmarks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete bookmark");
  return res.json();
}
