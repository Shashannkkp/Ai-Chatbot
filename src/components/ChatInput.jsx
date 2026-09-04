import { useState } from "react";
import {
  Plus,
  Sparkles,
  Paperclip,
  ArrowUp,
  Settings2,
} from "lucide-react";

function ChatInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim() || disabled) return;

    onSendMessage(message.trim());
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="
          relative
          overflow-hidden
          rounded-[24px]
          border
          border-black/20
          bg-white/75
          p-3
          shadow-[0_15px_45px_rgba(0,0,0,0.08),inset_0_1px_3px_white]
          backdrop-blur-3xl

          transition-all
          duration-300

          dark:border-white/10
          dark:bg-[#171b1e]/85
          dark:shadow-[0_15px_45px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.05)]

          focus-within:border-gray-400
          dark:focus-within:border-white/20
        "
      >
        {/* ================= GLOSS ================= */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/4
            top-0
            h-20
            w-1/2
            rounded-full
            bg-white/80
            blur-2xl

            transition-opacity
            duration-300

            dark:bg-white/[0.04]
          "
        />

        {/* ================= TEXTAREA ================= */}

        <textarea
          rows="1"
          value={message}
          disabled={disabled}
          placeholder="Ask anything..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          className="
            relative
            w-full
            resize-none
            bg-transparent
            px-3
            py-2
            text-base
            text-gray-800
            outline-none
            placeholder:text-gray-400

            transition-colors
            duration-300

            dark:text-gray-100
            dark:placeholder:text-gray-600

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        />

        {/* ================= CONTROLS ================= */}

        <div className="relative mt-2 flex items-center justify-between">
          {/* LEFT CONTROLS */}

          <div className="flex items-center gap-2">
            {/* PLUS */}

            <button
              type="button"
              title="Add"
              disabled={disabled}
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-xl
                border border-gray-200
                bg-white/80
                text-black
                shadow-sm
                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:bg-white
                hover:text-gray-700
                hover:shadow-md

                dark:border-white/10
                dark:bg-white/5
                dark:text-gray-300
                dark:hover:bg-white/10
                dark:hover:text-white

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <Plus size={18} />
            </button>

            {/* AUTO */}

            <button
              type="button"
              title="Auto mode"
              disabled={disabled}
              className="
                hidden
                items-center
                gap-1.5
                rounded-xl
                border border-gray-200
                bg-white/80
                px-3
                py-2
                text-xs
                font-medium
                text-black
                shadow-sm
                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:bg-white
                hover:text-gray-800
                hover:shadow-md

                dark:border-white/10
                dark:bg-white/5
                dark:text-gray-300
                dark:hover:bg-white/10
                dark:hover:text-white

                sm:flex
              "
            >
              <Settings2 size={14} />
              Auto
            </button>

            {/* SPARKLE */}

            <button
              type="button"
              title="AI tools"
              disabled={disabled}
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-xl
                border border-gray-200
                bg-white/80
                text-black
                shadow-sm
                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:bg-white
                hover:text-gray-700
                hover:shadow-md

                dark:border-white/10
                dark:bg-white/5
                dark:text-gray-300
                dark:hover:bg-white/10
                dark:hover:text-white

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <Sparkles size={15} />
            </button>

            {/* ATTACHMENT */}

            <button
              type="button"
              title="Attach file"
              disabled={disabled}
              className="
                hidden
                h-9 w-9
                items-center justify-center
                rounded-xl
                border border-gray-200
                bg-white/80
                text-black
                shadow-sm
                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:bg-white
                hover:text-gray-700
                hover:shadow-md

                dark:border-white/10
                dark:bg-white/5
                dark:text-gray-300
                dark:hover:bg-white/10
                dark:hover:text-white

                disabled:cursor-not-allowed
                disabled:opacity-40

                sm:flex
              "
            >
              <Paperclip size={15} />
            </button>
          </div>

          {/* ================= SEND ================= */}

          <button
            type="submit"
            disabled={!message.trim() || disabled}
            title={disabled ? "AI is responding..." : "Send message"}
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              bg-gray-900
              text-white
              shadow-lg
              transition-all
              duration-200

              hover:-translate-y-0.5
              hover:bg-black
              hover:shadow-xl

              active:scale-95

              disabled:cursor-not-allowed
              disabled:opacity-30

              dark:bg-white
              dark:text-gray-900
              dark:hover:bg-gray-200
            "
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </form>
  );
}

export default ChatInput;