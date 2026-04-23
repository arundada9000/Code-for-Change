import React, { useEffect, useState } from "react";
import { BsArrowUp } from "react-icons/bs";

function BackToTop() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const percent = (scrollTop / docHeight) * 100;
      setScrollPercent(percent);
      setVisible(scrollTop > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 cursor-pointer transition-all duration-300
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}
      `}
      aria-label="Scroll to top"
      aria-hidden={!visible}
    >
      <div
        className="relative w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(
              #0076B4 ${scrollPercent}%,
              #e5e7eb ${scrollPercent}%
            )`,
        }}
      >
        <div className="bg-white w-11 h-11 rounded-full flex justify-center items-center">
          <BsArrowUp className="text-2xl rounded-full text-secondary" />
        </div>
      </div>
    </button>
  );
}

export default BackToTop;
