import React, { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

const CustomCursor = () => {
  // Initialize visibility purely based on device capability to prevent cascading renders
  const [isVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia("(pointer: fine)").matches;
    }
    return false;
  });
  const [variant, setVariant] = useState('default'); // 'default', 'button', 'input'
  const [hoverSize, setHoverSize] = useState({ width: 56, height: 24 });
  const [isClicking, setIsClicking] = useState(false);

  // Direct DOM mapping using Motion Values to prevent React re-renders on mousemove
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  useEffect(() => {
    if (!isVisible) return;

    // Add global class to hide native cursor
    document.body.classList.add('custom-cursor-active');

    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Event delegation for highly efficient hover detection
    const handleMouseOver = (e) => {
      if (!e.target || !e.target.tagName) return;
      
      const target = e.target;
      let computedStyle;
      try {
        computedStyle = window.getComputedStyle(target);
      } catch {
        return;
      }

      const isPointer = computedStyle.cursor === 'pointer' || target.closest('a, button, [role="button"], select');
      const isText = computedStyle.cursor === 'text' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (isPointer) {
        // Find the actual button element to capture its exact size
        const btn = target.closest('a, button, [role="button"], select') || target;
        const rect = btn.getBoundingClientRect();
        
        // Expand width and height to frame the entire button + padding
        setHoverSize({
          width: Math.max(56, rect.width + 16),
          height: Math.max(24, rect.height + 8)
        });
        setVariant('button');
      } else if (isText) {
        setVariant('input');
      } else {
        setVariant('default');
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      // Safety cleanup to restore native cursor if unmounted
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  const variants = {
    default: {
      width: 24,
      height: 24,
      x: "-50%",
      y: "-50%",
      color: "#64748b", // slate-500
      scale: isClicking ? 0.8 : 1,
      opacity: 1
    },
    button: {
      width: hoverSize.width, 
      height: hoverSize.height,
      x: "-50%",
      y: "-50%",
      color: "#00A155", // Emerald branding
      scale: isClicking ? 0.9 : 1.2,
      opacity: 0.9
    },
    input: {
      width: 10,
      height: 20,
      x: "-50%",
      y: "-50%",
      color: "#0076B4", // Secondary brand color
      scale: 1,
      opacity: 1
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999] flex items-center justify-center font-mono font-black text-xl transition-colors duration-300 drop-shadow-md mix-blend-difference"
      style={{
        x: cursorX,
        y: cursorY,
      }}
      animate={variant}
      variants={variants}
    >
      <motion.div
        animate={{ color: variants[variant].color }}
        className="flex items-center justify-between w-full"
      >
        {variant === 'input' ? (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-full h-full bg-current rounded-sm"
          />
        ) : (
          <>
            <span>{'{'}</span>
            <span>{'}'}</span>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CustomCursor;
