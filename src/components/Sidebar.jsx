import { useEffect, useRef, useState } from "react";

import {
  Plus,
  Compass,
  Star,
  FileText,
  ChevronRight,
  MoreVertical,
  Sparkles,
  Globe2,
  MessageSquare,
  User,
  Settings,
  LogOut,
} from "lucide-react";

function Sidebar({
  onNewChat,
  chats = [],
  activeChatId,
  onSelectChat,
}) {
  // ================= PROFILE MENU =================

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

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
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ================= MENU ACTIONS =================

  const handleProfile = () => {
    setProfileOpen(false);
    console.log("Profile clicked");
  };

  const handleSettings = () => {
    setProfileOpen(false);
    console.log("Settings clicked");
  };

  const handleUpgrade = () => {
    setProfileOpen(false);
    console.log("Upgrade clicked");
  };

  const handleLogout = () => {
    setProfileOpen(false);
    console.log("Logout clicked");
  };

  return (
    <aside
      className="
        flex h-full w-67 shrink-0 flex-col
        rounded-3xl
        border border-white/80
        bg-white/70
        p-3
        shadow-[0_20px_50px_rgba(0,0,0,0.06)]
        backdrop-blur-xl

        transition-colors
        duration-300

        dark:border-white/10
        dark:bg-[#111416]/90
        dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]
      "
    >
      {/* ========================================================= */}
      {/* LOGO */}
      {/* ========================================================= */}

      <div className="mb-8 flex items-center gap-3 px-2">
        <div
          className="
            relative flex h-12 w-12 items-center justify-center
            rounded-2xl
            border border-white
            bg-gradient-to-br from-gray-100 to-gray-300
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
              absolute right-0 top-0 h-3 w-3
              rounded-full
              border-2 border-white
              bg-emerald-400

              dark:border-[#111416]
            "
          />
        </div>

        <div>
          <h1
            className="
              text-3xl font-bold tracking-tight
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
        onClick={onNewChat}
        className="
          group mb-7 flex w-full items-center justify-center gap-2
          rounded-2xl
          border border-white
          bg-white/90
          px-4 py-3.5
          text-base font-semibold text-gray-800
          shadow-[0_8px_25px_rgba(0,0,0,0.07),inset_0_1px_2px_white]
          transition-all duration-200

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
            flex h-7 w-7 items-center justify-center
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
          mb-1 px-2
          text-base font-bold uppercase
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
          my-1 h-px
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
            text-base font-bold uppercase
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
              px-2 py-0.5
              text-sm font-semibold
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
      {/* CHAT LIST */}
      {/* ========================================================= */}

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
            <div
              className="
                mb-3 flex h-10 w-10
                items-center justify-center
                rounded-xl
                border border-gray-200
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
                text-sm font-medium text-gray-500
                dark:text-gray-400
              "
            >
              No recent chats
            </p>

            <p
              className="
                mt-1 text-xs leading-5 text-gray-400
                dark:text-gray-600
              "
            >
              Start a conversation and it will appear here.
            </p>
          </div>
        ) : (
          chats.map((chat) => (
            <button
              type="button"
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`
                group flex w-full items-center gap-3
                rounded-xl px-3 py-3
                text-left
                transition-all duration-200

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
                  flex h-8 w-8 shrink-0
                  items-center justify-center
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
                <p
                  className={`
                    truncate text-sm font-medium

                    ${
                      activeChatId === chat.id
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }
                  `}
                >
                  {chat.title || "New Conversation"}
                </p>

                <p
                  className={`
                    mt-0.5 text-[10px]

                    ${
                      activeChatId === chat.id
                        ? "text-gray-400"
                        : "text-gray-400 dark:text-gray-600"
                    }
                  `}
                >
                  {chat.messages?.length || 0} messages
                </p>
              </div>

              {/* ARROW */}

              <ChevronRight
                size={15}
                className={`
                  shrink-0 transition-all

                  ${
                    activeChatId === chat.id
                      ? "text-gray-400"
                      : "text-gray-300 opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-gray-600"
                  }
                `}
              />
            </button>
          ))
        )}
      </div>

      {/* ========================================================= */}
      {/* UPGRADE CARD */}
      {/* ========================================================= */}

      <div
        className="
          mb-2 mt-3
          overflow-hidden
          rounded-2xl
          border border-white
          bg-white/70
          p-4
          shadow-[0_10px_30px_rgba(0,0,0,0.06)]
          backdrop-blur-xl

          transition-colors
          duration-300

          dark:border-white/10
          dark:bg-white/5
          dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)]
        "
      >
        <div className="mb-2 flex items-center gap-2">
          <div
            className="
              flex h-8 w-8 items-center justify-center
              rounded-lg
              bg-gray-100

              dark:bg-white/10
            "
          >
            <Sparkles
              size={16}
              className="text-gray-500 dark:text-gray-400"
            />
          </div>

          <span
            className="
              text-sm font-semibold
              text-gray-800

              dark:text-gray-200
            "
          >
            Upgrade your AI
          </span>
        </div>

        <p
          className="
            mb-3 text-xs leading-5
            text-gray-400

            dark:text-gray-500
          "
        >
          Unlock more powerful AI features.
        </p>

        <button
          type="button"
          onClick={handleUpgrade}
          className="
            w-full rounded-xl
            bg-gray-900
            py-2.5
            text-xs font-semibold
            text-white
            shadow-lg
            transition-all duration-200

            hover:-translate-y-0.5
            hover:bg-gray-800

            dark:bg-white
            dark:text-gray-900
            dark:hover:bg-gray-200
          "
        >
          Upgrade
        </button>
      </div>

      {/* ========================================================= */}
      {/* USER PROFILE */}
      {/* ========================================================= */}

      <div
        ref={profileRef}
        className="relative mt-2"
      >
        {/* PROFILE BUTTON */}

        <button
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
          aria-expanded={profileOpen}
          className="
            flex w-full items-center gap-3
            rounded-2xl
            border border-gray-200
            bg-white/90
            p-3
            text-left
            shadow-[0_8px_25px_rgba(0,0,0,0.06)]
            backdrop-blur-xl
            transition-all duration-200

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
          {/* AVATAR */}

          <div
            className="
              relative flex h-11 w-11 shrink-0
              items-center justify-center
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
                absolute bottom-0 right-0
                h-3 w-3
                rounded-full
                border-2 border-white
                bg-emerald-400

                dark:border-[#111416]
              "
            />
          </div>

          {/* USER INFO */}

          <div className="min-w-0 flex-1">
            <p
              className="
                truncate
                text-sm font-semibold
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

          {/* MORE ICON */}

          <MoreVertical
            size={18}
            className={`
              shrink-0
              text-gray-400
              transition-transform duration-200

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

              border border-gray-200
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
            {/* POPUP HEADER */}

            <div
              className="
                mb-2
                flex items-center gap-3
                rounded-xl
                bg-gray-50
                p-3

                dark:bg-white/5
              "
            >
              <div
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-gray-200
                  to-gray-400
                  text-sm font-bold
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
                    text-sm font-semibold
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
                flex w-full items-center gap-3
                rounded-xl
                px-3 py-2.5
                text-sm font-medium
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
                flex w-full items-center gap-3
                rounded-xl
                px-3 py-2.5
                text-sm font-medium
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

            {/* UPGRADE */}

            <button
              type="button"
              onClick={handleUpgrade}
              className="
                flex w-full items-center gap-3
                rounded-xl
                px-3 py-2.5
                text-sm font-medium
                text-gray-700
                transition-colors

                hover:bg-gray-100

                dark:text-gray-300
                dark:hover:bg-white/10
                dark:hover:text-white
              "
            >
              <Sparkles size={17} />

              Upgrade Plan
            </button>

            {/* DIVIDER */}

            <div
              className="
                my-2 h-px
                bg-gray-200

                dark:bg-white/10
              "
            />

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              className="
                flex w-full items-center gap-3
                rounded-xl
                px-3 py-2.5
                text-sm font-medium
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
        rounded-xl
        px-3 py-3
        text-sm
        text-black
        transition-all duration-200

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
          flex h-8 w-8
          items-center justify-center
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