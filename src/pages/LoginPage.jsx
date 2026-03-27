import { useState } from "react";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      const success = login(username, password);
      if (!success) {
        setError("Galat ID ya Password. Dobara try karein.");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md w-full max-w-sm p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-xl font-bold text-slate-800">Madhurekha Eye Care Center</div>
          <div className="text-sm text-slate-500 mt-1">Billing Software</div>
          <div className="mt-4 h-px bg-slate-200" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              User ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter ID"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              required
            />
          </div>

          {error && (
            <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}