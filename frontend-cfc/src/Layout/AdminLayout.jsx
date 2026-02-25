import { useNavigate, Link, Outlet } from "react-router-dom";
import AdminSidebar from "../Pages/Admin/AdminSidebar";
import { useAuth } from "../Context/AuthContext";
import {
  FaChevronDown,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaRegUser,
  FaSignOutAlt,
  FaTwitter,
  FaUserCircle,
  FaYoutube,
} from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

const SOCIAL_MEDIA_LINKS = [
  {
    icon: <FaFacebookF />,
    link: "https://www.facebook.com/CodeForChangeNepal",
  },
  {
    icon: <FaInstagram />,
    link: "https://www.instagram.com/codeforchangeofficial/",
  },
  {
    icon: <FaYoutube />,
    link: "https://www.youtube.com/channel/UC9x8pdE8UWErO6hW2mJSVLQ",
  },
  {
    icon: <FaLinkedinIn />,
    link: "https://www.linkedin.com/company/codeforchangenepal/",
  },
  { icon: <FaTwitter />, link: "https://x.com/CodeforChange2" },
];

function AdminLayout() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside>
        <AdminSidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header - Professional Clean Design */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight uppercase leading-none">
                Admin Panel
              </h1>
              <p className="text-[10px] font-medium text-gray-500 mt-1">
                Main control panel for <span className="text-emerald-600 font-bold">Code for Change</span>
              </p>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 p-2 rounded-xl transition-all border border-gray-200 group"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <FaUserCircle size={20} />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-none">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium">{user?.role?.replace('-', ' ') || "Administrator"}</p>
              </div>
              <FaChevronDown
                className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                size={10}
              />
            </button>

            {/* Profile Dropdown - Professional Styling */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Profile</p>
                   <p className="text-xs font-bold text-gray-700 truncate">{user?.email || "admin@example.com"}</p>
                </div>
                
                <Link
                  to="/admin/profile"
                  className="flex items-center gap-3 px-4 py-2 text-xs text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <FaRegUser className="text-gray-400" size={14} />
                  My Profile
                </Link>
                
                <hr className="my-1 border-gray-50" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs text-rose-600 font-bold hover:bg-rose-50 transition-colors"
                >
                  <FaSignOutAlt className="text-rose-400" size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 p-6 md:p-10">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="bg-primary text-white py-4 px-6 mt-auto">
          <div className="container mx-auto flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Code for Change. All rights
              reserved.
              <br className="md:hidden" />
              <span className="hidden md:inline"> | </span>
              Developed by Sajilo Digital&trade;
            </div>

            <div className="flex gap-3">
              {SOCIAL_MEDIA_LINKS.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-secondary/20 p-2.5 rounded-full hover:bg-secondary hover:scale-110 transition-all duration-300 text-lg"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default AdminLayout;
