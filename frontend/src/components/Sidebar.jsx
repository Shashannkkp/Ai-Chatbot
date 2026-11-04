import { useEffect, useRef, useState } from "react";

import {
  Plus,
  Compass,
  Star,
  FileText,
  ChevronRight,
  MoreVertical,
  Globe2,
  MessageSquare,
  User,
  Settings,
  LogOut,
  LogIn,
  X,
  Trash2,
  Pencil,
  Check,
  Search,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Sidebar({
  onNewChat,
  chats = [],
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  sidebarOpen = false,
  setSidebarOpen,
}) {
  const { user, login, logout } = useAuth();

  // ================= PROFILE =================

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // ================= AUTH =================

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // ================= RENAME =================

  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const renameInputRef = useRef(null);

// ================= SEARCH =================

const [searchQuery, setSearchQuery] = useState("");
const [searchViewOpen, setSearchViewOpen] = useState(false);

const searchInputRef = useRef(null);

  // ================= CLOSE PROFILE =================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ================= FOCUS RENAME =================

  useEffect(() => {
    if (editingChatId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingChatId]);

  // ================= CLOSE SIDEBAR =================

  const closeSidebar = () => {
    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // ================= NEW CHAT =================

  const handleNewChatClick = () => {
    onNewChat();
    closeSidebar();
  };

  // ================= SELECT CHAT =================

  const handleSelectChatClick = (chatId) => {
    if (editingChatId === chatId) {
      return;
    }

    onSelectChat(chatId);
    closeSidebar();
  };

  // ================= SEARCH VIEW =================

const openSearchView = () => {
  setSearchViewOpen(true);
  setSearchQuery("");
};

const closeSearchView = () => {
  setSearchViewOpen(false);
  setSearchQuery("");
};

const handleSearchResultClick = (chatId) => {
  handleSelectChatClick(chatId);
  closeSearchView();
};

  // ================= DELETE CHAT =================

  const handleDeleteChatClick = (event, chatId) => {
    event.stopPropagation();

    if (editingChatId === chatId) {
      setEditingChatId(null);
      setEditingTitle("");
    }

    if (onDeleteChat) {
      onDeleteChat(chatId);
    }
  };

  // ================= RENAME START =================

  const handleRenameStart = (event, chat) => {
    event.stopPropagation();

    setEditingChatId(chat.id);
    setEditingTitle(
      chat.title || "New Conversation"
    );
  };

  // ================= RENAME CANCEL =================

  const handleRenameCancel = (event) => {
    event.stopPropagation();

    setEditingChatId(null);
    setEditingTitle("");
  };

  // ================= RENAME SAVE =================

  const handleRenameSave = (event, chatId) => {
    event.stopPropagation();

    const newTitle = editingTitle.trim();

    if (!newTitle) {
      setEditingChatId(null);
      setEditingTitle("");
      return;
    }

    if (onRenameChat) {
      onRenameChat(chatId, newTitle);
    }

    setEditingChatId(null);
    setEditingTitle("");
  };

  // ================= RENAME KEYBOARD =================

  const handleRenameKeyDown = (event, chatId) => {
    if (event.key === "Enter") {
      handleRenameSave(event, chatId);
    }

    if (event.key === "Escape") {
      handleRenameCancel(event);
    }
  };

  // ================= AUTH OPEN =================

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthError("");
    setName("");
    setEmail("");
    setPassword("");
    setShowAuth(true);
    setProfileOpen(false);
  };

  // ================= AUTH SUBMIT =================

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setAuthError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: authMode,
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Authentication failed"
        );
      }

      login(data.user, data.token);

      setShowAuth(false);
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  // ================= PROFILE =================

  const handleProfile = () => {
    setProfileOpen(false);
    console.log("Profile clicked");
  };

  // ================= SETTINGS =================

  const handleSettings = () => {
    setProfileOpen(false);
    console.log("Settings clicked");
  };

  // ================= CHAT TIME =================

  const formatChatTime = (timestamp) => {
    if (!timestamp) {
      return "";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const difference =
      now.getTime() - date.getTime();

    const seconds = Math.floor(
      difference / 1000
    );
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (difference < 0) {
      return "Just now";
    }

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m`;
    }

    if (hours < 24) {
      return `${hours}h`;
    }

    if (days === 1) {
      return "Yesterday";
    }

    if (days < 7) {
      return `${days}d`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // ================= FILTER CHATS =================

  const filteredChats = chats.filter((chat) => {
    const title =
      chat.title || "New Conversation";

    return title
      .toLowerCase()
      .includes(
        searchQuery.trim().toLowerCase()
      );
  });

  return (
    
    <>
      {/* ================= MOBILE OVERLAY ================= */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="
            fixed inset-0 z-40
            bg-black/50
            backdrop-blur-sm
            sm:hidden
          "
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-[100dvh] w-[290px]
          shrink-0 flex-col
          
    
          bg-white/95
          p-3
          shadow-[0_20px_50px_rgba(0,0,0,0.15)]
          backdrop-blur-xl
          transition-all duration-300 ease-out

          dark:border-white/10
          dark:bg-[#111416]/95
          dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)]

          sm:relative
          sm:left-auto
          sm:top-auto
          sm:z-auto
          sm:h-full
          sm:w-67
          sm:rounded-3xl
          sm:bg-white/70
          sm:shadow-[0_20px_50px_rgba(0,0,0,0.06)]
          sm:dark:bg-[#111416]/90

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full sm:translate-x-0"
          }
        `}
      >

{/* ================= FIXED HEADER ================= */}

<div className="shrink-0">

        {/* ================= MOBILE CLOSE ================= */}

        <div className="mb-4 flex justify-end sm:hidden">
          <button
            type="button"
            onClick={closeSidebar}
            className="
              flex h-9 w-9 items-center justify-center
              rounded-xl
              bg-gray-100 text-gray-600
              hover:bg-gray-200
              dark:bg-white/10
              dark:text-gray-300
            "
          >
            <X size={19} />
          </button>
        </div>

        {/* ================= LOGO ================= */}

       {/* ================= LOGO ================= */}

<div className="mb-4 flex items-center justify-between px-2">
  <div className="flex items-center gap-3">
    <div
      className="
        relative flex h-9 w-9 shrink-0
        items-center justify-center
        rounded-2xl
        border border-white
        bg-gradient-to-br
        from-gray-100 to-gray-300
        text-gray-700
        shadow-[inset_0_1px_2px_white,0_8px_20px_rgba(0,0,0,0.08)]
        dark:border-white/10
        dark:from-gray-700
        dark:to-gray-900
        dark:text-white
      "
    >
      <Globe2 size={20} strokeWidth={1.3} />

      <span
        className="
          absolute right-0 top-0
          h-3 w-3 rounded-full
          border-2 border-white
          bg-emerald-400
          dark:border-[#111416]
        "
      />
    </div>

    <h2
      className="
        text-2xl font-bold tracking-tight
        text-gray-900
        dark:text-white
      "
    >
      Nova
    </h2>
  </div>

  <button
    type="button"
    onClick={openSearchView}
    title="Search chats"
    aria-label="Search chats"
    className="
      flex h-9 w-9 items-center justify-center
      rounded-xl
      text-gray-500
      transition-all
      hover:bg-gray-100
      hover:text-gray-900
      dark:text-gray-400
      dark:hover:bg-white/10
      dark:hover:text-white
    "
  >
    <Search size={19} />
  </button>
</div>

        {/* ================= NEW CHAT ================= */}

        <button
          type="button"
          onClick={handleNewChatClick}
          className="
            group mb-2 flex w-full items-center
            justify-center gap-2
            rounded-2xl
            border border-sky-400
            bg-sky-200
            px-4 py-3.5
            text-base font-semibold
            text-gray-800
            shadow-[0_8px_25px_rgba(0,0,0,0.07),inset_0_1px_2px_white]
            transition-all duration-200
            hover:-translate-y-0.5
            hover:bg-white
            dark:text-white
          "
        >
          <span
            className="
              flex h-5 w-5 items-center
              justify-center rounded-lg
              bg-gray-100 text-gray-600
              dark:bg-white/10 dark:text-gray-300
            "
          >
            <Plus size={17} />
          </span>

          New Chat
        </button>

      </div>

{/* ================= SCROLLABLE MIDDLE ================= */}

<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0">

{searchViewOpen ? (
  /* ================= SEARCH VIEW ================= */
  <div className="flex min-h-full flex-col">

    {/* SEARCH HEADER */}

    <div className="mb-4 flex items-center gap-2">
      <button
        type="button"
        onClick={closeSearchView}
        aria-label="Back to sidebar"
        className="
          flex h-9 w-9 shrink-0 items-center justify-center
          rounded-xl text-gray-500
          hover:bg-gray-100
          dark:text-gray-400 dark:hover:bg-white/10
        "
      >
        <ChevronRight
          size={19}
          className="rotate-180"
        />
      </button>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Search
      </h3>
    </div>

    {/* SEARCH INPUT */}

    <div
      className="
        mb-4 flex items-center gap-2
        rounded-xl border border-gray-200
        bg-white/80 px-3 py-3 shadow-sm
        focus-within:ring-2 focus-within:ring-gray-300/30
        dark:border-white/10 dark:bg-white/5
      "
    >
      <Search size={17} className="shrink-0 text-gray-400" />

      <input
        ref={searchInputRef}
        type="text"
        value={searchQuery}
        onChange={(event) =>
          setSearchQuery(event.target.value)
        }
        placeholder="Search your conversations..."
        autoFocus
        className="
          min-w-0 flex-1 bg-transparent
          text-sm text-gray-800 outline-none
          placeholder:text-gray-400 dark:text-white
        "
      />

      {searchQuery && (
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            searchInputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
        >
          <X size={15} />
        </button>
      )}
    </div>

    {/* SEARCH RESULTS */}

    <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
      {searchQuery.trim()
        ? "Search results"
        : "Recent conversations"}
    </p>

    <div className="space-y-1">
      {chats.length === 0 ? (
        <EmptyChats
          icon={<MessageSquare size={17} />}
          title="No conversations yet"
          description="Start a conversation to see it here."
        />
      ) : filteredChats.length === 0 ? (
        <EmptyChats
          icon={<Search size={17} />}
          title="No results found"
          description="Try searching with a different title."
        />
      ) : (
        filteredChats.map((chat) => (
          <button
            key={chat.id}
            type="button"
            onClick={() =>
              handleSearchResultClick(chat.id)
            }
            className={`
              flex w-full items-center gap-3
              rounded-xl px-3 py-3 text-left
              transition-all
              ${
                activeChatId === chat.id
                  ? "bg-gray-100 dark:bg-white/10"
                  : "hover:bg-gray-100 dark:hover:bg-white/5"
              }
            `}
          >
            <span
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-lg bg-gray-100 text-gray-500
                dark:bg-white/5 dark:text-gray-400
              "
            >
              <MessageSquare size={16} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                {chat.title || "New Conversation"}
              </span>

              <span className="mt-1 block text-[11px] text-gray-400">
                {chat.messages?.length || 0} messages
                {chat.updatedAt &&
                  ` · ${formatChatTime(chat.updatedAt)}`}
              </span>
            </span>

            <ChevronRight
              size={15}
              className="shrink-0 text-gray-400"
            />
          </button>
        ))
      )}
    </div>
  </div>
) : (
  /* ================= NORMAL SIDEBAR VIEW ================= */
  <>
    {/* ================= MENU ================= */}

    <p
      className="
        mb-1 px-2 text-base font-bold
        uppercase tracking-[0.18em]
        text-black dark:text-gray-400
      "
    >
      Menu
    </p>

    <div className="space-y-1">
      <div className="rounded-xl transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md">
        <SidebarItem
          icon={<Compass size={18} />}
          text="Market Daily"
        />
      </div>

      <div className="rounded-xl transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md">
        <SidebarItem
          icon={<Star size={18} />}
          text="Daily News"
        />
      </div>

      <div className="rounded-xl transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md">
        <SidebarItem
          icon={<FileText size={18} />}
          text="My Project"
        />
      </div>
    </div>

    {/* ================= DIVIDER ================= */}

    <div
      className="
        my-1 h-px bg-gradient-to-r
        from-transparent via-gray-200 to-transparent
        dark:via-white/10
      "
    />

    {/* ================= RECENT ================= */}

    <div className="mb-2 flex items-center justify-between px-2">
      <p
        className="
          text-base font-bold uppercase
          tracking-[0.18em]
          text-black dark:text-gray-400
        "
      >
        Recent
      </p>

      {chats.length > 0 && (
        <span
          className="
            rounded-full bg-gray-100
            px-2 py-0.5 text-sm font-semibold
            text-gray-500
            dark:bg-white/10 dark:text-gray-400
          "
        >
          {chats.length}
        </span>
      )}
    </div>

{/* ================= CHAT LIST ================= */}

<div className="space-y-1">
  {chats.length === 0 ? (
    <EmptyChats
      icon={<MessageSquare size={17} />}
      title="No recent chats"
      description="Start a conversation and it will appear here."
    />
  ) : (
    filteredChats.map((chat) => (
      <div
        key={chat.id}
        className="group flex w-full items-center rounded-lg px-2 py-2"
      >
        {/* CHAT TITLE */}
        <button
          type="button"
          onClick={() => handleSelectChatClick(chat.id)}
          title={chat.title}
          className={`min-w-0 max-w-[180px] truncate text-left text-sm transition-colors ${
            activeChatId === chat.id
              ? "font-semibold text-black dark:text-white"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          {chat.title}
        </button>

        {/* DELETE - FAR RIGHT */}
        <button
          type="button"
          onClick={(event) => handleDeleteChatClick(event, chat.id)}
          title="Delete chat"
          className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:hover:bg-white/5"
        >
          <Trash2 size={15} />
        </button>
      </div>
    ))
  )}
</div>

</>
)}

</div>

{/* ================= FIXED BOTTOM ================= */}

<div className="relative mt-2 shrink-0">

        {/* ========================================================= */}
        {/* AUTH / USER SECTION */}
        {/* ========================================================= */}

        <div
  ref={profileRef}
  className="relative"
>
          {user ? (
            <>
              {/* LOGGED IN */}

              <button
                type="button"
                onClick={() =>
                  setProfileOpen((prev) => !prev)
                }
                className="
                  flex w-full items-center gap-3
                  rounded-2xl
                  border border-gray-200
                  bg-white/90
                  p-3
                  text-left
                  shadow-sm
                  dark:border-white/10
                  dark:bg-white/5
                "
              >
                <div
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-gray-200 to-gray-400
                    font-bold text-gray-700
                    dark:from-gray-700
                    dark:to-gray-900
                    dark:text-white
                  "
                >
                  {user.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="
                      truncate text-sm font-semibold
                      text-gray-900
                      dark:text-white
                    "
                  >
                    {user.name || "User"}
                  </p>

                  <p
                    className="
                      truncate text-xs
                      text-gray-400
                      dark:text-gray-500
                    "
                  >
                    {user.email}
                  </p>
                </div>

                <MoreVertical
                  size={18}
                  className={`
                    text-gray-400
                    transition-transform
                    ${
                      profileOpen
                        ? "rotate-90"
                        : ""
                    }
                  `}
                />
              </button>

              {/* USER MENU */}

              {profileOpen && (
                <div
                  className="
                    absolute bottom-[calc(100%+10px)]
                    left-0 right-0 z-50
                    overflow-hidden
                    rounded-2xl
                    border border-gray-200
                    bg-white/95
                    p-2
                    shadow-2xl
                    backdrop-blur-2xl
                    dark:border-white/10
                    dark:bg-[#171a1d]/95
                  "
                >
                  <div
                    className="
                      mb-2 flex items-center gap-3
                      rounded-xl
                      bg-gray-50 p-3
                      dark:bg-white/5
                    "
                  >
                    <div
                      className="
                        flex h-9 w-9
                        items-center justify-center
                        rounded-full
                        bg-gray-200
                        font-bold
                        text-gray-700
                        dark:bg-gray-800
                        dark:text-white
                      "
                    >
                      {user.name
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          truncate text-sm font-semibold
                          text-gray-900
                          dark:text-white
                        "
                      >
                        {user.name}
                      </p>

                      <p
                        className="
                          truncate text-[11px]
                          text-gray-400
                        "
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProfile}
                    className="
                      flex w-full items-center gap-3
                      rounded-xl px-3 py-2.5
                      text-sm font-medium
                      text-gray-700
                      hover:bg-gray-100
                      dark:text-gray-300
                      dark:hover:bg-white/10
                    "
                  >
                    <User size={17} />
                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={handleSettings}
                    className="
                      flex w-full items-center gap-3
                      rounded-xl px-3 py-2.5
                      text-sm font-medium
                      text-gray-700
                      hover:bg-gray-100
                      dark:text-gray-300
                      dark:hover:bg-white/10
                    "
                  >
                    <Settings size={17} />
                    Settings
                  </button>

                  <div className="my-2 h-px bg-gray-200 dark:bg-white/10" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      flex w-full items-center gap-3
                      rounded-xl px-3 py-2.5
                      text-sm font-medium
                      text-red-500
                      hover:bg-red-50
                      dark:hover:bg-red-500/10
                    "
                  >
                    <LogOut size={17} />
                    Log out
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* NOT LOGGED IN */}

              <div
                className="
                  rounded-2xl
                  border border-gray-200
                  bg-white/90
                  p-3
                  shadow-sm
                  dark:border-white/10
                  dark:bg-white/5
                "
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="
                      flex h-10 w-10
                      items-center justify-center
                      rounded-full
                      bg-gray-100
                      text-gray-500
                      dark:bg-white/10
                      dark:text-gray-400
                    "
                  >
                    <User size={18} />
                  </div>

                  <div>
                    <p
                      className="
                        text-sm font-semibold
                        text-gray-900
                        dark:text-white
                      "
                    >
                      Welcome to Nova-Ai
                    </p>

                    <p
                      className="
                        text-xs text-gray-400
                        dark:text-gray-500
                      "
                    >
                      Login to save your chats
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openAuth("login")
                    }
                    className="
                      flex items-center
                      justify-center gap-1.5
                      rounded-xl
                      border border-gray-200
                      bg-white
                      px-3 py-2.5
                      text-sm font-medium
                      text-gray-700
                      hover:bg-gray-100
                      dark:border-white/10
                      dark:bg-white/5
                      dark:text-gray-300
                      dark:hover:bg-white/10
                    "
                  >
                    <LogIn size={15} />
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openAuth("register")
                    }
                    className="
                      rounded-xl
                      bg-gray-900
                      px-3 py-2.5
                      text-sm font-medium
                      text-white
                      hover:bg-gray-800
                      dark:bg-white
                      dark:text-black
                    "
                  >
                    Register
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
</div>
      </aside>

      {/* ========================================================= */}
      {/* LOGIN / REGISTER MODAL */}
      {/* ========================================================= */}

      {showAuth && (
        <div
          className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            bg-black/40 p-4
            backdrop-blur-sm
          "
        >
          <div
            className="
              w-full max-w-md
              rounded-2xl
              border border-gray-200
              bg-white
              p-6
              shadow-2xl
              dark:border-white/10
              dark:bg-[#171a1d]
            "
          >
            <div className="mb-6">
              <h2
                className="
                  text-xl font-semibold
                  text-gray-900
                  dark:text-white
                "
              >
                {authMode === "login"
                  ? "Welcome back"
                  : "Create your account"}
              </h2>

              <p
                className="
                  mt-1 text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                {authMode === "login"
                  ? "Login to continue using Nova-Ai."
                  : "Register to start using Nova-Ai."}
              </p>
            </div>

            <form
              onSubmit={handleAuthSubmit}
              className="space-y-4"
            >
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                  className="
                    w-full rounded-xl
                    border border-gray-200
                    bg-gray-50
                    px-4 py-3
                    text-sm outline-none
                    focus:border-gray-400
                    dark:border-white/10
                    dark:bg-[#111416]
                    dark:text-white
                  "
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                className="
                  w-full rounded-xl
                  border border-gray-200
                  bg-gray-50
                  px-4 py-3
                  text-sm outline-none
                  focus:border-gray-400
                  dark:border-white/10
                  dark:bg-[#111416]
                  dark:text-white
                "
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                className="
                  w-full rounded-xl
                  border border-gray-200
                  bg-gray-50
                  px-4 py-3
                  text-sm outline-none
                  focus:border-gray-400
                  dark:border-white/10
                  dark:bg-[#111416]
                  dark:text-white
                "
              />

              {authError && (
                <p
                  className="
                    rounded-lg
                    bg-red-50
                    px-3 py-2
                    text-sm text-red-600
                    dark:bg-red-500/10
                    dark:text-red-400
                  "
                >
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full rounded-xl
                  bg-black
                  px-4 py-3
                  text-sm font-medium
                  text-white
                  hover:bg-gray-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:bg-white
                  dark:text-black
                "
              >
                {loading
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Login"
                    : "Create Account"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setShowAuth(false);
                setAuthError("");
              }}
              className="
                mt-3 w-full rounded-xl
                border border-gray-200
                px-4 py-3
                text-sm font-medium
                text-gray-700
                hover:bg-gray-100
                dark:border-white/10
                dark:text-gray-300
                dark:hover:bg-white/10
              "
            >
              Continue as guest
            </button>

            <div
              className="
                mt-5 flex items-center
                justify-between text-sm
              "
            >
              <button
                type="button"
                onClick={() => {
                  setAuthMode(
                    authMode === "login"
                      ? "register"
                      : "login"
                  );
                  setAuthError("");
                }}
                className="
                  text-gray-600 hover:underline
                  dark:text-gray-300
                "
              >
                {authMode === "login"
                  ? "Create an account"
                  : "Already have an account?"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAuth(false);
                  setAuthError("");
                }}
                className="
                  text-gray-500 hover:underline
                  dark:text-gray-400
                "
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

/* ============================================================= */
/* SIDEBAR ITEM */
/* ============================================================= */

function SidebarItem({ icon, text }) {
  return (
    <button
      type="button"
      className="
        group flex w-full items-center gap-3
        rounded-xl px-3 py-3
        text-sm text-black
        transition-all duration-200
        hover:bg-white
        hover:text-gray-900
        hover:shadow-sm
        dark:text-gray-300
        dark:hover:bg-white/10
        dark:hover:text-white
      "
    >
      <span
        className="
          flex h-8 w-8
          items-center justify-center
          rounded-lg
          bg-gray-100/70
          text-black
          dark:bg-white/5
          dark:text-gray-400
        "
      >
        {icon}
      </span>

      {text}
    </button>
  );
}

/* ============================================================= */
/* EMPTY CHATS */
/* ============================================================= */

function EmptyChats({
  icon,
  title,
  description,
}) {
  return (
    <div
      className="
        flex flex-col items-center
        justify-center px-4 py-8
        text-center
      "
    >
      <div
        className="
          mb-3 flex h-10 w-10
          items-center justify-center
          rounded-xl
          border border-gray-200
          bg-white/70
          text-gray-400
          dark:border-white/10
          dark:bg-white/5
        "
      >
        {icon}
      </div>

      <p
        className="
          text-sm font-medium
          text-gray-500
          dark:text-gray-400
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1 text-xs leading-5
          text-gray-400
          dark:text-gray-600
        "
      >
        {description}
      </p>
    </div>
  );
}

export default Sidebar;