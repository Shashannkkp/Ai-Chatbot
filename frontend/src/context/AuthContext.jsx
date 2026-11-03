import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function clearChatHistoryStorage() {
  const chatHistoryKey = /chat.*(history|messages|conversations)|(history|messages|conversations).*chat/i;

  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);

    if (
      key === "nova-ai-chats" ||
      key === "chatHistory" ||
      (key && chatHistoryKey.test(key))
    ) {
      localStorage.removeItem(key);
    }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("nova-ai-user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("nova-ai-token") || null;
  });

  const login = (userData, jwtToken) => {
    clearChatHistoryStorage();
    setUser(userData);
    setToken(jwtToken);

    localStorage.setItem("nova-ai-user", JSON.stringify(userData));
    localStorage.setItem("nova-ai-token", jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.clear();
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