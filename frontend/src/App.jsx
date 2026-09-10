import { useState } from "react";
import AuthPage from "./pages/AuthPage";
import FeedPage from "./pages/FeedPage";
import HistoryPage from "./pages/HistoryPage";
import BookmarksPage from "./pages/BookmarksPage";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [cryptoKey, setCryptoKey] = useState(null);
  const [page, setPage] = useState("feed");

  const handleLogin = (session, key) => {
    setSession(session);
    setCryptoKey(key);
    setPage("feed");
  };

  const handleLogout = () => {
    setSession(null);
    setCryptoKey(null);
    setPage("feed");
  };

  if (!session) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <span className="logo" onClick={() => setPage("feed")}>
          Chronos Libre
        </span>
        <div className="nav-links">
          <button className={page === "feed" ? "active" : ""} onClick={() => setPage("feed")}>
            Feed
          </button>
          <button className={page === "history" ? "active" : ""} onClick={() => setPage("history")}>
            History
          </button>
          <button className={page === "bookmarks" ? "active" : ""} onClick={() => setPage("bookmarks")}>
            Bookmarks
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main>
        {page === "feed" && <FeedPage session={session} cryptoKey={cryptoKey} />}
        {page === "history" && <HistoryPage session={session} cryptoKey={cryptoKey} />}
        {page === "bookmarks" && <BookmarksPage session={session} cryptoKey={cryptoKey} />}
      </main>
    </div>
  );
}

export default App;
