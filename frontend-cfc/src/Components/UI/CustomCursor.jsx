import React, { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

const CustomCursor = () => {
  const [isVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia("(pointer: fine)").matches;
    }
    return false;
  });
  
  const [variant, setVariant] = useState('default');
  
  // Instant DOM mapping (0 lag whatsoever)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  useEffect(() => {
    if (!isVisible) return;
    
    document.body.classList.add('custom-cursor-active');

    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

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
        setVariant('button');
      } else if (isText) {
        setVariant('input');
      } else {
        setVariant('default');
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  const variants = {
    default: { 
      width: 14, 
      height: 14, 
      borderRadius: "50%",
      backgroundColor: "#0076B4", // Solid Blue
      border: "2px solid #FFFFFF", // Thick white outline
      boxShadow: "0px 2px 8px rgba(0,0,0,0.3)" 
    },
    button: { 
      width: 14,  // The dot stays exactly the same size
      height: 14, 
      borderRadius: "50%",
      backgroundColor: "#0076B4", 
      border: "2px solid #FFFFFF", 
      boxShadow: "0px 2px 8px rgba(0,0,0,0.3)",
    },
    input: { 
      width: 4, 
      height: 28, 
      borderRadius: "4px",
      backgroundColor: "#0076B4",
      border: "0px solid transparent",
      boxShadow: "0px 0px 0px transparent"
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999] flex items-center justify-center"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={variant}
      variants={variants}
      transition={{ 
        type: "tween", 
        ease: "easeOut", 
        duration: 0.2 
      }}
    >
      {/* The Satellite Radar Lock Ring */}
      <motion.div
        className="absolute rounded-full border-[2px] border-dashed border-[#0076B4]"
        initial={{ width: 14, height: 14, opacity: 0 }}
        animate={{ 
          width: variant === 'button' ? 56 : 14, 
          height: variant === 'button' ? 56 : 14,
          opacity: variant === 'button' ? 1 : 0,
          rotate: variant === 'button' ? 180 : 0
        }}
        transition={{
          width: { type: "spring", stiffness: 400, damping: 25 },
          height: { type: "spring", stiffness: 400, damping: 25 },
          opacity: { duration: 0.2 },
          rotate: { repeat: Infinity, duration: 6, ease: "linear" } 
        }}
      />

      {/* Cybernetic Crosshairs */}
      <motion.div
        className="absolute flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: variant === 'button' ? 1 : 0,
          scale: variant === 'button' ? 1 : 0.5
        }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        <div className="absolute top-[-36px] w-[2px] h-[8px] bg-[#00A155]" />
        <div className="absolute bottom-[-36px] w-[2px] h-[8px] bg-[#00A155]" />
        <div className="absolute left-[-36px] h-[2px] w-[8px] bg-[#00A155]" />
        <div className="absolute right-[-36px] h-[2px] w-[8px] bg-[#00A155]" />
      </motion.div>
    </motion.div>
  );
};

export default CustomCursor;
