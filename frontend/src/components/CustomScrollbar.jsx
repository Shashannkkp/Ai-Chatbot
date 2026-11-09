
import { useEffect, useRef, useState } from "react";

function CustomScrollbar({ scrollRef }) {
  const trackRef = useRef(null);
  const dragRef = useRef(null);

  const [scrollPosition, setScrollPosition] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updateScrollbar = () => {
      const maxScroll =
        container.scrollHeight - container.clientHeight;

      setVisible(maxScroll > 1);

      if (maxScroll <= 1) {
        setScrollPosition(0);
        return;
      }

      setScrollPosition(container.scrollTop / maxScroll);
    };

    updateScrollbar();
    container.addEventListener("scroll", updateScrollbar);

    const resizeObserver = new ResizeObserver(updateScrollbar);
    resizeObserver.observe(container);

    if (container.firstElementChild) {
      resizeObserver.observe(container.firstElementChild);
    }

    const mutationObserver = new MutationObserver(updateScrollbar);
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      container.removeEventListener("scroll", updateScrollbar);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [scrollRef]);

  const handlePointerDown = (event) => {
    const container = scrollRef.current;

    if (!container) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      startY: event.clientY,
      startScrollTop: container.scrollTop,
    };
  };

  const handlePointerMove = (event) => {
    const container = scrollRef.current;
    const track = trackRef.current;

    if (!dragRef.current || !container || !track) return;

    const trackHeight = track.clientHeight;
    const thumbHeight = trackHeight * 0.7;
    const availableTrack = trackHeight - thumbHeight;

    if (availableTrack <= 0) return;

    const maxScroll =
      container.scrollHeight - container.clientHeight;

    const movement = event.clientY - dragRef.current.startY;

    const scrollMovement =
      (movement / availableTrack) * maxScroll;

    container.scrollTop = Math.max(
      0,
      Math.min(
        maxScroll,
        dragRef.current.startScrollTop + scrollMovement
      )
    );
  };

  const handlePointerUp = (event) => {
    dragRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={trackRef}
      className="custom-scrollbar-track"
      aria-hidden="true"
    >
      <div
        className="custom-scrollbar-thumb"
        style={{
          height: "70%",
          top: `${scrollPosition * 30}%`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}

export default CustomScrollbar;
