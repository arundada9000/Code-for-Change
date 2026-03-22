import React from 'react';
import { motion } from 'framer-motion';

export const FadeIn = ({ children, className = "", delay = 0, duration = 0.5 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideUp = ({ children, className = "", delay = 0, duration = 0.5, y = 30 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration, delay, type: "spring", stiffness: 80, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ children, className = "", delayChildren = 0.1, staggerChildren = 0.15 }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren,
            staggerChildren,
          },
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
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 20 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
