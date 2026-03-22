import { NavLink, useNavigate } from "react-router-dom";
import { RiDashboardLine } from "react-icons/ri";
import {
  FaRegUser,
  FaDonate,
  FaBlog,
  FaBullseye,
  FaBook,
  FaRocket,
  FaUserTie,
  FaFolderOpen,
} from "react-icons/fa";
import { BiDonateHeart, BiCalendarEvent } from "react-icons/bi";
import { IoMdClose, IoMdMenu } from "react-icons/io";
import { FiUsers } from "react-icons/fi";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { GoBriefcase, GoFileMedia } from "react-icons/go";
import { useState } from "react";

const sideBarItems = [
  { title: "Dashboard", icon: <RiDashboardLine />, path: "/admin/dashboard" },
  { title: "Users", icon: <FaRegUser />, path: "/admin/user" },
  { title: "Members", icon: <FiUsers />, path: "/admin/member" },
  { title: "Events", icon: <BiCalendarEvent />, path: "/admin/event" },
  {
    title: "Certificates",
    icon: <AiOutlineSafetyCertificate />,
    path: "/admin/certificate",
  },
  { title: "Donations", icon: <BiDonateHeart />, path: "/admin/donation" },
  { title: "Blogs", icon: <FaBlog />, path: "/admin/blog" },
  { title: "Impacts", icon: <FaBullseye />, path: "/admin/impacts" },
  { title: "Gallery", icon: <GoFileMedia />, path: "/admin/gallery" },
  { title: "Jobs", icon: <GoBriefcase />, path: "/admin/internships" },
  { title: "Applications", icon: <FaUserTie />, path: "/admin/internship" },
  { title: "Resources", icon: <FaFolderOpen />, path: "/admin/resource" },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const activeStyle = "bg-secondary text-white shadow-md";
  const inactiveStyle = "hover:bg-white/10 text-gray-300";

  return (
    <>
      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside
        className={`branch-scrollbar bg-primary max-h-screen overflow-y-auto sticky top-0 hidden md:flex flex-col gap-5 p-5 text-white transition-all duration-300 shadow-xl z-40 
        ${isOpen ? "w-64" : "w-20"}`}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between pb-4 border-b border-white/20">
          {isOpen && (
            <img
              src="/logo.png"
              alt="logo"
              className="w-16 object-contain cursor-pointer"
              onClick={() => navigate("/")}
            />
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-2xl hover:bg-white/10 p-1 rounded-md transition-colors"
          >
            {isOpen ? <IoMdClose /> : <IoMdMenu />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {sideBarItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 p-3 rounded-lg transition-all whitespace-nowrap
                ${isActive ? activeStyle : inactiveStyle}
                ${!isOpen && "justify-center"}
              `}
            >
              <span className="text-2xl min-w-6">{item.icon}</span>
              {isOpen && <span className="font-medium">{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sajilo Digital Trademark - Sidebar Footer */}
        <div className="mt-auto pt-6 border-t border-white/10 group/sajilo">
          <NavLink
            to="/admin/sajilo-digital"
            className={({ isActive }) => `
              flex items-center gap-3 p-3 rounded-xl transition-all duration-500
              ${isActive ? "bg-white/10 text-emerald-400" : "text-white/40 hover:text-white hover:bg-white/5"}
              ${!isOpen && "justify-center"}
            `}
          >
            <div
              className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 overflow-hidden bg-white/10`}
            >
              <img
                src="/sajilodigital.png"
                alt="SD"
                className="w-5 h-5 object-contain brightness-0 invert opacity-80 group-hover/sajilo:opacity-100 group-hover/sajilo:scale-110 transition-all"
              />
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight text-white group-hover/sajilo:text-emerald-400 transition-colors">
                  Sajilo Digital
                </span>
                <span className="text-[8px] font-bold text-emerald-500/60 uppercase tracking-widest mt-0.5 group-hover/sajilo:text-emerald-400">
                  Innovation Partner
                </span>
              </div>
            )}
          </NavLink>
        </div>
      </aside>

      {/* Mobile Bottom Navigation - Android App Style */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe-area">
        <div className="flex overflow-x-auto no-scrollbar py-2 px-2 gap-1 justify-between items-center">
          {sideBarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center p-2 rounded-xl min-w-[4rem] transition-all relative
                ${isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}
              `}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`text-xl mb-1 ${item.title === "Certificate" ? "text-2xl" : ""}`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-tight leading-none px-1 text-center">
                    {item.title.split(" ")[0]}
                  </span>
                  {isActive && (
                    <div className="absolute top-1 right-3 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Sajilo Digital Link - Mobile End */}
          <NavLink
            to="/admin/sajilo-digital"
            className={({ isActive }) => `
              flex flex-col items-center justify-center p-2 rounded-xl min-w-[5rem] transition-all relative
              ${isActive ? "text-emerald-500 bg-emerald-50" : "text-slate-400"}
            `}
          >
            <div className="w-8 h-8 mb-1 flex items-center justify-center bg-slate-900 rounded-lg overflow-hidden">
              <img
                src="/sajilodigital.png"
                alt="SD"
                className="w-5 h-5 object-contain brightness-0 invert"
              />
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter leading-none text-center">
              Sajilo
              <br />
              Digital
            </span>
          </NavLink>
        </div>
      </nav>
    </>
  );
}

export default AdminSidebar;
