// import React, { useEffect, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { RiMenu3Fill } from "react-icons/ri";
// import { FiChevronDown } from "react-icons/fi";
// import { navItems } from "../../Data/navItems";
// import { useAuth } from "../../Context/AuthContext";

// function Header({ setShowSidebar }) {
//   const location = useLocation();
//   const [scrolled, setScrolled] = useState(false);
//   const { user } = useAuth();

//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 20) {
//         // Change 50 to your desired scroll position
//         setScrolled(true);
//       } else {
//         setScrolled(false);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);

//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, []);

//   return (
//     <header
//       className={`sticky py-2 max-w-7xl pr-3 pl-7 mx-auto z-50 transition-all rounded-full duration-300 ${scrolled
//         ? "bg-primary/50 backdrop-blur-xs top-5 border border-white/30"
//         : "bg-transparent top-0 border-none"
//         }`}
//     >
//       <div className=" flex items-center gap-3 justify-between">
//         <Link to="/">
//           <img src="/logo.png" alt="Code for Change Nepal Logo" className="h-12" />
//         </Link>
//         <nav className="lg:gap-2 hidden lg:flex items-center">
//           {navItems.map((val, i) => (
//             <div key={i} className="relative group">
//               <Link
//                 to={val.path}
//                 className={`hover:bg-primary py-1 border-2 border-transparent px-4 flex items-center gap-1 rounded-full hover:text-white transition duration-200
//           ${location.pathname === val.path
//                     ? "text-white bg-primary border-2 border-primary"
//                     : scrolled
//                       ? "text-white"
//                       : "text-primary"
//                   }`}
//               >
//                 {val.title}
//                 {val.subMenu && <FiChevronDown className="text-lg" />}
//               </Link>

//               {/* Dropdown */}
//               {val.subMenu && (
//                 <div className="absolute left-0 top-full pt-4 group-hover:block invisible group-hover:visible">
//                   <div
//                     className="relative w-60 overflow-hidden bg-primary text-white shadow-xl rounded-2xl border border-white
//                     h-0 group-hover:h-69 transition-all duration-300 ease-in-out"
//                   >
//                     <div className="flex flex-col p-2">
//                       {val.subMenu.map((subItem, idx) => (
//                         <Link
//                           key={idx}
//                           to={subItem.path}
//                           className="block px-4 py-3 hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap font-medium text-sm"
//                         >
//                           {subItem.title}
//                         </Link>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </nav>

//         <div className="flex gap-5 items-center">
//           {user ? (
//             <Link
//               to="/profile"
//               className={`px-7 py-2.5 border-2 border-primary rounded-full text-white hover:bg-primary/50 hover:text-white transition ${scrolled ? "bg-primary/70 border-white/30" : "bg-primary"
//                 }`}
//             >
//               Profile
//             </Link>
//           ) : (
//             <Link
//               to="/join-us"
//               className={`px-7 py-2.5 border-2 border-secondary rounded-full text-white hover:bg-secondary/50 hover:text-white transition ${scrolled ? "bg-secondary/70" : "bg-secondary"
//                 }`}
//             >
//               Join us
//             </Link>
//           )}
//           <RiMenu3Fill
//             aria-label="Open navigation menu"
//             role="button"
//             tabIndex={0}
//             className={`text-4xl lg:hidden transition-all ${scrolled ? "text-white !important" : "text-primary"
//               }`}
//             onClick={(event) => {
//               // console.log("hello");
//               event.stopPropagation();
//               setShowSidebar(true);
//             }}
//           />
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Header;

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
    >
      <div className="flex items-center justify-between">
        <Link to="/" className="shrink-0">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="relative hidden lg:flex items-center gap-1"
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
                        {item.subMenu.map((sub) => (
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
            to={user ? "/profile" : "/join-us"}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              user
                ? "bg-primary text-white border border-white/20 hover:scale-105"
                : "bg-secondary text-white hover:shadow-[0_0_20px_rgba(var(--secondary),0.4)]"
            }`}
          >
            {user ? "Profile" : "Join Us"}
          </Link>

          <button
            onClick={(event) => {
              event.stopPropagation();
              setShowSidebar(true);
            }}
            className="lg:hidden p-2 text-primary"
          >
            <RiMenu3Fill
              size={28}
              className={scrolled ? "text-white" : "text-primary"}
            />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
