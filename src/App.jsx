import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";

function App() {
  // ================= CHAT HISTORY =================

  const [chats, setChats] = useState(() => {
    try {
      const savedChats = localStorage.getItem("nova-ai-chats");

      return savedChats ? JSON.parse(savedChats) : [];
    } catch (error) {
      console.error("Failed to load saved chats:", error);
      return [];
    }
  });

  const [activeChatId, setActiveChatId] = useState(null);


  // ================= DARK MODE =================

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("nova-ai-dark-mode") === "true";
  });


  // ================= APPLY DARK MODE =================

  useEffect(() => {
    localStorage.setItem(
      "nova-ai-dark-mode",
      darkMode
    );

    document.documentElement.classList.toggle(
      "dark",
      darkMode
    );
  }, [darkMode]);


  // ================= SAVE CHATS =================

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


  // ================= NEW CHAT =================

  const handleNewChat = () => {
    setActiveChatId(null);
  };


  // ================= SELECT CHAT =================

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
  };


  // ================= UPDATE CHAT =================

  const handleUpdateChat = (updatedChat) => {
    setChats((prevChats) => {
      const existingChat = prevChats.find(
        (chat) => chat.id === updatedChat.id
      );

      // Update existing chat
      if (existingChat) {
        return prevChats.map((chat) =>
          chat.id === updatedChat.id
            ? updatedChat
            : chat
        );
      }

      // Add new chat to the top
      return [
        updatedChat,
        ...prevChats,
      ];
    });

    setActiveChatId(updatedChat.id);
  };


  // ================= ACTIVE CHAT =================

  const activeChat = chats.find(
    (chat) => chat.id === activeChatId
  );


  // ================= UI =================

  return (
    <div
      className="
        min-h-screen
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

      {/* ================= AMBIENT BACKGROUND ================= */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

        {/* TOP LEFT GLOW */}

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


        {/* BOTTOM RIGHT GLOW */}

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


      {/* ================= MAIN GLASS CONTAINER ================= */}

      <div
        className="
          relative

          flex

          h-screen
          w-full

          overflow-hidden

          rounded-none

          border-0

          bg-white/70

          shadow-none

          backdrop-blur-3xl

          transition-colors
          duration-300

          dark:bg-[#111416]/90
          dark:border-white/10

          sm:h-[calc(100vh-24px)]

          sm:rounded-[24px]

          sm:border
          sm:border-white/80

          sm:shadow-[0_25px_80px_rgba(0,0,0,0.08)]

          md:rounded-[28px]
        "
      >

        {/* ================= SIDEBAR ================= */}

        <Sidebar
          onNewChat={handleNewChat}
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
        />


        {/* ================= CHAT ================= */}

        <main
          className="
            min-w-0
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