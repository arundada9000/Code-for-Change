import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RiMenu3Fill } from "react-icons/ri";
import { FiChevronDown } from "react-icons/fi";
import { navItems } from "../../Data/navItems";
import { useAuth } from "../../Context/AuthContext";

function Header({ setShowSidebar }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky py-2 max-w-7xl pl-6 pr-2 mx-auto z-50 transition-all rounded-full duration-500 ${
        scrolled
          ? "bg-primary/60 backdrop-blur-md top-5 border border-white/20 shadow-2xl"
          : "bg-transparent top-0 border-none"
      }`}
      role="banner"
    >
      <div className="flex items-center justify-between">
        <Link to="/" className="shrink-0" aria-label="Code for Change Nepal - Home">
          <img src="/logo.png" alt="Code for Change Nepal Logo" className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="relative hidden lg:flex items-center gap-1"
          aria-label="Main navigation"
          role="navigation"
          onMouseLeave={() => setHoveredPath(null)}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isPillUnderMe =
              hoveredPath === item.path || (isActive && !hoveredPath);
            return (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={() => setHoveredPath(item.path)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 flex items-center gap-1 rounded-full 
                ${
                  isPillUnderMe
                    ? "text-white" // Text is white when pill is present
                    : scrolled
                      ? "text-white/80" // Scrolled but not active/hovered
                      : "text-primary" // Not scrolled and not active/hovered
                }`}
              >
                {/* Sliding Background Pill */}
                {isPillUnderMe && (
                  <motion.div
                    layoutId="navbar-pill"
                    className="absolute inset-0 bg-primary rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}

                <span className="relative z-10">{item.title}</span>
                {item.subMenu && <FiChevronDown className="relative z-10" />}

                {/* Dropdown Animation */}
                <AnimatePresence>
                  {item.subMenu && hoveredPath === item.path && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 top-full pt-4 w-56"
                    >
                      <div className="bg-primary border border-white/10 shadow-xl rounded-2xl p-2">
                        {item.subMenu
                          .filter((sub) => !sub.requiresAuth || user)
                          .map((sub) => (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              className="block px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 rounded-xl transition-colors"
                            >
                              {sub.title}
                            </Link>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link
            to={user ? "/profile" : "/register"}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              user
                ? "bg-primary text-white border border-white/20 hover:scale-105"
                : "bg-secondary text-white hover:shadow-[0_0_20px_rgba(var(--secondary),0.4)]"
            }`}
          >
            {user ? "Profile" : "Register"}
          </Link>

          <button
              onClick={(event) => {
                event.stopPropagation();
                setShowSidebar(true);
              }}
              className="lg:hidden p-2 text-primary"
              aria-label="Open navigation menu"
              aria-expanded="false"
            >
              <RiMenu3Fill
                size={28}
                className={scrolled ? "text-white" : "text-primary"}
                aria-hidden="true"
              />
            </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
