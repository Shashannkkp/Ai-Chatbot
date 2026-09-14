import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";

function App() {
  // =========================================================
  // CHATS
  // =========================================================

  const [chats, setChats] = useState(() => {
    try {
      const savedChats = localStorage.getItem("nova-ai-chats");

      return savedChats ? JSON.parse(savedChats) : [];
    } catch (error) {
      console.error("Failed to load saved chats:", error);
      return [];
    }
  });

  // =========================================================
  // ACTIVE CHAT
  // =========================================================

  const [activeChatId, setActiveChatId] = useState(() => {
    try {
      const savedChats = localStorage.getItem("nova-ai-chats");

      if (!savedChats) {
        return null;
      }

      const parsedChats = JSON.parse(savedChats);

      if (!Array.isArray(parsedChats) || parsedChats.length === 0) {
        return null;
      }

      // Restore the most recent saved chat
      return parsedChats[0].id;
    } catch (error) {
      console.error("Failed to restore active chat:", error);
      return null;
    }
  });

  // =========================================================
  // DARK MODE
  // =========================================================

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("nova-ai-dark-mode") === "true";
  });

  // =========================================================
  // MOBILE SIDEBAR
  // =========================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  // SAVE CHATS
  // =========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "nova-ai-chats",
        JSON.stringify(chats)
      );
    } catch (error) {
      console.error("Failed to save chats:", error);
    }
  }, [chats]);

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

  // =========================================================
  // UPDATE / CREATE CHAT
  // =========================================================

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

  const handleDeleteChat = (chatId) => {
    console.log("Deleting chat:", chatId);

    setChats((prevChats) => {
      return prevChats.filter(
        (chat) => chat.id !== chatId
      );
    });

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

        transition-colors
        duration-300

        dark:bg-[#090b0d]

        sm:p-3
        md:p-4
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
          min-h-[100dvh]
          w-full
          overflow-hidden

          rounded-none
          border-0

          bg-white/70

          shadow-none

          backdrop-blur-3xl

          transition-colors
          duration-300

          dark:border-white/10
          dark:bg-[#111416]/90

          sm:h-[calc(100dvh-24px)]
          sm:flex-row
          sm:rounded-[24px]
          sm:border
          sm:border-white/80
          sm:shadow-[0_25px_80px_rgba(0,0,0,0.08)]

          md:rounded-[28px]
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
        />

        {/* =================================================== */}
        {/* CHAT */}
        {/* =================================================== */}

        <main
          className="
            min-h-0
            min-w-0
            w-full
            flex-1
            overflow-hidden
          "
        >
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