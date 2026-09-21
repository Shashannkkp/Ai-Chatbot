import { useState } from "react";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = "/api/auth";

export default function Navbar() {
  const { user, login, logout } = useAuth();

  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: mode,
          name,
          email,
          password,
        }),
      });

      const responseText = await response.text();

      let data = {};

      try {
         data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Invalid JSON response:", responseText);
        throw new Error(
    `      Server returned an invalid response (${response.status})`
      );
}

     if (!response.ok) {
        throw new Error(
            data?.error || `Authentication failed (${response.status})`
          );
        }

      login(data.user, data.token);

      setShowAuth(false);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="absolute right-4 top-4 z-40">
        {user ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-gray-700 dark:text-gray-200 sm:block">
              Hi, {user.name}
            </span>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-sm text-gray-700 shadow-sm backdrop-blur-xl transition hover:bg-white dark:border-white/10 dark:bg-[#171a1d]/90 dark:text-white"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setShowAuth(true);
              }}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-sm text-gray-700 shadow-sm backdrop-blur-xl transition hover:bg-white dark:border-white/10 dark:bg-[#171a1d]/90 dark:text-white"
            >
              <LogIn size={16} />
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setShowAuth(true);
              }}
              className="hidden items-center gap-2 rounded-xl bg-black px-3 py-2 text-sm text-white shadow-sm transition hover:bg-gray-800 sm:flex"
            >
              <UserPlus size={16} />
              Register
            </button>
          </div>
        )}
      </nav>

      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#171a1d]">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {mode === "login"
                  ? "Login to continue using Nova-Ai."
                  : "Register to start using Nova-Ai."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-400 dark:border-white/10 dark:bg-[#111416] dark:text-white"
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-400 dark:border-white/10 dark:bg-[#111416] dark:text-white"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-400 dark:border-white/10 dark:bg-[#111416] dark:text-white"
              />

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Login"
                    : "Create Account"}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                }}
                className="text-gray-600 hover:underline dark:text-gray-300"
              >
                {mode === "login"
                  ? "Create an account"
                  : "Already have an account?"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAuth(false);
                  setError("");
                }}
                className="text-gray-500 hover:underline dark:text-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}