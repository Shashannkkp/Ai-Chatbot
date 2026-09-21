import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("nova-ai-user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("nova-ai-token") || null;
  });

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);

    localStorage.setItem("nova-ai-user", JSON.stringify(userData));
    localStorage.setItem("nova-ai-token", jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("nova-ai-user");
    localStorage.removeItem("nova-ai-token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}