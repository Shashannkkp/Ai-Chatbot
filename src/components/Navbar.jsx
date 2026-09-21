import { LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#111416]">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          Nova AI
        </span>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <User size={18} />
              <span>{user.name || user.email || "User"}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <LogOut size={17} />
              Logout
            </button>
          </>
        ) : (
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
          >
            <LogIn size={17} />
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;