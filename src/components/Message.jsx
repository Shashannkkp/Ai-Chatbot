import React, { useState } from "react";
import { Globe2, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Message({ message }) {
  const isAI = message.sender === "ai";
  const [copied, setCopied] = useState(false);

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

  return (
    <div
      className={`group flex items-start gap-3 ${
        isAI ? "justify-start" : "justify-end"
      }`}
    >
      {/* ================= AI ICON ================= */}

      {isAI && (
        <div
          className="
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-xl
            border border-gray-200
            bg-white
            text-gray-500
            shadow-sm

            transition-colors
            duration-300

            dark:border-white/10
            dark:bg-white/5
            dark:text-gray-300
          "
        >
          <Globe2 size={19} strokeWidth={1.6} />
        </div>
      )}

      {/* ================= MESSAGE AREA ================= */}

      <div className="relative max-w-[90%] md:max-w-[75%]">

        {/* ================= MESSAGE BUBBLE ================= */}

        <div
          className={`
            rounded-2xl
            px-5 py-4
            shadow-sm
            transition-colors
            duration-300

            ${
              isAI
                ? `
                  rounded-tl-md
                  border border-gray-200
                  bg-white/85
                  text-gray-700
                  shadow-[0_8px_25px_rgba(0,0,0,0.05)]

                  dark:border-white/10
                  dark:bg-[#171b1e]/90
                  dark:text-gray-300
                  dark:shadow-[0_8px_25px_rgba(0,0,0,0.25)]
                `
                : `
                  rounded-tr-md
                  border border-gray-300
                  bg-gray-800
                  text-white
                  shadow-[0_8px_25px_rgba(0,0,0,0.12)]

                  dark:border-white/10
                  dark:bg-[#24292d]
                  dark:text-white
                `
            }
          `}
        >
          {/* ================= AI RESPONSE ================= */}

          {isAI ? (
            <div className="text-[15px] leading-7">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  /* ================= HEADINGS ================= */

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

                  /* ================= PARAGRAPH ================= */

                  p: ({ children }) => (
                    <p className="mb-4 last:mb-0">
                      {children}
                    </p>
                  ),

                  /* ================= TEXT ================= */

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

                  /* ================= LISTS ================= */

                  ul: ({ children }) => (
                    <ul className="mb-5 ml-5 list-disc space-y-2">
                      {children}
                    </ul>
                  ),

                  ol: ({ children }) => (
                    <ol className="mb-5 ml-5 list-decimal space-y-2">
                      {children}
                    </ol>
                  ),

                  li: ({ children }) => (
                    <li className="pl-1">
                      {children}
                    </li>
                  ),

                  /* ================= CODE ================= */

                  code: ({ className, children }) => {
                    const isCodeBlock =
                      className?.includes("language-");

                    if (!isCodeBlock) {
                      return (
                        <code
                          className="
                            rounded-md
                            bg-gray-100
                            px-1.5 py-1
                            font-mono
                            text-[13px]
                            text-gray-800

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
                          font-mono
                          text-[13px]
                          leading-6
                          text-gray-100
                        "
                      >
                        {children}
                      </code>
                    );
                  },

                  pre: ({ children }) => (
                    <pre
                      className="
                        my-5
                        overflow-x-auto
                        rounded-xl
                        border
                        border-gray-800
                        bg-[#111827]
                        p-5
                        shadow-inner

                        dark:border-white/10
                        dark:bg-[#0b0e10]
                      "
                    >
                      {children}
                    </pre>
                  ),

                  /* ================= LINKS ================= */

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
                        transition

                        hover:text-emerald-700

                        dark:text-emerald-400
                        dark:decoration-emerald-700
                        dark:hover:text-emerald-300
                      "
                    >
                      {children}
                    </a>
                  ),

                  /* ================= BLOCKQUOTE ================= */

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

                  /* ================= DIVIDER ================= */

                  hr: () => (
                    <div
                      className="
                        my-6 h-px
                        bg-gray-200

                        dark:bg-white/10
                      "
                    />
                  ),

                  /* ================= TABLE ================= */

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

            <p className="whitespace-pre-wrap text-[15px] leading-7">
              {message.text}
            </p>
          )}

          {/* ================= TIME ================= */}

          <p
            className="
              mt-3
              text-[10px]
              text-gray-400

              dark:text-gray-600
            "
          >
            {message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now"}
          </p>
        </div>

        {/* ================= COPY BUTTON ================= */}

        <button
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
                  -right-10
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
                  -left-10
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
      </div>

      {/* ================= USER ICON ================= */}

      {!isAI && (
        <div
          className="
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-full
            border border-white
            bg-gradient-to-br
            from-gray-200
            to-gray-400
            text-xs
            font-bold
            text-gray-700
            shadow-md

            dark:border-white/10
            dark:from-gray-700
            dark:to-gray-900
            dark:text-white
          "
        >
          Y
        </div>
      )}
    </div>
  );
}

export default Message;