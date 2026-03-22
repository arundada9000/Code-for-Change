import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { RiMenu3Fill } from "react-icons/ri";
import { FiChevronDown } from "react-icons/fi";
import { navItems } from "../../Data/navItems";
import { useAuth } from "../../Context/AuthContext";

function Header({ setShowSidebar }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        // Change 50 to your desired scroll position
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky py-2 max-w-7xl pr-3 pl-7 mx-auto z-50 transition-all rounded-full duration-300 ${scrolled
        ? "bg-primary/50 backdrop-blur-xs top-5 border border-white/30"
        : "bg-transparent top-0 border-none"
        }`}
    >
      <div className=" flex items-center gap-3 justify-between">
        <Link to="/">
          <img src="/logo.png" alt="Code for Change Nepal Logo" className="h-12" />
        </Link>
        <nav className="lg:gap-2 hidden lg:flex items-center">
          {navItems.map((val, i) => (
            <div key={i} className="relative group">
              <Link
                to={val.path}
                className={`hover:bg-primary py-1 border-2 border-transparent px-4 flex items-center gap-1 rounded-full hover:text-white transition duration-200
          ${location.pathname === val.path
                    ? "text-white bg-primary border-2 border-primary"
                    : scrolled
                      ? "text-white"
                      : "text-primary"
                  }`}
              >
                {val.title}
                {val.subMenu && <FiChevronDown className="text-lg" />}
              </Link>

              {/* Dropdown */}
              {val.subMenu && (
                <div className="absolute left-0 top-full pt-4 group-hover:block invisible group-hover:visible">
                  <div
                    className="relative w-60 overflow-hidden bg-primary text-white shadow-xl rounded-2xl border border-white
                    h-0 group-hover:h-69 transition-all duration-300 ease-in-out"
                  >
                    <div className="flex flex-col p-2">
                      {val.subMenu.map((subItem, idx) => (
                        <Link
                          key={idx}
                          to={subItem.path}
                          className="block px-4 py-3 hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap font-medium text-sm"
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex gap-5 items-center">
          {user ? (
            <Link
              to="/profile"
              className={`px-7 py-2.5 border-2 border-primary rounded-full text-white hover:bg-primary/50 hover:text-white transition ${scrolled ? "bg-primary/70 border-white/30" : "bg-primary"
                }`}
            >
              Profile
            </Link>
          ) : (
            <Link
              to="/join-us"
              className={`px-7 py-2.5 border-2 border-secondary rounded-full text-white hover:bg-secondary/50 hover:text-white transition ${scrolled ? "bg-secondary/70" : "bg-secondary"
                }`}
            >
              Join us
            </Link>
          )}
          <RiMenu3Fill
            aria-label="Open navigation menu"
            role="button"
            tabIndex={0}
            className={`text-4xl lg:hidden transition-all ${scrolled ? "text-white !important" : "text-primary"
              }`}
            onClick={(event) => {
              // console.log("hello");
              event.stopPropagation();
              setShowSidebar(true);
            }}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
