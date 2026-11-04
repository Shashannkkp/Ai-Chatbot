import React, { useEffect, useRef, useState } from "react";
import {
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

function Chat({ chat, onUpdateChat, darkMode, setDarkMode }) {
  const { token } = useAuth();

  const [messages, setMessages] = useState(chat?.messages || []);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    setMessages(chat?.messages || []);
  }, [chat]);

  useEffect(() => {
    if (hasMessages) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, loading, hasMessages]);

  const generateChatTitle = (text) => {
    const cleanText = text.trim().replace(/\s+/g, " ");
    return cleanText.length <= 40
      ? cleanText
      : `${cleanText.substring(0, 40).trim()}...`;
  };

  const updateChat = (updatedMessages) => {
    setMessages(updatedMessages);

    if (chat) {
      onUpdateChat({
        ...chat,
        messages: updatedMessages,
      });
    }
  };

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

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const cleanText = text.trim();

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: cleanText,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    let currentChatId = chat?.id;

    if (!chat) {
      currentChatId = Date.now();

      setMessages(updatedMessages);

      onUpdateChat({
        id: currentChatId,
        title: generateChatTitle(cleanText),
        messages: updatedMessages,
      });
    } else {
      updateChat(updatedMessages);
    }

    setLoading(true);

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: cleanText,
          chatId:
            typeof chat?.id === "string" ? chat.id : null,
        }),
      });

      const responseText = await response.text();

let data = {};

try {
  data = responseText ? JSON.parse(responseText) : {};
} catch {
  throw new Error(
    `Invalid server response (${response.status}): ${responseText.slice(0, 300)}`
  );
}

if (!response.ok) {
  throw new Error(
    data?.error || `Request failed with status ${response.status}`
  );
}

      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: data?.reply || "I couldn't generate a response right now.",
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      const serverChatId = data?.chat?.id;

      if (!chat) {
        onUpdateChat({
          id: serverChatId || currentChatId,
          title: data?.chat?.title || generateChatTitle(cleanText),
          messages: finalMessages,
        });

        setMessages(finalMessages);
      } else if (
        serverChatId &&
        String(serverChatId) !== String(chat.id)
      ) {
        onUpdateChat({
          ...chat,
          id: serverChatId,
          title: data?.chat?.title || chat.title,
          messages: finalMessages,
        });

        setMessages(finalMessages);
      } else {
        updateChat(finalMessages);
      }
    } catch (error) {
      console.error("Chat error:", {
  message: error.message,
  stack: error.stack,
});

      const errorMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text:
          error?.message === "Unauthorized"
            ? "Your session has expired. Please log in again."
            : "Sorry, something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, errorMessage];

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

  const handleQuickAction = (prompt) => {
    sendMessage(prompt);
  };

  const quickActions = [
    {
      label: "Explain React.js",
      icon: Code2,
      prompt: "Explain React.js in simple terms.",
    },
    {
      label: "Give me project ideas",
      icon: Lightbulb,
      prompt: "Give me some creative ideas for a web development project.",
    },
    {
      label: "Teach me JavaScript",
      icon: BookOpen,
      prompt: "Teach me an important JavaScript concept.",
    },
    {
      label: "Help me write",
      icon: PenLine,
      prompt: "Help me write a professional message.",
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <header className="flex h-[50px] shrink-0 items-center justify-between  bg-transparent px-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#111416]/60 sm:px-6">
        <div className="flex items-center  gap-3">
          

         
        </div>

        <div className="flex items-center gap-1
        
        ">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 active:scale-95 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white
            "
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>

          
        </div>
      </header>

      {hasMessages ? (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5 sm:px-5 sm:py-6 md:px-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 pb-4 sm:gap-6">
              {messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  onEditMessage={handleEditMessage}
                />
              ))}

              {loading && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-gray-300">
                    <Sparkles
                      size={18}
                      className="animate-pulse"
                    />
                  </div>

                  <div className="flex min-h-[54px] items-center gap-3 rounded-2xl rounded-tl-md border border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#171b1e]">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Nova AI is thinking
                    </span>
                    <span className="animate-pulse text-gray-400">•••</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="shrink-0 bg-transparent px-3 pb-3 pt-2 sm:px-5 sm:pb-5 md:px-6 md:py-11">
            <div className="mx-auto w-full max-w-5xl">
              <ChatInput
                onSendMessage={sendMessage}
                disabled={loading}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          
<div
  className="
    mb-5
    flex h-14 w-14
    items-center justify-center
    rounded-2xl
    text-emerald-500
    shadow-sm

    transform-gpu
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:scale-110
    hover:shadow-lg

    dark:text-gray-200
    sm:h-16 sm:w-16
  "
>
              <Sparkles size={28} strokeWidth={1.5} />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Hey, I'm{" "}
              <span className="text-emerald-500">Nova</span>.
              <br className="sm:hidden" /> How can I help you today?
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400 sm:text-[15px]">
              Ask me anything, explore ideas, write code, or get help with your next project.
            </p>

            <div className="mt-7 w-full">
              <ChatInput
                onSendMessage={sendMessage}
                disabled={loading}
              />
            </div>

            <div className="mt-5 grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
              {quickActions.map(({ label, icon: Icon, prompt }) => (
            
<button
  key={label}
  type="button"
  onClick={() => handleQuickAction(prompt)}
  disabled={loading}
  className="
    group
    flex items-center gap-3
    rounded-xl
    border border-gray-200/80
    bg-white/80
    p-3.5
    text-left

    transition-all duration-300 ease-out
    transform-gpu

    hover:-translate-y-1
    hover:scale-[1.02]
    hover:border-gray-300
    hover:bg-white
    hover:shadow-[0_10px_25px_rgba(0,0,0,0.10)]

    active:translate-y-0
    active:scale-[0.98]

    disabled:cursor-not-allowed
    disabled:opacity-50

    dark:border-white/10
    dark:bg-white/[0.04]
    dark:hover:border-white/20
    dark:hover:bg-white/[0.08]
    dark:hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)]

    sm:p-4
  "
>

                  <Icon
                    size={19}
                    className="shrink-0 text-gray-500 dark:text-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;