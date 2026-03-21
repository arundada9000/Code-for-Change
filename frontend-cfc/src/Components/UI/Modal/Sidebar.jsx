import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { navItems } from "../../../Data/navItems";
import { Link, useLocation } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { useAuth } from "../../../Context/AuthContext";

function Sidebar({ showSidebar, setShowSidebar, sidebarRef }) {
  const location = useLocation();
  const { user } = useAuth();
  const sideBarItems = navItems.filter(
    (items) => !["More"].includes(items.title),
  );
  // console.log(sideBarItems);
  return (
    <aside
      ref={sidebarRef}
      className={`fixed top-0 z-100 bg-primary px-10 py-5 w-96 max-h-screen transition-all duration-500 ease-in overflow-y-scroll ${
        showSidebar ? "right-0" : "-right-[108%]"
      }`}
    >
      <div className="flex items-center justify-between pb-4 border-b border-b-secondary">
        <img src="/logo.png" alt="logo" className="w-20" />
        <IoMdClose
          className="text-3xl text-white"
          onClick={() => {
            setShowSidebar(false);
          }}
        />
      </div>

      <div className="flex flex-col gap-10 pt-10">
        {[
          ...sideBarItems,
          {
            title: "Careers",
            path: "/internships",
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
          user
            ? { title: "My Profile", path: "/profile" }
            : { title: "Join Us", path: "/join-us" },
        ].map((val, i) => (
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
      </div>
    </aside>
  );
}

export default Sidebar;
