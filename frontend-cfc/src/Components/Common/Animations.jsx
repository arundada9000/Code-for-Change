import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

// Shared hook with a safety fallback timer
const useSafeInView = (margin = "50px", fallbackMs = 800) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin, amount: 0 });
  const [forced, setForced] = useState(false);

  useEffect(() => {
    // Safety net: if IntersectionObserver never fires, force visibility
    const timer = setTimeout(() => setForced(true), fallbackMs);
    return () => clearTimeout(timer);
  }, [fallbackMs]);

  return { ref, visible: isInView || forced };
};

export const FadeIn = ({ children, className = "", delay = 0, duration = 0.5 }) => {
  const { ref, visible } = useSafeInView();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideUp = ({ children, className = "", delay = 0, duration = 0.5, y = 30 }) => {
  const { ref, visible } = useSafeInView();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : y }}
      transition={{ duration, delay, type: "spring", stiffness: 80, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({
  children,
  className = "",
  delayChildren = 0.05,
  staggerChildren = 0.1,
}) => {
  const { ref, visible } = useSafeInView();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: { delayChildren, staggerChildren },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = "", y = 20 }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 80, damping: 20 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};