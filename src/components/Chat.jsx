import React, { useEffect, useRef, useState } from "react";
import {
  Globe2,
  Search,
  MoreVertical,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";

import ChatInput from "./ChatInput";
import Message from "./Message";

const API_URL = "http://localhost:5000/api/chat";

function Chat({
  chat,
  onUpdateChat,
  darkMode,
  setDarkMode,
}) {
  const [messages, setMessages] = useState(
    chat?.messages || []
  );

  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // ================= LOAD SELECTED CHAT =================

  useEffect(() => {
    setMessages(chat?.messages || []);
  }, [chat]);

  // ================= AUTO SCROLL =================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // ================= SEND MESSAGE =================

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const cleanText = text.trim();

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: cleanText,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setIsLoading(true);

    // Create chat ID if this is a new conversation
    const chatId = chat?.id || Date.now();

    // First user message becomes chat title
    const title =
      chat?.title ||
      cleanText.slice(0, 30) +
        (cleanText.length > 30 ? "..." : "");

    try {
      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: cleanText,
        }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: data.reply,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [
        ...updatedMessages,
        aiMessage,
      ];

      setMessages(finalMessages);

      // Save / update chat
      onUpdateChat({
        id: chatId,
        title,
        messages: finalMessages,
      });
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: "Sorry, something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [
        ...updatedMessages,
        errorMessage,
      ];

      setMessages(finalMessages);

      // Save even if API fails
      onUpdateChat({
        id: chatId,
        title,
        messages: finalMessages,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ================= QUICK ACTIONS =================

  const quickActions = [
    "Explain React",
    "Write some code",
    "Give me project ideas",
  ];

  return (
    <div
      className="
        flex
        h-full
        min-w-0
        flex-col

        bg-white/45

        transition-colors
        duration-300

        dark:bg-[#0f1214]/80
      "
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header
        className="
          flex
          h-[70px]
          shrink-0
          items-center
          justify-between

          border-b
          border-gray-200/70

          bg-white/65

          px-3

          backdrop-blur-2xl

          transition-colors
          duration-300

          dark:border-white/10
          dark:bg-[#111416]/85

          sm:h-[78px]
          sm:px-5

          md:px-7
        "
      >

        {/* ================= LEFT SIDE ================= */}

        <div className="flex min-w-0 items-center gap-3">

          {/* LOGO */}

          <div
            className="
              relative
              flex
              h-10
              w-10
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

              sm:h-11
              sm:w-11
            "
          >

            <Globe2
              size={20}
              strokeWidth={1.7}
            />

            {/* ONLINE DOT */}

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

          {/* TITLE */}

          <div className="min-w-0">

            <h2
              className="
                truncate
                text-base
                font-bold
                text-black

                transition-colors
                duration-300

                dark:text-white

                sm:text-lg
              "
            >
              Nova Ai
            </h2>

            <div className="flex items-center gap-1">

              <span className="text-[9px] text-emerald-500">
                ●
              </span>

              <span
                className="
                  text-xs
                  text-gray-400

                  dark:text-gray-500

                  sm:text-sm
                "
              >
                Online
              </span>

            </div>

          </div>

        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* SEARCH */}

          <button
            title="Search"
            className="
              hidden
              h-10
              w-10
              items-center
              justify-center
              rounded-xl

              border
              border-gray-200

              bg-white/70

              text-black

              shadow-sm

              transition-all
              duration-200

              hover:-translate-y-0.5
              hover:bg-white
              hover:shadow-md

              dark:border-white/10
              dark:bg-white/5
              dark:text-white
              dark:hover:bg-white/10

              sm:flex
            "
          >
            <Search size={17} />
          </button>

          {/* ================= DARK MODE ================= */}

          <button
            onClick={() =>
              setDarkMode((prev) => !prev)
            }
            title={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            aria-label={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl

              border
              border-gray-200

              bg-white/70

              text-black

              shadow-sm

              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:bg-white
              hover:shadow-md

              dark:border-white/10
              dark:bg-white/5
              dark:text-white
              dark:hover:bg-white/10

              sm:h-10
              sm:w-10
            "
          >

            {darkMode ? (
              <Sun
                size={17}
                className="transition-transform duration-300"
              />
            ) : (
              <Moon
                size={17}
                className="transition-transform duration-300"
              />
            )}

          </button>

          {/* MORE */}

          <button
            title="More"
            className="
              hidden
              h-10
              w-10
              items-center
              justify-center
              rounded-xl

              border
              border-gray-200

              bg-white/70

              text-black

              shadow-sm

              transition-all
              duration-200

              hover:-translate-y-0.5
              hover:bg-white
              hover:shadow-md

              dark:border-white/10
              dark:bg-white/5
              dark:text-white
              dark:hover:bg-white/10

              sm:flex
            "
          >
            <MoreVertical size={17} />
          </button>

          {/* PROFILE */}

          <button
            title="Profile"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full

              border
              border-white

              bg-gradient-to-br
              from-gray-200
              to-gray-400

              text-sm
              font-bold
              text-black

              shadow-[0_8px_20px_rgba(0,0,0,0.1)]

              transition-all
              duration-200

              hover:-translate-y-0.5

              dark:border-white/10
              dark:from-gray-700
              dark:to-gray-900
              dark:text-white

              sm:h-11
              sm:w-11
            "
          >
            Y
          </button>

        </div>

      </header>

      {/* ================================================= */}
      {/* CHAT AREA */}
      {/* ================================================= */}

      <div
        className="
          relative
          flex-1
          overflow-y-auto

          bg-gradient-to-br
          from-white
          via-[#f7f8f9]
          to-[#eceff1]

          transition-colors
          duration-300

          dark:from-[#0b0d0f]
          dark:via-[#101315]
          dark:to-[#15191c]
        "
      >

        {/* ================= GLOSSY BACKGROUND ================= */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-10
            h-72
            w-72
            -translate-x-1/2
            rounded-full
            bg-white/90
            blur-3xl

            dark:bg-white/[0.025]

            sm:h-96
            sm:w-96
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-1/2
            h-60
            w-[400px]
            -translate-x-1/2
            rounded-full
            bg-gray-200/50
            blur-3xl

            dark:bg-gray-700/10

            sm:w-[500px]
          "
        />

        {/* ================= CONTENT ================= */}

        <div
          className="
            relative
            mx-auto
            flex
            min-h-full
            max-w-6xl
            flex-col

            px-4
            py-7

            sm:px-5
            sm:py-10

            md:px-10
          "
        >

          {/* ================================================= */}
          {/* WELCOME SCREEN */}
          {/* ================================================= */}

          {messages.length === 0 && (

            <div
              className="
                flex
                flex-1
                flex-col
                items-center
                justify-center
                text-center
              "
            >

              {/* AI LOGO */}

              <div className="relative mb-6 sm:mb-7">

                <div
                  className="
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-[26px]

                    border
                    border-white

                    bg-white/80

                    text-gray-600

                    shadow-[0_15px_45px_rgba(0,0,0,0.1),inset_0_1px_4px_white]

                    backdrop-blur-xl

                    transition-colors
                    duration-300

                    dark:border-white/10
                    dark:bg-white/5
                    dark:text-gray-300

                    sm:h-24
                    sm:w-24
                    sm:rounded-[30px]
                  "
                >

                  <Globe2
                    size={34}
                    strokeWidth={1.3}
                    className="sm:h-10 sm:w-10"
                  />

                </div>

                <div
                  className="
                    absolute
                    -inset-4
                    -z-10
                    rounded-[40px]
                    bg-white/60
                    blur-2xl

                    dark:bg-white/[0.03]
                  "
                />

              </div>

              {/* HEADING */}

              <h1
                className="
                  max-w-3xl

                  text-2xl
                  font-bold
                  leading-tight
                  tracking-tight

                  text-gray-900

                  transition-colors
                  duration-300

                  dark:text-white

                  sm:text-3xl
                  md:text-4xl
                "
              >

                Hey, I'm{" "}

                <span className="text-emerald-500">
                  Nova
                </span>

                . How can I help you today?

              </h1>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-4
                  max-w-xl

                  text-sm
                  leading-6

                  text-gray-400

                  transition-colors
                  duration-300

                  dark:text-gray-500

                  sm:text-base
                "
              >
                Ask me anything. I can help with coding,
                ideas, explanations, writing and much more.
              </p>

              {/* ================= QUICK ACTIONS ================= */}

              <div
                className="
                  mt-7
                  flex
                  max-w-xl
                  flex-wrap
                  justify-center
                  gap-2

                  sm:mt-8
                "
              >

                {quickActions.map((item) => (

                  <button
                    key={item}
                    onClick={() =>
                      handleSendMessage(item)
                    }
                    disabled={isLoading}
                    className="
                      rounded-xl

                      border
                      border-gray-200

                      bg-white/75

                      px-3
                      py-2.5

                      text-xs
                      font-medium

                      text-black

                      shadow-[0_4px_15px_rgba(0,0,0,0.04)]

                      backdrop-blur-xl

                      transition-all
                      duration-200

                      hover:-translate-y-0.5
                      hover:bg-white
                      hover:text-gray-900
                      hover:shadow-md

                      disabled:cursor-not-allowed
                      disabled:opacity-50

                      dark:border-white/10
                      dark:bg-white/5
                      dark:text-gray-200
                      dark:hover:bg-white/10
                      dark:hover:text-white

                      sm:px-4
                    "
                  >
                    {item}
                  </button>

                ))}

              </div>

            </div>

          )}

          {/* ================================================= */}
          {/* MESSAGES */}
          {/* ================================================= */}

          {messages.length > 0 && (

            <div className="space-y-6">

              {messages.map((message) => (

                <Message
                  key={message.id}
                  message={message}
                />

              ))}

              {/* ================= LOADING ================= */}

              {isLoading && (

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl

                      border
                      border-gray-200

                      bg-white

                      text-black

                      shadow-sm

                      transition-colors
                      duration-300

                      dark:border-white/10
                      dark:bg-white/5
                      dark:text-white
                    "
                  >

                    <Sparkles size={17} />

                  </div>

                  <div
                    className="
                      rounded-2xl

                      border
                      border-gray-200

                      bg-white/80

                      px-5
                      py-4

                      shadow-sm

                      backdrop-blur-xl

                      transition-colors
                      duration-300

                      dark:border-white/10
                      dark:bg-white/5
                    "
                  >

                    <div className="flex gap-1.5">

                      <span
                        className="
                          h-2
                          w-2
                          animate-bounce
                          rounded-full
                          bg-blue-400
                        "
                      />

                      <span
                        className="
                          h-2
                          w-2
                          animate-bounce
                          rounded-full
                          bg-emerald-400
                        "
                        style={{
                          animationDelay: "120ms",
                        }}
                      />

                      <span
                        className="
                          h-2
                          w-2
                          animate-bounce
                          rounded-full
                          bg-black

                          dark:bg-white
                        "
                        style={{
                          animationDelay: "240ms",
                        }}
                      />

                    </div>

                  </div>

                </div>

              )}

              <div ref={messagesEndRef} />

            </div>

          )}

        </div>

      </div>

      {/* ================================================= */}
      {/* INPUT */}
      {/* ================================================= */}

      <div
        className="
          shrink-0

          border-t
          border-gray-200/60

          bg-white/55

          px-3
          pb-3
          pt-3

          backdrop-blur-2xl

          transition-colors
          duration-300

          dark:border-white/10
          dark:bg-[#111416]/85

          sm:px-5
          sm:pb-4
          sm:pt-4

          md:px-10
        "
      >

        <div className="mx-auto w-full max-w-6xl">

          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
          />

          <p
            className="
              mt-2
              text-center

              text-[10px]
              font-medium

              text-gray-500

              transition-colors
              duration-300

              dark:text-gray-600
            "
          >
            AI can make mistakes. Check important information.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Chat;