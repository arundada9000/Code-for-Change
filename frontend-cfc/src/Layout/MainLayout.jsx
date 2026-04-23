import React, { useEffect, useRef, useState } from "react";
import Header from "../Components/Common/Header";
import Footer from "../Components/Common/Footer";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/UI/Modal/Sidebar";
import BackToTop from "../Components/UI/BackToTop";
import SEO from "../Components/Common/SEO";

function MainLayout() {
  const sidebarRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(false);
  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const handleClickOutside = (event) => {
      // Check if the click was outside the sidebar (and not on the sidebar itself)
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowSidebar(false); // Close the sidebar
      }
    };

    // Add event listener on mount
    if (showSidebar) {
      document.body.addEventListener("click", handleClickOutside);
    }

    // Cleanup the event listener on unmount or when sidebar closes
    return () => {
      document.body.removeEventListener("click", handleClickOutside);
    };
  }, [showSidebar]);
return (
    <div>
      <SEO />
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-secondary focus:text-white focus:rounded-full focus:font-bold text-sm"
      >
        Skip to main content
      </a>
      <Header setShowSidebar={setShowSidebar} />
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        sidebarRef={sidebarRef}
      />
      <main id="main-content" role="main">
        <Outlet />
      </main>
      <BackToTop />
      <Footer />
    </div>
  );
}

export default MainLayout;
