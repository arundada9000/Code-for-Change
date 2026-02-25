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
      <Header setShowSidebar={setShowSidebar} />
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        sidebarRef={sidebarRef}
      />
      <Outlet />
      <BackToTop />
     <Footer/>
    </div>
  );
}

export default MainLayout;
