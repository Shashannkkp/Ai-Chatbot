import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, PanelLeftOpen, PanelLeftClose } from "lucide-react";

import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";
import { useAuth } from "./context/AuthContext";

function App() {
  const { token } = useAuth();
  const previousToken = useRef(token);

  const [chats, setChats] = useState([]);

  const [activeChatId, setActiveChatId] = useState(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("nova-ai-dark-mode") === "true";
  });

  // =========================================================
// SIDEBAR STATE
// =========================================================

// Mobile sidebar
const [sidebarOpen, setSidebarOpen] = useState(false);

// Desktop sidebar
const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
  return localStorage.getItem("nova-ai-sidebar-collapsed") === "true";
});

// Save desktop sidebar preference
useEffect(() => {
  localStorage.setItem(
    "nova-ai-sidebar-collapsed",
    String(sidebarCollapsed)
  );
}, [sidebarCollapsed]);

  // =========================================================
  // LOAD ACCOUNT CHATS
  // =========================================================

  useLayoutEffect(() => {
    if (!token) {
      if (previousToken.current) {
        setChats([]);
        setActiveChatId(null);
      }

      previousToken.current = null;
      return undefined;
    }

    previousToken.current = token;
    let cancelled = false;
    localStorage.removeItem("nova-ai-chats");
    setChats([]);
    setActiveChatId(null);

    const loadAccountChats = async () => {
      try {
        const response = await fetch("/api/chats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load account chats");
        }

        const data = await response.json();
        const accountChats = (data.chats || []).map(
          (chat) => ({
            ...chat,
            messages: (chat.messages || []).map(
              (message) => ({
                id: message.id || `${chat.id}-${message.role}-${message.content}`,
                sender:
                  message.role === "assistant"
                    ? "ai"
                    : "user",
                text: message.content,
                timestamp:
                  message.timestamp || chat.updatedAt,
              })
            ),
          })
        );

        if (!cancelled) {
          setChats(accountChats);
          setActiveChatId(accountChats[0]?.id || null);
        }
      } catch (error) {
        console.error("Failed to load account chats:", error);
      }
    };

    loadAccountChats();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // =========================================================
  // DARK MODE EFFECT
  // =========================================================

  useEffect(() => {
    localStorage.setItem("nova-ai-dark-mode", darkMode);

    document.documentElement.classList.toggle(
      "dark",
      darkMode
    );
  }, [darkMode]);

  // =========================================================
  // VALIDATE ACTIVE CHAT
  // =========================================================

  useEffect(() => {
    if (
      activeChatId &&
      !chats.some((chat) => chat.id === activeChatId)
    ) {
      setActiveChatId(
        chats.length > 0 ? chats[0].id : null
      );
    }
  }, [chats, activeChatId]);

  // =========================================================
  // NEW CHAT
  // =========================================================

  const handleNewChat = () => {
    setActiveChatId(null);
    setSidebarOpen(false);
  };

  // =========================================================
  // SELECT CHAT
  // =========================================================

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    setSidebarOpen(false);
  };

  const handleUpdateChat = (updatedChat) => {
    const chatWithTimestamp = {
      ...updatedChat,
      updatedAt: new Date().toISOString(),
    };

    setChats((prevChats) => {
      const existingChat = prevChats.find(
        (chat) => chat.id === chatWithTimestamp.id
      );

      // Existing chat:
      // remove it from its old position
      // and move it to the top.
      if (existingChat) {
        const otherChats = prevChats.filter(
          (chat) => chat.id !== chatWithTimestamp.id
        );

        return [chatWithTimestamp, ...otherChats];
      }

      // New chat is added at the top.
      return [chatWithTimestamp, ...prevChats];
    });

    setActiveChatId(chatWithTimestamp.id);
  };

  // =========================================================
  // DELETE CHAT
  // =========================================================

  const handleDeleteChat = async (chatId) => {
    try {
      if (token && typeof chatId === "string") {
        const response = await fetch(
          `/api/chats?id=${encodeURIComponent(chatId)}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete chat");
        }
      }

      setChats((prevChats) =>
        prevChats.filter((chat) => chat.id !== chatId)
      );
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }

    // The active-chat validation effect
    // will automatically select another chat.
  };

  // =========================================================
  // DELETE ALL CHATS
  // =========================================================

  const handleDeleteAllChats = () => {
    console.log("Deleting all chats");

    setChats([]);
    setActiveChatId(null);
  };

  // =========================================================
  // RENAME CHAT
  // =========================================================

  const handleRenameChat = (chatId, newTitle) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title: newTitle,
              updatedAt: new Date().toISOString(),
            }
          : chat
      )
    );
  };

  // =========================================================
  // ACTIVE CHAT
  // =========================================================

  const activeChat = chats.find(
    (chat) => chat.id === activeChatId
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="
        min-h-[100dvh]
    
        w-full
        bg-[#eef0f2]
        p-0
        h-screen overflow-hidden
        transition-colors
        duration-300

        dark:bg-[#090b0d]
      "
    >
      {/* ===================================================== */}
      {/* BACKGROUND EFFECTS */}
      {/* ===================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          -z-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -left-32
            -top-32
            h-72
            w-72
            rounded-full
            bg-white/80
            blur-3xl

            transition-colors
            duration-500

            dark:bg-gray-700/20

            sm:h-96
            sm:w-96
          "
        />

        <div
          className="
            absolute
            -bottom-32
            -right-32
            h-72
            w-72
            rounded-full
            bg-gray-300/40
            blur-3xl

            transition-colors
            duration-500

            dark:bg-gray-800/40

            sm:h-96
            sm:w-96
          "
        />
      </div>

      {/* ===================================================== */}
      {/* MAIN CONTAINER */}
      {/* ===================================================== */}

      <div
        className="
  relative
  flex
  h-full
  w-full
  min-h-0
  min-w-0
  overflow-hidden
  m-0
  rounded-none
  border-0
  bg-white/70
  shadow-none
  backdrop-blur-3xl
  transition-colors
  duration-300
  dark:bg-[#111416]/90
"
      >
        {/* =================================================== */}
        {/* MOBILE MENU BUTTON */}
        {/* =================================================== */}

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          className="
            fixed
            left-4
            top-4
            z-30

            flex
            h-11
            w-11
            items-center
            justify-center

            rounded-xl

            border
            border-gray-200

            bg-white/90

            text-gray-700

            shadow-[0_8px_25px_rgba(0,0,0,0.08)]

            backdrop-blur-xl

            transition-all
            duration-200

            hover:bg-white
            hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]

            active:scale-95

            dark:border-white/10
            dark:bg-[#171a1d]/90
            dark:text-white

            sm:hidden
          "
        >
          <Menu size={21} />
        </button>

        {/* =================================================== */}
        {/* SIDEBAR */}
        {/* =================================================== */}

        <Sidebar
          onNewChat={handleNewChat}
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onDeleteAllChats={handleDeleteAllChats}
          onRenameChat={handleRenameChat}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
         sidebarCollapsed={sidebarCollapsed}
         setSidebarCollapsed={setSidebarCollapsed}

        />

        {/* =================================================== */}
        {/* CHAT */}
        {/* =================================================== */}

        <main
  className="
    relative
    min-h-0
    min-w-0
    w-full
    flex-1
    overflow-hidden
  "
>
  {sidebarCollapsed && (
    <button
      type="button"
      onClick={() => setSidebarCollapsed(false)}
      title="Open sidebar"
      aria-label="Open sidebar"
      className="
        absolute
        left-4
        top-4
        z-30
        hidden
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        border
        border-gray-200
        bg-white/90
        text-gray-700
        shadow-sm
        backdrop-blur-xl
        transition
        hover:bg-gray-100
        dark:border-white/10
        dark:bg-[#171a1d]/90
        dark:text-white
        dark:hover:bg-white/10
        sm:flex
      "
    >
      <PanelLeftOpen size={19} />
    </button>
  )}

  <Chat
    chat={activeChat}
    onUpdateChat={handleUpdateChat}
    darkMode={darkMode}
    setDarkMode={setDarkMode}
  />
</main>
      </div>
    </div>
  );
}

export default App;