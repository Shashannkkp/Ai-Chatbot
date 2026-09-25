import React, { useEffect, useRef, useState } from "react";

import {
  Globe2,
  MoreVertical,
  Sparkles,
  Sun,
  Moon,
  Code2,
  Lightbulb,
  BookOpen,
  PenLine,
} from "lucide-react";

import ChatInput from "./ChatInput";
import Message from "./Message";
import { useAuth } from "../context/AuthContext";

const API_URL = "/api/chat";

function Chat({
  chat,
  onUpdateChat,
  onRequestLogin,
  darkMode,
  setDarkMode,
}) {
  const { token } = useAuth();

  const [messages, setMessages] = useState(
    chat?.messages || []
  );

  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // ================================
  // LOAD ACTIVE CHAT
  // ================================

  useEffect(() => {
    setMessages(chat?.messages || []);
  }, [chat]);

  // ================================
  // AUTO SCROLL
  // ================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ================================
  // GENERATE CHAT TITLE
  // ================================

  const generateChatTitle = (text) => {
    const cleanText = text
      .trim()
      .replace(/\s+/g, " ");

    if (cleanText.length <= 40) {
      return cleanText;
    }

    return `${cleanText.substring(0, 40).trim()}...`;
  };

  // ================================
  // UPDATE EXISTING CHAT
  // ================================

  const updateChat = (updatedMessages) => {
    setMessages(updatedMessages);

    if (chat) {
      onUpdateChat({
        ...chat,
        messages: updatedMessages,
      });
    }
  };

  // ================================
  // EDIT MESSAGE
  // ================================

  const handleEditMessage = (message, newText) => {
    if (!chat) return;

    const updatedMessages = messages.map((item) =>
      item.id === message.id
        ? {
            ...item,
            text: newText,
            timestamp: new Date().toISOString(),
          }
        : item
    );

    updateChat(updatedMessages);
  };

  // ================================
  // SEND MESSAGE
  // ================================

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const cleanText = text.trim();

    // ================================
    // CHECK LOGIN
    // ================================

    if (!token) {
      onRequestLogin?.();
      return;
    }

    // ================================
    // USER MESSAGE
    // ================================

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

    // ================================
    // CREATE NEW CHAT
    // ================================

    let currentChatId = chat?.id;

    if (!chat) {
      currentChatId = Date.now();

      const newChat = {
        id: currentChatId,
        title: generateChatTitle(cleanText),
        messages: updatedMessages,
      };

      setMessages(updatedMessages);
      onUpdateChat(newChat);
    } else {
      updateChat(updatedMessages);
    }

    setLoading(true);

    try {
      // ================================
      // CALL BACKEND
      // ================================

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: cleanText,
          chatId: chat?.id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to get response"
        );
      }

      // ================================
      // AI MESSAGE
      // ================================

      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text:
          data?.reply ||
          "I couldn't generate a response right now.",
        timestamp: new Date().toISOString(),
      };

      const serverChatId = data?.chat?.id;

      const finalMessages = [
        ...updatedMessages,
        aiMessage,
      ];

      // ================================
      // SAVE AI RESPONSE
      // ================================

      if (!chat) {
        onUpdateChat({
          id: serverChatId || currentChatId,
          title:
            data?.chat?.title ||
            generateChatTitle(cleanText),
          messages: finalMessages,
        });

        setMessages(finalMessages);
      } else {
        updateChat(finalMessages);
      }
    } catch (error) {
      console.error("Chat error:", error);

      // ================================
      // ERROR MESSAGE
      // ================================

      const errorMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text:
          error?.message === "Unauthorized"
            ? "Your session has expired. Please log in again."
            : "Sorry, something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [
        ...updatedMessages,
        errorMessage,
      ];

      if (!chat) {
        onUpdateChat({
          id: currentChatId,
          title: generateChatTitle(cleanText),
          messages: finalMessages,
        });

        setMessages(finalMessages);
      } else {
        updateChat(finalMessages);
      }
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // QUICK ACTION
  // ================================

  const handleQuickAction = (prompt) => {
    sendMessage(prompt);
  };

  return (
    <div
      className="
        flex h-full min-h-0 flex-col
        bg-transparent
      "
    >
      {/* ================= HEADER ================= */}

      <header
        className="
          flex h-[72px] shrink-0
          items-center justify-between
          border-b border-gray-200/70
          bg-white/50
          px-4
          backdrop-blur-xl
          dark:border-white/10
          dark:bg-[#111416]/60
          sm:px-6
        "
      >
        {/* LEFT */}

        <div className="flex items-center gap-3">
          <div
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              border border-gray-200/80
              bg-white
              text-gray-500
              shadow-sm
              dark:border-white/10
              dark:bg-white/[0.06]
              dark:text-gray-300
            "
          >
            <Globe2
              size={20}
              strokeWidth={1.6}
            />
          </div>

          <div>
            <h1
              className="
                text-sm
                font-semibold
                tracking-tight
                text-gray-900
                dark:text-white
                sm:text-base
              "
            >
              Nova AI
            </h1>

            <p
              className="
                text-[11px]
                text-gray-400
                dark:text-gray-500
                sm:text-xs
              "
            >
              AI Assistant
            </p>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-1">
          {/* DARK MODE */}

          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-lg
              text-gray-500
              transition-all
              duration-200
              hover:bg-gray-100
              hover:text-gray-800
              active:scale-95
              dark:text-gray-400
              dark:hover:bg-white/10
              dark:hover:text-white
            "
          >
            {darkMode ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          {/* MORE */}

          <button
            type="button"
            aria-label="More options"
            title="More options"
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-lg
              text-gray-500
              transition-all
              duration-200
              hover:bg-gray-100
              hover:text-gray-800
              active:scale-95
              dark:text-gray-400
              dark:hover:bg-white/10
              dark:hover:text-white
            "
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      {/* ================= CHAT AREA ================= */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-3
          py-5
          sm:px-5
          sm:py-6
          md:px-8
        "
      >
        {messages.length === 0 ? (
          /* ================= WELCOME SCREEN ================= */

          <div
            className="
              flex
              min-h-full
              flex-col
              items-center
              justify-center
              px-2
              pb-10
              text-center
              animate-[fadeInUp_0.5s_ease-out]
            "
          >
            {/* ICON */}

            <div
              className="
                mb-5
                flex h-16 w-16
                items-center justify-center
                rounded-2xl
                border border-gray-200
                bg-white
                text-gray-600
                shadow-[0_10px_35px_rgba(0,0,0,0.08)]
                dark:border-white/10
                dark:bg-white/[0.06]
                dark:text-gray-200
                sm:h-20
                sm:w-20
              "
            >
              <Sparkles
                size={30}
                strokeWidth={1.5}
                className="sm:h-9 sm:w-9"
              />
            </div>

            {/* TITLE */}

            <h1
              className="
                text-2xl
                font-semibold
                tracking-tight
                text-gray-900
                dark:text-white
                sm:text-3xl
              "
            >
              Hey, I'm{" "}
              <span className="text-emerald-500">
                Nova
              </span>
              . How can I help you today?
            </h1>

            <p
              className="
                mt-2
                max-w-md
                text-sm
                leading-6
                text-gray-500
                dark:text-gray-400
                sm:text-[15px]
              "
            >
              Ask me anything, explore ideas, write code,
              or get help with your next project.
            </p>

            {/* QUICK ACTIONS */}

            <div
              className="
                mt-8
                grid
                w-full
                max-w-2xl
                grid-cols-1
                gap-3
                sm:grid-cols-2
              "
            >
              {/* REACT */}

              <button
                type="button"
                onClick={() =>
                  handleQuickAction(
                    "Explain React.js in simple terms."
                  )
                }
                className="
                  group
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-gray-200
                  bg-white/80
                  p-4
                  text-left
                  shadow-sm
                  backdrop-blur-xl
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:shadow-md
                  active:scale-[0.98]
                  dark:border-white/10
                  dark:bg-white/[0.04]
                  dark:hover:bg-white/[0.07]
                "
              >
                <Code2
                  size={19}
                  className="
                    shrink-0
                    text-gray-500
                    transition-transform
                    duration-200
                    group-hover:scale-110
                    dark:text-gray-300
                  "
                />

                <span
                  className="
                    text-sm
                    font-medium
                    text-gray-700
                    dark:text-gray-300
                  "
                >
                  Explain React.js
                </span>
              </button>

              {/* PROJECT IDEAS */}

              <button
                type="button"
                onClick={() =>
                  handleQuickAction(
                    "Give me some creative ideas for a web development project."
                  )
                }
                className="
                  group
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-gray-200
                  bg-white/80
                  p-4
                  text-left
                  shadow-sm
                  backdrop-blur-xl
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:shadow-md
                  active:scale-[0.98]
                  dark:border-white/10
                  dark:bg-white/[0.04]
                  dark:hover:bg-white/[0.07]
                "
              >
                <Lightbulb
                  size={19}
                  className="
                    shrink-0
                    text-gray-500
                    transition-transform
                    duration-200
                    group-hover:scale-110
                    dark:text-gray-300
                  "
                />

                <span
                  className="
                    text-sm
                    font-medium
                    text-gray-700
                    dark:text-gray-300
                  "
                >
                  Give me project ideas
                </span>
              </button>

              {/* JAVASCRIPT */}

              <button
                type="button"
                onClick={() =>
                  handleQuickAction(
                    "Teach me an important JavaScript concept."
                  )
                }
                className="
                  group
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-gray-200
                  bg-white/80
                  p-4
                  text-left
                  shadow-sm
                  backdrop-blur-xl
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:shadow-md
                  active:scale-[0.98]
                  dark:border-white/10
                  dark:bg-white/[0.04]
                  dark:hover:bg-white/[0.07]
                "
              >
                <BookOpen
                  size={19}
                  className="
                    shrink-0
                    text-gray-500
                    transition-transform
                    duration-200
                    group-hover:scale-110
                    dark:text-gray-300
                  "
                />

                <span
                  className="
                    text-sm
                    font-medium
                    text-gray-700
                    dark:text-gray-300
                  "
                >
                  Teach me JavaScript
                </span>
              </button>

              {/* WRITING */}

              <button
                type="button"
                onClick={() =>
                  handleQuickAction(
                    "Help me write a professional message."
                  )
                }
                className="
                  group
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-gray-200
                  bg-white/80
                  p-4
                  text-left
                  shadow-sm
                  backdrop-blur-xl
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:shadow-md
                  active:scale-[0.98]
                  dark:border-white/10
                  dark:bg-white/[0.04]
                  dark:hover:bg-white/[0.07]
                "
              >
                <PenLine
                  size={19}
                  className="
                    shrink-0
                    text-gray-500
                    transition-transform
                    duration-200
                    group-hover:scale-110
                    dark:text-gray-300
                  "
                />

                <span
                  className="
                    text-sm
                    font-medium
                    text-gray-700
                    dark:text-gray-300
                  "
                >
                  Help me write
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= MESSAGES ================= */

          <div
            className="
              mx-auto
              flex
              w-full
              max-w-5xl
              flex-col
              gap-5
              pb-4
              sm:gap-6
            "
          >
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                onEditMessage={handleEditMessage}
              />
            ))}

            {/* ================= THINKING INDICATOR ================= */}

            {loading && (
              <div
                className="
                  flex
                  items-start
                  gap-2.5
                  animate-[fadeInUp_0.35s_ease-out]
                  sm:gap-3
                "
              >
                {/* AI ICON */}

                <div
                  className="
                    relative
                    mt-1
                    flex h-9 w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-gray-200/80
                    bg-white/90
                    text-gray-500
                    shadow-[0_4px_18px_rgba(0,0,0,0.07)]
                    backdrop-blur-xl
                    dark:border-white/10
                    dark:bg-white/[0.06]
                    dark:text-gray-300
                    sm:h-10
                    sm:w-10
                  "
                >
                  <div
                    className="
                      absolute
                      inset-0
                      rounded-xl
                      bg-gray-200/40
                      blur-md
                      animate-pulse
                      dark:bg-white/[0.05]
                    "
                  />

                  <Sparkles
                    size={18}
                    strokeWidth={1.7}
                    className="
                      relative
                      z-10
                      animate-[spin_2.5s_linear_infinite]
                    "
                  />
                </div>

                {/* THINKING BUBBLE */}

                <div
                  className="
                    flex
                    min-h-[54px]
                    items-center
                    gap-3
                    rounded-2xl
                    rounded-tl-md
                    border
                    border-gray-200/80
                    bg-white/90
                    px-4
                    py-3
                    shadow-[0_6px_20px_rgba(0,0,0,0.04)]
                    backdrop-blur-xl
                    dark:border-white/10
                    dark:bg-[#171b1e]/90
                    dark:shadow-[0_8px_25px_rgba(0,0,0,0.2)]
                    sm:px-5
                  "
                >
                  <span
                    className="
                      text-[13px]
                      font-medium
                      text-gray-500
                      dark:text-gray-400
                      sm:text-sm
                    "
                  >
                    Nova AI is thinking
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-gray-400
                        animate-[bounce_1.2s_infinite]
                        dark:bg-gray-500
                      "
                    />

                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-gray-400
                        animate-[bounce_1.2s_0.15s_infinite]
                        dark:bg-gray-500
                      "
                    />

                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-gray-500
                        animate-[bounce_1.2s_0.3s_infinite]
                        dark:bg-gray-500
                      "
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ================= INPUT ================= */}

      <div
        className="
          shrink-0
          px-3
          pb-3
          sm:px-5
          sm:pb-5
          md:px-8
        "
      >
        <div className="mx-auto w-full max-w-5xl">
          <ChatInput
            onSendMessage={sendMessage}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;