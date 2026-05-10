import React, { useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { navItems } from "../../../Data/navItems";
import { Link, useLocation } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { useAuth } from "../../../Context/AuthContext";
import { usePWAInstall } from "../../../Hooks/usePWAInstall";

function Sidebar({ showSidebar, setShowSidebar, sidebarRef }) {
  const location = useLocation();
  const { user } = useAuth();
  const { canInstall, installApp } = usePWAInstall();
  const sideBarItems = navItems.filter(
    (items) => !["More"].includes(items.title),
  );

  // Close sidebar on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showSidebar) {
        setShowSidebar(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showSidebar, setShowSidebar]);

  return (
    <aside
      ref={sidebarRef}
      aria-label="Navigation menu"
      aria-hidden={!showSidebar}
      className={`fixed top-0 z-100 bg-primary px-10 pb-5 w-96 max-h-screen transition-all duration-500 ease-in overflow-y-scroll ${
        showSidebar ? "right-0" : "-right-[108%]"
      }`}
    >
      <div className="flex bg-primary sticky top-0 pt-5 items-center justify-between pb-4 border-b border-b-secondary">
        <img
          src="/logo.png"
          alt="Code for Change Nepal Logo"
          className="w-20"
        />
        <button
          className="text-3xl text-white hover:text-secondary transition-colors p-1"
          onClick={() => {
            setShowSidebar(false);
          }}
          aria-label="Close navigation menu"
        >
          <IoMdClose className="text-3xl" />
        </button>
      </div>

      <div className="flex flex-col gap-10 pt-10">
        {[
          ...sideBarItems,
          {
            title: "Careers",
            path: "/internships",
            requiresAuth: true,
          },
          {
            title: "Certificate Verification",
            path: "/certificate-verification",
          },
          {
            title: "Internship Application",
            path: "/internship-application",
          },
          {
            title: "Gallery",
            path: "/gallery",
          },
          {
            title: "FAQ",
            path: "/faq",
          },
          {
            title: "Contact us",
            path: "/contact-us",
          },
          {
            title: "Resume Builder",
            path: "/resume-builder",
            requiresAuth: true,
          },
          user
            ? { title: "My Profile", path: "/profile" }
            : { title: "Register", path: "/register" },
        ]
          .filter((sub) => !sub.requiresAuth || user)
          .map((val, i) => (
            <Link
              key={i}
              to={val.path}
              className={`font-light text-lg hover:text-secondary flex gap-1 items-center transition ${
                location.pathname === val.path ? "text-secondary" : "text-white"
              }`}
              onClick={() => {
                setShowSidebar(false);
              }}
            >
              {val.title}
            </Link>
          ))}
          
        {canInstall && (
          <button
            onClick={() => {
              setShowSidebar(false);
              installApp();
            }}
            className="mt-4 font-bold text-lg text-emerald-400 border-2 border-emerald-400 rounded-xl py-3 px-4 text-center hover:bg-emerald-400 hover:text-primary transition-colors"
          >
            Install App
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
