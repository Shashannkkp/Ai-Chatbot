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
  X,
  Trash2,
  Pencil,
  Check,
  Search,
} from "lucide-react";

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
  // ================= PROFILE MENU =================

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // ================= RENAME CHAT =================

  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const renameInputRef = useRef(null);

  // ================= SEARCH CHATS =================

  const [searchQuery, setSearchQuery] = useState("");

  // ================= CLOSE PROFILE ON OUTSIDE CLICK =================

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
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ================= FOCUS RENAME INPUT =================

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

  // ================= START RENAME =================

  const handleRenameStart = (event, chat) => {
    event.stopPropagation();

    setEditingChatId(chat.id);
    setEditingTitle(chat.title || "New Conversation");
  };

  // ================= CANCEL RENAME =================

  const handleRenameCancel = (event) => {
    event.stopPropagation();

    setEditingChatId(null);
    setEditingTitle("");
  };

  // ================= SAVE RENAME =================

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

  // ================= PROFILE MENU ACTIONS =================

  const handleProfile = () => {
    setProfileOpen(false);
    console.log("Profile clicked");
  };

  const handleSettings = () => {
    setProfileOpen(false);
    console.log("Settings clicked");
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    setProfileOpen(false);
    console.log("Logout clicked");
  };

  // ================= CHAT TIMESTAMP =================

  const formatChatTime = (timestamp) => {
    if (!timestamp) {
      return "";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    const difference = now.getTime() - date.getTime();

    const seconds = Math.floor(difference / 1000);
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
    const title = chat.title || "New Conversation";

    return title
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
  });

  return (
    <>
      {/* ========================================================= */}
      {/* MOBILE OVERLAY */}
      {/* ========================================================= */}

      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="
            fixed
            inset-0
            z-40
            bg-black/50
            backdrop-blur-sm

            sm:hidden

            animate-[fadeIn_0.2s_ease-out]
          "
        />
      )}

      {/* ========================================================= */}
      {/* SIDEBAR */}
      {/* ========================================================= */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50

          flex
          h-[100dvh]
          w-[290px]
          shrink-0
          flex-col

          rounded-r-3xl
          border
          border-white/80

          bg-white/95

          p-3

          shadow-[0_20px_50px_rgba(0,0,0,0.15)]

          backdrop-blur-xl

          transition-all
          duration-300
          ease-out

          dark:border-white/10
          dark:bg-[#111416]/95
          dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)]

          sm:relative
          sm:top-auto
          sm:left-auto
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
        {/* ========================================================= */}
        {/* MOBILE CLOSE BUTTON */}
        {/* ========================================================= */}

        <div className="mb-4 flex items-center justify-end sm:hidden">
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-xl

              bg-gray-100
              text-gray-600

              transition-all
              duration-200

              hover:bg-gray-200
              hover:text-gray-900

              active:scale-95

              dark:bg-white/10
              dark:text-gray-300
              dark:hover:bg-white/15
              dark:hover:text-white
            "
          >
            <X size={19} />
          </button>
        </div>

        {/* ========================================================= */}
        {/* LOGO */}
        {/* ========================================================= */}

        <div className="mb-8 flex items-center gap-3 px-2">
          <div
            className="
              relative
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center

              rounded-2xl

              border
              border-white

              bg-gradient-to-br
              from-gray-100
              to-gray-300

              text-gray-700

              shadow-[inset_0_1px_2px_white,0_8px_20px_rgba(0,0,0,0.08)]

              transition-colors
              duration-300

              dark:border-white/10
              dark:from-gray-700
              dark:to-gray-900
              dark:text-white
            "
          >
            <Globe2 size={25} strokeWidth={1.6} />

            <span
              className="
                absolute
                right-0
                top-0

                h-3
                w-3

                rounded-full

                border-2
                border-white

                bg-emerald-400

                dark:border-[#111416]
              "
            />
          </div>

          <div>
            <h1
              className="
                text-3xl
                font-bold
                tracking-tight

                text-gray-900

                transition-colors
                duration-300

                dark:text-white
              "
            >
              Nova-Ai
            </h1>
          </div>
        </div>

        {/* ========================================================= */}
        {/* NEW CHAT */}
        {/* ========================================================= */}

        <button
          type="button"
          onClick={handleNewChatClick}
          className="
            group
            mb-7
            flex
            w-full
            items-center
            justify-center
            gap-2

            rounded-2xl

            border
            border-white

            bg-white/90

            px-4
            py-3.5

            text-base
            font-semibold
            text-gray-800

            shadow-[0_8px_25px_rgba(0,0,0,0.07),inset_0_1px_2px_white]

            transition-all
            duration-200

            hover:-translate-y-0.5
            hover:bg-white
            hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)]

            active:scale-[0.98]

            dark:border-white/10
            dark:bg-white/10
            dark:text-white
            dark:shadow-[0_8px_25px_rgba(0,0,0,0.2)]
            dark:hover:bg-white/15
          "
        >
          <span
            className="
              flex
              h-7
              w-7
              items-center
              justify-center

              rounded-lg

              bg-gray-100
              text-gray-600

              shadow-inner

              dark:bg-white/10
              dark:text-gray-300
            "
          >
            <Plus size={17} />
          </span>

          New Chat
        </button>

        {/* ========================================================= */}
        {/* MENU */}
        {/* ========================================================= */}

        <p
          className="
            mb-1
            px-2

            text-base
            font-bold
            uppercase

            tracking-[0.18em]

            text-black

            transition-colors
            duration-300

            dark:text-gray-400
          "
        >
          Menu
        </p>

        <div className="space-y-1">
          <SidebarItem
            icon={<Compass size={18} />}
            text="Market Daily"
          />

          <SidebarItem
            icon={<Star size={18} />}
            text="My Portfolio"
          />

          <SidebarItem
            icon={<FileText size={18} />}
            text="My Project"
          />
        </div>

        {/* ========================================================= */}
        {/* DIVIDER */}
        {/* ========================================================= */}

        <div
          className="
            my-1
            h-px

            bg-gradient-to-r
            from-transparent
            via-gray-200
            to-transparent

            dark:via-white/10
          "
        />

        {/* ========================================================= */}
        {/* RECENT CHATS */}
        {/* ========================================================= */}

        <div className="mb-3 flex items-center justify-between px-2">
          <p
            className="
              text-base
              font-bold
              uppercase

              tracking-[0.18em]

              text-black

              transition-colors
              duration-300

              dark:text-gray-400
            "
          >
            Recent
          </p>

          {chats.length > 0 && (
            <span
              className="
                rounded-full

                bg-gray-100

                px-2
                py-0.5

                text-sm
                font-semibold

                text-gray-500

                dark:bg-white/10
                dark:text-gray-400
              "
            >
              {chats.length}
            </span>
          )}
        </div>

        {/* ========================================================= */}
        {/* SEARCH CHATS */}
        {/* ========================================================= */}

        {chats.length > 0 && (
          <div className="mb-3 px-1">
            <div
              className="
                flex
                items-center
                gap-2

                rounded-xl

                border
                border-gray-200

                bg-white/80

                px-3
                py-2.5

                shadow-sm

                transition-all
                duration-200

                focus-within:border-gray-300
                focus-within:ring-2
                focus-within:ring-gray-300/30

                dark:border-white/10
                dark:bg-white/5

                dark:focus-within:border-white/20
                dark:focus-within:ring-white/10
              "
            >
              <Search
                size={16}
                className="
                  shrink-0
                  text-gray-400
                  dark:text-gray-500
                "
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search chats..."
                aria-label="Search chats"
                className="
                  min-w-0
                  flex-1

                  bg-transparent

                  text-sm
                  text-gray-800

                  outline-none

                  placeholder:text-gray-400

                  dark:text-white
                  dark:placeholder:text-gray-600
                "
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear chat search"
                  className="
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center

                    rounded-md

                    text-gray-400

                    transition-colors

                    hover:bg-gray-100
                    hover:text-gray-700

                    dark:hover:bg-white/10
                    dark:hover:text-white
                  "
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CHAT LIST */}
        {/* ========================================================= */}

        <div
          className="
            min-h-0
            flex-1
            space-y-1
            overflow-y-auto
            pr-1
          "
        >
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
              <div
                className="
                  mb-3
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center

                  rounded-xl

                  border
                  border-gray-200

                  bg-white/70

                  text-gray-400

                  shadow-sm

                  dark:border-white/10
                  dark:bg-white/5
                  dark:text-gray-500
                "
              >
                <MessageSquare size={17} />
              </div>

              <p
                className="
                  text-sm
                  font-medium
                  text-gray-500

                  dark:text-gray-400
                "
              >
                No recent chats
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5

                  text-gray-400

                  dark:text-gray-600
                "
              >
                Start a conversation and it will appear here.
              </p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
              <div
                className="
                  mb-3
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center

                  rounded-xl

                  border
                  border-gray-200

                  bg-white/70

                  text-gray-400

                  shadow-sm

                  dark:border-white/10
                  dark:bg-white/5
                  dark:text-gray-500
                "
              >
                <Search size={17} />
              </div>

              <p
                className="
                  text-sm
                  font-medium
                  text-gray-500

                  dark:text-gray-400
                "
              >
                No chats found
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5

                  text-gray-400

                  dark:text-gray-600
                "
              >
                Try a different search term.
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="group relative"
              >
                {/* ================================================= */}
                {/* CHAT BUTTON */}
                {/* ================================================= */}

                <button
                  type="button"
                  onClick={() => handleSelectChatClick(chat.id)}
                  className={`
                    group/chat
                    flex
                    w-full
                    items-center
                    gap-3

                    rounded-xl

                    px-3
                    py-3
                    pr-11

                    text-left

                    transition-all
                    duration-200

                    ${
                      activeChatId === chat.id
                        ? `
                          bg-gray-900
                          text-white
                          shadow-[0_8px_20px_rgba(0,0,0,0.12)]

                          dark:bg-white/15
                          dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)]
                        `
                        : `
                          text-gray-600

                          hover:bg-white
                          hover:text-gray-900
                          hover:shadow-sm

                          dark:text-gray-400
                          dark:hover:bg-white/10
                          dark:hover:text-white
                          dark:hover:shadow-none
                        `
                    }
                  `}
                >
                  {/* CHAT ICON */}

                  <span
                    className={`
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center

                      rounded-lg

                      ${
                        activeChatId === chat.id
                          ? "bg-white/10 text-white"
                          : "bg-gray-100/70 text-gray-500 dark:bg-white/5 dark:text-gray-500"
                      }
                    `}
                  >
                    <MessageSquare size={15} />
                  </span>

                  {/* CHAT INFORMATION */}

                  <div className="min-w-0 flex-1">
                    {editingChatId === chat.id ? (
                      <input
                        ref={renameInputRef}
                        type="text"
                        value={editingTitle}
                        onChange={(event) =>
                          setEditingTitle(event.target.value)
                        }
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                        onKeyDown={(event) =>
                          handleRenameKeyDown(
                            event,
                            chat.id
                          )
                        }
                        className="
                          w-full
                          rounded-md
                          border
                          border-gray-300
                          bg-white
                          px-2
                          py-1

                          text-sm
                          font-medium
                          text-gray-900

                          outline-none
                          ring-2
                          ring-gray-400/20

                          dark:border-white/20
                          dark:bg-[#1b1f22]
                          dark:text-white
                        "
                      />
                    ) : (
                      <>
                        <p
                          className={`
                            truncate
                            text-sm
                            font-medium

                            ${
                              activeChatId === chat.id
                                ? "text-white"
                                : "text-gray-700 dark:text-gray-300"
                            }
                          `}
                        >
                          {chat.title || "New Conversation"}
                        </p>

                        <div className="mt-0.5 flex items-center gap-1.5">
                          <p
                            className={`
                              text-[10px]

                              ${
                                activeChatId === chat.id
                                  ? "text-gray-400"
                                  : "text-gray-400 dark:text-gray-600"
                              }
                            `}
                          >
                            {chat.messages?.length || 0} messages
                          </p>

                          {chat.updatedAt && (
                            <>
                              <span
                                className={`
                                  text-[9px]

                                  ${
                                    activeChatId === chat.id
                                      ? "text-gray-500"
                                      : "text-gray-300 dark:text-gray-700"
                                  }
                                `}
                              >
                                •
                              </span>

                              <p
                                className={`
                                  shrink-0
                                  text-[10px]

                                  ${
                                    activeChatId === chat.id
                                      ? "text-gray-400"
                                      : "text-gray-400 dark:text-gray-600"
                                  }
                                `}
                              >
                                {formatChatTime(
                                  chat.updatedAt
                                )}
                              </p>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* ARROW */}

                  {editingChatId !== chat.id && (
                    <ChevronRight
                      size={15}
                      className={`
                        shrink-0
                        transition-all

                        ${
                          activeChatId === chat.id
                            ? "text-gray-400"
                            : "text-gray-300 opacity-0 group-hover/chat:translate-x-0.5 group-hover/chat:opacity-100 dark:text-gray-600"
                        }
                      `}
                    />
                  )}
                </button>

                {/* ================================================= */}
                {/* RENAME / SAVE BUTTON */}
                {/* ================================================= */}

                {editingChatId === chat.id ? (
                  <div
                    className="
                      absolute
                      right-2
                      top-1/2
                      z-10
                      flex
                      -translate-y-1/2
                      items-center
                      gap-1
                    "
                  >
                    <button
                      type="button"
                      onClick={(event) =>
                        handleRenameSave(
                          event,
                          chat.id
                        )
                      }
                      aria-label="Save chat name"
                      title="Save"
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center

                        rounded-lg

                        bg-emerald-500
                        text-white

                        transition-all

                        hover:bg-emerald-600
                        active:scale-95
                      "
                    >
                      <Check size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={handleRenameCancel}
                      aria-label="Cancel rename"
                      title="Cancel"
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center

                        rounded-lg

                        bg-gray-200
                        text-gray-500

                        transition-all

                        hover:bg-gray-300
                        active:scale-95

                        dark:bg-white/10
                        dark:text-gray-300
                        dark:hover:bg-white/15
                      "
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(event) =>
                      handleRenameStart(
                        event,
                        chat
                      )
                    }
                    aria-label={`Rename ${
                      chat.title || "conversation"
                    }`}
                    title="Rename chat"
                    className={`
                      absolute
                      right-11
                      top-1/2
                      z-10
                      flex
                      h-8
                      w-8
                      -translate-y-1/2
                      items-center
                      justify-center

                      rounded-lg

                      opacity-0

                      transition-all
                      duration-200

                      group-hover:opacity-100

                      ${
                        activeChatId === chat.id
                          ? `
                            bg-white/10
                            text-gray-300

                            hover:bg-white/15
                            hover:text-white
                          `
                          : `
                            bg-gray-100
                            text-gray-400

                            hover:bg-gray-200
                            hover:text-gray-700

                            dark:bg-white/5
                            dark:text-gray-500
                            dark:hover:bg-white/10
                            dark:hover:text-white
                          `
                      }

                      focus-visible:opacity-100
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-gray-400
                    `}
                  >
                    <Pencil size={14} />
                  </button>
                )}

                {/* ================================================= */}
                {/* DELETE BUTTON */}
                {/* ================================================= */}

                <button
                  type="button"
                  onClick={(event) =>
                    handleDeleteChatClick(
                      event,
                      chat.id
                    )
                  }
                  aria-label={`Delete ${
                    chat.title || "conversation"
                  }`}
                  title="Delete chat"
                  className={`
                    absolute
                    right-2
                    top-1/2
                    z-10
                    flex
                    h-8
                    w-8
                    -translate-y-1/2
                    items-center
                    justify-center

                    rounded-lg

                    opacity-0

                    transition-all
                    duration-200

                    group-hover:opacity-100

                    ${
                      activeChatId === chat.id
                        ? `
                          bg-white/10
                          text-gray-300

                          hover:bg-red-500/20
                          hover:text-red-300
                        `
                        : `
                          bg-gray-100
                          text-gray-400

                          hover:bg-red-50
                          hover:text-red-500

                          dark:bg-white/5
                          dark:text-gray-500
                          dark:hover:bg-red-500/10
                          dark:hover:text-red-400
                        `
                    }

                    focus-visible:opacity-100
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-gray-400
                  `}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* ========================================================= */}
        {/* USER PROFILE */}
        {/* ========================================================= */}

        <div
          ref={profileRef}
          className="relative mt-2"
        >
          <button
            type="button"
            onClick={() =>
              setProfileOpen((prev) => !prev)
            }
            aria-expanded={profileOpen}
            className="
              flex
              w-full
              items-center
              gap-3

              rounded-2xl

              border
              border-gray-200

              bg-white/90

              p-3

              text-left

              shadow-[0_8px_25px_rgba(0,0,0,0.06)]

              backdrop-blur-xl

              transition-all
              duration-200

              hover:-translate-y-0.5
              hover:bg-white
              hover:shadow-[0_12px_30px_rgba(0,0,0,0.09)]

              dark:border-white/10
              dark:bg-white/5
              dark:shadow-[0_8px_25px_rgba(0,0,0,0.25)]
              dark:hover:bg-white/10
              dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)]
            "
          >
            <div
              className="
                relative
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center

                rounded-full

                bg-gradient-to-br
                from-gray-200
                to-gray-400

                font-bold
                text-gray-700

                shadow-inner

                dark:from-gray-700
                dark:to-gray-900
                dark:text-white
              "
            >
              Y

              <span
                className="
                  absolute
                  bottom-0
                  right-0

                  h-3
                  w-3

                  rounded-full

                  border-2
                  border-white

                  bg-emerald-400

                  dark:border-[#111416]
                "
              />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="
                  truncate
                  text-sm
                  font-semibold

                  text-gray-900

                  dark:text-white
                "
              >
                You
              </p>

              <p
                className="
                  text-xs

                  text-gray-400

                  dark:text-gray-500
                "
              >
                Free Plan
              </p>
            </div>

            <MoreVertical
              size={18}
              className={`
                shrink-0
                text-gray-400

                transition-transform
                duration-200

                dark:text-gray-500

                ${
                  profileOpen
                    ? "rotate-90 text-gray-700 dark:text-gray-200"
                    : ""
                }
              `}
            />
          </button>

          {/* ======================================================= */}
          {/* PROFILE POPUP */}
          {/* ======================================================= */}

          {profileOpen && (
            <div
              className="
                absolute
                bottom-[calc(100%+10px)]
                left-0
                right-0
                z-50

                overflow-hidden

                rounded-2xl

                border
                border-gray-200

                bg-white/95

                p-2

                shadow-[0_20px_50px_rgba(0,0,0,0.14)]

                backdrop-blur-2xl

                animate-[fadeIn_0.2s_ease-out]

                dark:border-white/10
                dark:bg-[#171a1d]/95
                dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
              "
            >
              {/* PROFILE HEADER */}

              <div
                className="
                  mb-2
                  flex
                  items-center
                  gap-3

                  rounded-xl

                  bg-gray-50

                  p-3

                  dark:bg-white/5
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center

                    rounded-full

                    bg-gradient-to-br
                    from-gray-200
                    to-gray-400

                    text-sm
                    font-bold
                    text-gray-700

                    dark:from-gray-700
                    dark:to-gray-900
                    dark:text-white
                  "
                >
                  Y
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-sm
                      font-semibold

                      text-gray-900

                      dark:text-white
                    "
                  >
                    You
                  </p>

                  <p
                    className="
                      text-[11px]

                      text-gray-400

                      dark:text-gray-500
                    "
                  >
                    Free Plan
                  </p>
                </div>
              </div>

              {/* PROFILE */}

              <button
                type="button"
                onClick={handleProfile}
                className="
                  flex
                  w-full
                  items-center
                  gap-3

                  rounded-xl

                  px-3
                  py-2.5

                  text-sm
                  font-medium

                  text-gray-700

                  transition-colors

                  hover:bg-gray-100

                  dark:text-gray-300
                  dark:hover:bg-white/10
                  dark:hover:text-white
                "
              >
                <User size={17} />
                Profile
              </button>

              {/* SETTINGS */}

              <button
                type="button"
                onClick={handleSettings}
                className="
                  flex
                  w-full
                  items-center
                  gap-3

                  rounded-xl

                  px-3
                  py-2.5

                  text-sm
                  font-medium

                  text-gray-700

                  transition-colors

                  hover:bg-gray-100

                  dark:text-gray-300
                  dark:hover:bg-white/10
                  dark:hover:text-white
                "
              >
                <Settings size={17} />
                Settings
              </button>

              {/* DIVIDER */}

              <div
                className="
                  my-2
                  h-px

                  bg-gray-200

                  dark:bg-white/10
                "
              />

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex
                  w-full
                  items-center
                  gap-3

                  rounded-xl

                  px-3
                  py-2.5

                  text-sm
                  font-medium

                  text-red-500

                  transition-colors

                  hover:bg-red-50

                  dark:hover:bg-red-500/10
                "
              >
                <LogOut size={17} />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>
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
        group
        flex
        w-full
        items-center
        gap-3

        rounded-xl

        px-3
        py-3

        text-sm
        text-black

        transition-all
        duration-200

        hover:bg-white
        hover:text-gray-900
        hover:shadow-sm

        dark:text-gray-300
        dark:hover:bg-white/10
        dark:hover:text-white
        dark:hover:shadow-none
      "
    >
      <span
        className="
          flex
          h-8
          w-8
          items-center
          justify-center

          rounded-lg

          bg-gray-100/70
          text-black

          transition

          group-hover:bg-gray-50
          group-hover:text-gray-800

          dark:bg-white/5
          dark:text-gray-400
          dark:group-hover:bg-white/10
          dark:group-hover:text-white
        "
      >
        {icon}
      </span>

      {text}
    </button>
  );
}

export default Sidebar;