import { useState } from "react";
import { deriveKey } from "../crypto";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function supabaseAuth(email, password, method) {
  const endpoint = method === "signup" ? "/auth/v1/signup" : "/auth/v1/token?grant_type=password";
  const res = await fetch(`${SUPABASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || data.error);
  return data;
}

export default function AuthPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await supabaseAuth(email, password, mode);
      const session = data.session || { access_token: data.access_token, user: data.user };

      if (!session.access_token) {
        throw new Error("No access token returned");
      }

      const cryptoKey = await deriveKey(email, password);
      onLogin(session, cryptoKey);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>Chronos Libre</h1>
      <p className="subtitle">Zero-knowledge world monitor</p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {mode === "signup" && (
          <p className="warning">
            Warning: If you forget your password, your encrypted history and bookmarks
            will be permanently unrecoverable.
          </p>
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : mode === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>

      <p className="toggle-mode">
        {mode === "login" ? (
          <>
            Don't have an account?{" "}
            <button onClick={() => setMode("signup")}>Sign up</button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button onClick={() => setMode("login")}>Log in</button>
          </>
        )}
      </p>
    </div>
  );
}
