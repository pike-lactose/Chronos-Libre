import { useState, useEffect } from "react";
import { getHistory, deleteHistory } from "../api";
import { decrypt } from "../crypto";

export default function HistoryPage({ session, cryptoKey }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session || !cryptoKey) return;

    async function load() {
      try {
        const data = await getHistory(session.access_token);
        const decrypted = await Promise.all(
          (data.items || []).map(async (entry) => {
            try {
              const json = await decrypt(cryptoKey, entry.ciphertext, entry.iv);
              return { ...entry, item: JSON.parse(json) };
            } catch {
              return { ...entry, item: null, decryptError: true };
            }
          })
        );
        setEntries(decrypted);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [session, cryptoKey]);

  const handleDelete = async (id) => {
    try {
      await deleteHistory(session.access_token, id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  if (!session) return <p>Please log in to view history.</p>;
  if (loading) return <p>Loading history...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="history-page">
      <h1>My History</h1>
      <p className="subtitle">Encrypted locally — only you can read this</p>

      {entries.length === 0 && <p>No history yet.</p>}

      <div className="history-list">
        {entries.map((entry) => (
          <div key={entry.id} className="history-item">
            {entry.decryptError ? (
              <p className="decrypt-error">Failed to decrypt — key may have changed</p>
            ) : entry.item ? (
              <>
                <h3>
                  <a href={entry.item.url} target="_blank" rel="noopener noreferrer">
                    {entry.item.title}
                  </a>
                </h3>
                <p className="meta">
                  {entry.item.content_type === "research_paper" ? "Research" : "News"} —{" "}
                  {new Date(entry.created_at).toLocaleDateString()}
                </p>
                <button onClick={() => handleDelete(entry.id)}>Remove</button>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
