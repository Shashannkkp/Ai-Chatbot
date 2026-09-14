import React, { useState } from "react";
import { Globe2, Copy, Check, Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Message({ message, onEditMessage }) {
  const isAI = message.sender === "ai";

  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);

  // ================= COPY MESSAGE =================

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // ================= COPY CODE =================

  const handleCopyCode = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);

      setCopiedCode(index);

      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    } catch (error) {
      console.error("Code copy failed:", error);
    }
  };

  // ================= EDIT =================

  const handleStartEdit = () => {
    setEditedText(message.text);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedText(message.text);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    const text = editedText.trim();

    if (!text) return;

    if (onEditMessage) {
      onEditMessage(message, text);
    }

    setIsEditing(false);
  };

  return (
    <div
      className={`
        group flex w-full items-start gap-2.5
        animate-[fadeInUp_0.4s_ease-out]
        sm:gap-3
        ${isAI ? "justify-start" : "justify-end"}
      `}
    >
      {/* ================= AI ICON ================= */}

      {isAI && (
        <div
          className="
            mt-1
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-xl
            border border-gray-200/80
            bg-white/90
            text-gray-500
            shadow-[0_4px_15px_rgba(0,0,0,0.06)]
            backdrop-blur-xl
            transition-all
            duration-300
            group-hover:scale-105
            dark:border-white/10
            dark:bg-white/[0.06]
            dark:text-gray-300
            sm:h-10
            sm:w-10
          "
        >
          <Globe2 size={18} strokeWidth={1.6} />
        </div>
      )}

      {/* ================= MESSAGE AREA ================= */}

      <div
        className={`
          relative min-w-0
          max-w-[calc(100%-48px)]
          sm:max-w-[85%]
          md:max-w-[75%]
          ${isAI ? "mr-auto" : "ml-auto"}
        `}
      >
        {/* ================= EDIT MODE ================= */}

        {!isAI && isEditing ? (
          <div className="w-full min-w-[280px] sm:min-w-[400px]">
            <textarea
              value={editedText}
              onChange={(event) =>
                setEditedText(event.target.value)
              }
              autoFocus
              rows={Math.min(
                Math.max(editedText.split("\n").length, 2),
                6
              )}
              className="
                w-full
                resize-none
                rounded-2xl
                border
                border-gray-300
                bg-white
                px-4
                py-3
                text-[14px]
                leading-6
                text-gray-800
                outline-none
                transition
                focus:border-gray-400
                focus:ring-1
                focus:ring-gray-300

                dark:border-white/10
                dark:bg-[#1b1f22]
                dark:text-white
                dark:focus:border-white/20
                dark:focus:ring-white/10

                sm:text-[15px]
              "
            />

            {/* SIMPLE ACTIONS */}

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="
                  rounded-lg
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-gray-500
                  transition
                  hover:bg-gray-100
                  hover:text-gray-800

                  dark:text-gray-400
                  dark:hover:bg-white/5
                  dark:hover:text-white
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editedText.trim()}
                className="
                  rounded-lg
                  bg-gray-800
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-white
                  transition
                  hover:bg-gray-700
                  active:scale-95
                  disabled:cursor-not-allowed
                  disabled:opacity-40

                  dark:bg-white
                  dark:text-gray-900
                  dark:hover:bg-gray-200
                "
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ================= MESSAGE BUBBLE ================= */}

            <div
              className={`
                relative overflow-hidden
                rounded-2xl
                px-4 py-3.5
                sm:px-5 sm:py-4
                shadow-[0_6px_20px_rgba(0,0,0,0.04)]
                transition-all
                duration-300

                ${
                  isAI
                    ? `
                      rounded-tl-md
                      border border-gray-200/80
                      bg-white/90
                      text-gray-700
                      backdrop-blur-xl

                      hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]

                      dark:border-white/10
                      dark:bg-[#171b1e]/90
                      dark:text-gray-300
                    `
                    : `
                      rounded-tr-md
                      border border-gray-700
                      bg-gray-800
                      text-white
                      shadow-[0_8px_25px_rgba(0,0,0,0.12)]

                      hover:bg-gray-750

                      dark:border-white/10
                      dark:bg-[#24292d]
                      dark:text-white
                      dark:hover:bg-[#292f34]
                    `
                }
              `}
            >
              {/* ================= AI GLOW ================= */}

              {isAI && (
                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-12
                    -top-12
                    h-28
                    w-28
                    rounded-full
                    bg-gray-200/30
                    blur-3xl
                    dark:bg-white/[0.025]
                  "
                />
              )}

              {/* ================= AI MESSAGE ================= */}

              {isAI ? (
                <div className="relative text-[14px] leading-7 sm:text-[15px]">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1
                          className="
                            mb-5 mt-1
                            text-2xl
                            font-bold
                            tracking-tight
                            text-gray-900
                            dark:text-white
                          "
                        >
                          {children}
                        </h1>
                      ),

                      h2: ({ children }) => (
                        <h2
                          className="
                            mb-3 mt-7
                            text-xl
                            font-bold
                            tracking-tight
                            text-gray-900
                            dark:text-white
                          "
                        >
                          {children}
                        </h2>
                      ),

                      h3: ({ children }) => (
                        <h3
                          className="
                            mb-2 mt-6
                            text-lg
                            font-bold
                            text-gray-900
                            dark:text-gray-100
                          "
                        >
                          {children}
                        </h3>
                      ),

                      p: ({ children }) => (
                        <p className="mb-4 last:mb-0">
                          {children}
                        </p>
                      ),

                      strong: ({ children }) => (
                        <strong
                          className="
                            font-semibold
                            text-gray-900
                            dark:text-white
                          "
                        >
                          {children}
                        </strong>
                      ),

                      em: ({ children }) => (
                        <em
                          className="
                            italic
                            text-gray-600
                            dark:text-gray-400
                          "
                        >
                          {children}
                        </em>
                      ),

                      ul: ({ children }) => (
                        <ul
                          className="
                            mb-5 ml-5
                            list-disc
                            space-y-2
                          "
                        >
                          {children}
                        </ul>
                      ),

                      ol: ({ children }) => (
                        <ol
                          className="
                            mb-5 ml-5
                            list-decimal
                            space-y-2
                          "
                        >
                          {children}
                        </ol>
                      ),

                      li: ({ children }) => (
                        <li className="pl-1">
                          {children}
                        </li>
                      ),

                      code: ({ className, children }) => {
                        const isCodeBlock =
                          className?.includes("language-");

                        if (!isCodeBlock) {
                          return (
                            <code
                              className="
                                rounded-md
                                border border-gray-200
                                bg-gray-100
                                px-1.5 py-1
                                font-mono
                                text-[12px]
                                text-gray-800

                                dark:border-white/10
                                dark:bg-white/10
                                dark:text-gray-200
                              "
                            >
                              {children}
                            </code>
                          );
                        }

                        return (
                          <code
                            className="
                              block
                              min-w-max
                              font-mono
                              text-[12px]
                              leading-6
                              text-gray-100
                              sm:text-[13px]
                            "
                          >
                            {children}
                          </code>
                        );
                      },

                      pre: ({ children }) => {
                        const codeElement =
                          React.Children.toArray(children).find(
                            (child) => child?.type === "code"
                          );

                        const className =
                          codeElement?.props?.className || "";

                        const language = className
                          .replace("language-", "")
                          .trim();

                        const code = String(
                          codeElement?.props?.children || ""
                        ).replace(/\n$/, "");

                        const codeIndex = `${
                          message.timestamp || "message"
                        }-${code.slice(0, 20)}`;

                        return (
                          <div
                            className="
                              my-5
                              overflow-hidden
                              rounded-xl
                              border border-gray-800
                              bg-[#111827]
                              shadow-[0_8px_25px_rgba(0,0,0,0.12)]
                              dark:border-white/10
                              dark:bg-[#0b0e10]
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                justify-between
                                border-b
                                border-gray-700
                                bg-[#1f2937]
                                px-3
                                py-2
                                dark:border-white/10
                                dark:bg-[#111416]
                              "
                            >
                              <span
                                className="
                                  text-[11px]
                                  font-medium
                                  uppercase
                                  tracking-wider
                                  text-gray-400
                                "
                              >
                                {language || "code"}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyCode(
                                    code,
                                    codeIndex
                                  )
                                }
                                className="
                                  flex
                                  items-center
                                  gap-1.5
                                  rounded-md
                                  px-2
                                  py-1
                                  text-[11px]
                                  font-medium
                                  text-gray-400
                                  transition
                                  hover:bg-white/10
                                  hover:text-white
                                "
                              >
                                {copiedCode === codeIndex ? (
                                  <>
                                    <Check
                                      size={13}
                                      className="text-emerald-400"
                                    />
                                    <span className="text-emerald-400">
                                      Copied
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={13} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="overflow-x-auto p-4 sm:p-5">
                              {children}
                            </div>
                          </div>
                        );
                      },

                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            font-medium
                            text-emerald-600
                            underline
                            decoration-emerald-300
                            underline-offset-2
                            hover:text-emerald-700
                            dark:text-emerald-400
                            dark:hover:text-emerald-300
                          "
                        >
                          {children}
                        </a>
                      ),

                      blockquote: ({ children }) => (
                        <blockquote
                          className="
                            my-5
                            border-l-4
                            border-emerald-400
                            bg-gray-50
                            px-4 py-3
                            text-gray-600
                            dark:border-emerald-500
                            dark:bg-white/5
                            dark:text-gray-400
                          "
                        >
                          {children}
                        </blockquote>
                      ),

                      hr: () => (
                        <div
                          className="
                            my-6 h-px
                            bg-gray-200
                            dark:bg-white/10
                          "
                        />
                      ),

                      table: ({ children }) => (
                        <div
                          className="
                            my-5
                            overflow-x-auto
                            rounded-xl
                            border border-gray-200
                            dark:border-white/10
                          "
                        >
                          <table className="w-full border-collapse text-sm">
                            {children}
                          </table>
                        </div>
                      ),

                      thead: ({ children }) => (
                        <thead
                          className="
                            bg-gray-100
                            dark:bg-white/10
                          "
                        >
                          {children}
                        </thead>
                      ),

                      th: ({ children }) => (
                        <th
                          className="
                            border-b
                            border-gray-200
                            px-4 py-3
                            text-left
                            font-semibold
                            text-gray-800
                            dark:border-white/10
                            dark:text-gray-200
                          "
                        >
                          {children}
                        </th>
                      ),

                      td: ({ children }) => (
                        <td
                          className="
                            border-b
                            border-gray-100
                            px-4 py-3
                            text-gray-700
                            dark:border-white/5
                            dark:text-gray-400
                          "
                        >
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              ) : (
                /* ================= USER MESSAGE ================= */

                <p
                  className="
                    whitespace-pre-wrap
                    text-[14px]
                    leading-7
                    sm:text-[15px]
                  "
                >
                  {message.text}
                </p>
              )}

              {/* ================= TIME ================= */}

              <p
                className={`
                  mt-2.5
                  text-[10px]
                  font-medium
                  ${
                    isAI
                      ? "text-gray-400 dark:text-gray-600"
                      : "text-gray-400 dark:text-gray-500"
                  }
                `}
              >
                {message.timestamp
                  ? new Date(
                      message.timestamp
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Just now"}
              </p>
            </div>

            {/* ================= EDIT BUTTON ================= */}

            {!isAI && (
              <button
                type="button"
                onClick={handleStartEdit}
                title="Edit message"
                aria-label="Edit message"
                className="
                  absolute
                  bottom-12
                  left-1
                  -translate-x-full
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-gray-600
                  bg-gray-700/90
                  text-gray-300
                  opacity-0
                  shadow-sm
                  backdrop-blur-xl
                  transition
                  hover:bg-gray-600
                  hover:text-white
                  group-hover:opacity-100
                  max-sm:opacity-100
                "
              >
                <Pencil size={15} />
              </button>
            )}

            {/* ================= COPY BUTTON ================= */}

            <button
              type="button"
              onClick={handleCopy}
              title={copied ? "Copied" : "Copy message"}
              aria-label={copied ? "Copied" : "Copy message"}
              className={`
                absolute
                bottom-2
                flex h-8 w-8
                items-center justify-center
                rounded-lg
                border
                shadow-sm
                backdrop-blur-xl
                transition-all
                duration-200

                ${
                  isAI
                    ? `
                      right-1
                      translate-x-full
                      border-gray-200
                      bg-white/90
                      text-gray-400
                      hover:bg-white
                      hover:text-gray-700
                      dark:border-white/10
                      dark:bg-white/10
                      dark:text-gray-400
                      dark:hover:bg-white/15
                      dark:hover:text-white
                    `
                    : `
                      left-1
                      -translate-x-full
                      border-gray-600
                      bg-gray-700/90
                      text-gray-300
                      hover:bg-gray-600
                      hover:text-white
                      dark:border-white/10
                      dark:bg-white/10
                      dark:text-gray-400
                      dark:hover:bg-white/15
                      dark:hover:text-white
                    `
                }

                ${
                  copied
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }

                max-sm:opacity-100
              `}
            >
              {copied ? (
                <Check
                  size={15}
                  className="text-emerald-500"
                />
              ) : (
                <Copy size={15} />
              )}
            </button>
          </>
        )}
      </div>

      {/* ================= USER ICON ================= */}

      {!isAI && (
        <div
          className="
            mt-1
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-full
            border border-white
            bg-gradient-to-br
            from-gray-200
            to-gray-400
            text-xs
            font-bold
            text-gray-700
            shadow-[0_5px_15px_rgba(0,0,0,0.1)]
            dark:border-white/10
            dark:from-gray-700
            dark:to-gray-900
            dark:text-white
            sm:h-10
            sm:w-10
          "
        >
          Y
        </div>
      )}
    </div>
  );
}

export default Message;