import { useRef, useState } from "react";
import { Plus, ArrowRight } from "lucide-react";

function ChatInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setMessage(e.target.value);

    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(
        textarea.scrollHeight,
        200
      )}px`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const text = message.trim();
    if (!text || disabled) return;

    onSendMessage(text);
    setMessage("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-5xl">
      <div
        className="
          relative
          flex
          items-end
          gap-2
          rounded-full
          border
          border-gray-200/80
          bg-white
          px-4
          py-3
          shadow-sm
          backdrop-blur-3xl
          transition-all
          duration-200
          focus-within:border-gray-300
          dark:border-white/10
          dark:bg-[#242424]
          dark:focus-within:border-white/20
          sm:gap-3
          sm:px-5
          sm:py-4
        "
      >
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

        <button
          type="button"
          aria-label="Add"
          disabled={disabled}
          className="
            relative
            z-10
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            text-gray-700
            transition
            hover:bg-gray-100
            disabled:opacity-40
            dark:text-gray-200
            dark:hover:bg-white/10
          "
        >
          <Plus size={22} />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          disabled={disabled}
          placeholder="Ask Nova..."
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="
            relative
            z-10
            max-h-[200px]
            min-h-10
            flex-1
            resize-none
            overflow-y-auto
            bg-transparent
            py-2
            text-[15px]
            leading-6
            text-gray-900
            outline-none
            placeholder:text-gray-500
            disabled:opacity-50
            dark:text-gray-100
          "
        />

        <button
          type="submit"
          aria-label="Send message"
          disabled={!message.trim() || disabled}
          className="
            relative
            z-10
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-blue-400
            text-white
            transition
            hover:bg-green-400
            active:scale-95
            disabled:bg-gray-200
            disabled:text-gray-400
            dark:bg-white
            dark:text-black
            dark:hover:bg-gray-200
            dark:disabled:bg-white/15
            dark:disabled:text-gray-500
          "
        >
          <ArrowRight size={21} strokeWidth={2.2} />
        </button>
      </div>
    </form>
  );
}

export default ChatInput;