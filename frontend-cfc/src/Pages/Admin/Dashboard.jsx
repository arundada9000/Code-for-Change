import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers, FaCalendarAlt, FaBlog, FaCheckCircle,
  FaSearch, FaArrowRight, FaClock, FaHistory,
  FaPlus, FaEllipsisV, FaRegBell,
  FaHandHoldingHeart as FaDonation,
  FaAward as FaCert,
  FaBriefcase as FaIntern
} from "react-icons/fa";
import { HiTrendingUp, HiTrendingDown } from "react-icons/hi";
import API from "../../Services/api";
import { AdminDashboardSkeleton } from "../../Components/Loading/Skeleton";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults(null);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/dashboard");
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults(null);
      return;
    }

    try {
      setSearching(true);
      const res = await API.get(`/admin/search?q=${query}`);
      if (res.data.success) {
        setSearchResults(res.data.data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  if (loading || !stats) return <AdminDashboardSkeleton />;

  const StatCard = ({ title, value, trend, icon: Icon, color, link }) => (
    <div
      onClick={() => link && navigate(link)}
      className={`relative group overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${link ? 'cursor-pointer' : ''}`}
    >
      <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.05] rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
      <div className="relative flex justify-between items-start">
        <div className="space-y-2 md:space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 truncate">{title}</span>
            <span className={`flex items-center w-fit px-1.5 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold ${trend.percentage >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-rose-50 text-rose-600'}`}>
              {trend.percentage > 0 ? <HiTrendingUp /> : <HiTrendingDown />} {Math.abs(trend.percentage)}%
            </span>
          </div>
          <div className="flex items-baseline gap-1 md:gap-2">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
            {trend.today > 0 && (
              <span className="hidden md:inline text-xs font-bold text-secondary">+{trend.today} today</span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-2xl bg-gray-50 text-gray-600 shadow-inner group-hover:bg-secondary/10 group-hover:text-secondary transition-all duration-300`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );

  // Simple SVG Line Chart Component
  const UserGrowthChart = ({ data }) => {
    const max = Math.max(...data.map(d => d.value));
    const points = data.map((d, i) => `${(i * 100) / (data.length - 1)},${100 - (d.value * 80) / max}`).join(' ');

    return (
      <div className="h-48 w-full relative pt-4">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M 0,100 L ${points} L 100,100 Z`} fill="url(#gradient)" className="transition-all duration-1000" />
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="flex justify-between mt-4">
          {data.map((d, i) => (
            <span key={i} className="text-[10px] font-bold text-slate-400">{d.label}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

      {/* 1. Dynamic Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Overview Dashboard</h2>
            <div className="animate-pulse w-2 h-2 rounded-full bg-secondary shadow-sm shadow-secondary"></div>
          </div>
          <p className="text-gray-500 font-medium">Monitor active metrics for <span className="text-secondary font-bold">Code for Change</span>.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group" ref={searchRef}>
            {/* <input
              type="text"
              placeholder="Search users, events, blogs..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-secondary/100/5 transition-all w-full md:w-80 shadow-sm font-bold text-sm"
            />
            <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searching ? 'text-secondary animate-pulse' : 'text-slate-300 group-focus-within:text-secondary/100'}`} /> */}

            {/* Search Results Dropdown */}
            {searchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-50 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[400px] overflow-y-auto p-2 space-y-4">

                  {/* Users Results */}
                  {searchResults.users?.length > 0 && (
                    <div className="space-y-1">
                      <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Users</p>
                      {searchResults.users.map(u => (
                        <div
                          key={u._id}
                          onClick={() => {
                            navigate(`/admin/user/${u._id}`);
                            setSearchResults(null);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-secondary/10 rounded-xl transition-all cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs ring-4 ring-transparent group-hover:ring-emerald-100 transition-all">
                            {u.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{u.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Events Results */}
                  {searchResults.events?.length > 0 && (
                    <div className="space-y-1">
                      <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Events</p>
                      {searchResults.events.map(e => (
                        <div
                          key={e._id}
                          onClick={() => {
                            navigate(`/admin/event/${e._id}`);
                            setSearchResults(null);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-secondary/10 rounded-xl transition-all cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xs">
                            <FaCalendarAlt size={12} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{e.title}</p>
                            <p className="text-[10px] text-slate-400">
                              {e.startDate ? new Date(e.startDate).toLocaleDateString() : 'No date set'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Blogs Results */}
                  {searchResults.blogs?.length > 0 && (
                    <div className="space-y-1">
                      <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Blogs</p>
                      {searchResults.blogs.map(b => (
                        <div
                          key={b._id}
                          onClick={() => {
                            navigate(`/admin/blog/${b._id}`);
                            setSearchResults(null);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-secondary/10 rounded-xl transition-all cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                            <FaBlog size={12} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{b.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {searchResults.users.length === 0 && searchResults.events.length === 0 && searchResults.blogs.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-sm font-bold text-slate-400 italic">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-4 bg-secondary border rounded-full transition-all shadow cursor-pointer relative group ${showNotifications ? 'ring ring-secondary/10 text-white shadow-lg' : 'text-white hover:text-secondary hover:bg-white hover:shadow-xl'}`}
            >
              <FaRegBell size={20} />
              {stats.recent.reminders.length > 0 && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tight">Upcoming Events</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Notification Center</p>
                  </div>
                  <div className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-widest">
                    {stats.recent.reminders.length} New
                  </div>
                </div>

                <div className="max-h-[450px] overflow-y-auto p-4 space-y-3">
                  {stats.recent.reminders.length > 0 ? (
                    stats.recent.reminders.map((event, index) => (
                      <div
                        key={event._id}
                        onClick={() => {
                          navigate(`/admin/event/${event._id}`);
                          setShowNotifications(false);
                        }}
                        className="group flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-slate-100"
                      >
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-secondary text-white shadow-lg shadow-emerald-200' :
                            index === 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                            {index + 1}
                          </div>
                          {index === 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-secondary/100"></span></span>}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-black text-slate-900 group-hover:text-secondary transition-colors truncate max-w-[180px]">{event.title}</p>
                            <p className="text-[10px] font-black text-secondary uppercase tracking-widest whitespace-nowrap">
                              {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{event.description || 'Join us for this upcoming community experience.'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
                        <FaRegBell size={32} />
                      </div>
                      <p className="text-sm font-black text-slate-300 italic">No events scheduled recently.</p>
                    </div>
                  )}
                </div>

                {/* Combined Stats Footer */}
                <div className="p-6 bg-slate-50/50 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Live Users</p>
                    <p className="text-lg font-black text-secondary">{stats.counts.onlineUsers}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Unread Msg</p>
                    <p className="text-lg font-black text-rose-600">{stats.counts.unreadContacts}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Luxe Stats Grid - Compact Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Users" value={stats.counts.users} trend={stats.trends.users} icon={FaUsers} color="from-blue-600 to-indigo-600" link="/admin/user" />
        <StatCard title="Events" value={stats.counts.events} trend={stats.trends.events} icon={FaCalendarAlt} color="from-secondary to-teal-600" link="/admin/event" />
        <StatCard title="Blogs" value={stats.counts.blogs} trend={stats.trends.blogs} icon={FaBlog} color="from-amber-600 to-orange-600" link="/admin/blog" />
        <StatCard title="Donations" value={stats.counts.donations} trend={stats.trends.donations} icon={FaDonation} color="from-indigo-600 to-violet-600" link="/admin/donation" />
        <StatCard title="Certificates" value={stats.counts.certificates} trend={stats.trends.certificates} icon={FaCert} color="from-cyan-600 to-blue-600" link="/admin/certificate" />
        <StatCard title="Internships" value={stats.counts.internships} trend={stats.trends.internships} icon={FaIntern} color="from-teal-600 to-secondary" link="/admin/internships" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* 3. Analytics & Growth Area */}
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Growth Trend</h3>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Monthly New Signups</p>
              </div>
              <div className="flex gap-2">
                {['6M', '1Y', 'ALL'].map(t => (
                  <button key={t} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${t === '6M' ? 'bg-secondary text-white shadow-sm' : 'bg-gray-50 hover:bg-gray-100 text-gray-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <UserGrowthChart data={stats.analytics.userGrowth} />
          </section>

          {/* Event Pipeline / Tasks */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-extrabold text-gray-900">Recent Events</h3>
              <button
                onClick={() => navigate('/admin/event')}
                className="p-2.5 bg-white hover:bg-secondary/10 border border-gray-200 hover:border-emerald-200 rounded-xl text-gray-400 hover:text-secondary transition-all shadow-sm"
              >
                <FaPlus size={14} />
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/30 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-8 py-4 text-left">Event Name</th>
                    <th className="px-8 py-4 text-left">Date</th>
                    <th className="px-8 py-4 text-center">Status</th>
                    <th className="px-8 py-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recent.events.map((event) => (
                    <tr key={event._id} className="group hover:bg-gray-50/50 transition-all duration-300">
                      <td className="px-8 py-5 font-bold text-gray-900">{event.title}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                          <FaClock size={12} className="text-secondary/100" />
                          {new Date(event.startDate || event.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${event.status === 'Published' ? 'bg-secondary/10 text-emerald-700 ring-1 ring-emerald-200/50' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200/50'}`}>
                          {event.status || 'DRAFT'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => navigate(`/admin/event/${event._id}`)}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 group-hover:bg-secondary/10 group-hover:text-secondary group-hover:border-emerald-200 transition-all duration-300"
                        >
                          <FaArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Compact List View */}
            <div className="md:hidden pt-2 pl-2 pr-2 pb-0 space-y-2">
              {stats.recent.events.map((event) => (
                <div
                  key={event._id}
                  onClick={() => navigate(`/admin/event/${event._id}`)}
                  className="bg-white border-b border-slate-50 py-3 flex items-center justify-between active:bg-slate-50 transition-colors last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${event.status === 'Published' ? 'bg-secondary/100' : 'bg-slate-300'}`}></div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 text-xs line-clamp-1">{event.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(event.startDate || event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <FaArrowRight size={10} className="text-slate-300" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 4. Activity Feed & Persistence Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-gray-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/100/10 blur-[80px] pointer-events-none"></div>
            <div className="relative space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold">Who's Online</h3>
                <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-emerald-400">{stats.counts.onlineUsers} Active</span>
                </div>
              </div>
              <div className="space-y-6">
                {stats.recent.onlineUsers?.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => navigate(`/admin/user/${user._id}`)}
                    className="flex items-center justify-between group/item cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-secondary/100 text-sm group-hover/item:bg-secondary group-hover/item:text-white transition-all duration-300">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tight group-hover/item:text-secondary transition-colors">{user.name}</p>
                        <p className="text-[10px] text-secondary/100/60 font-bold uppercase tracking-wider">Online Now</p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!stats.recent.onlineUsers || stats.recent.onlineUsers.length === 0) && (
                  <p className="text-xs text-slate-500 italic">No users currently online</p>
                )}
              </div>

              <div className="pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black italic">Recent Logins</h3>
                  <FaHistory className="text-slate-500" />
                </div>
                <div className="space-y-6">
                  {stats.recent.logins.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => navigate(`/admin/user/${user._id}`)}
                      className="flex items-center gap-4 group/item cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-slate-500 text-sm group-hover/item:bg-slate-800 transition-all">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tight text-slate-300 group-hover/item:text-white transition-colors">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{new Date(user.lastLogin).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-gray-900">Recent Actions</h3>
              <div className="p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer rounded-lg text-gray-400 transition-colors"><FaEllipsisV size={14} /></div>
            </div>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-0 before:w-[1px] before:bg-gray-100">
              {stats.recent.activities.map((log) => {
                const getActionColor = (action) => {
                  switch (action?.toUpperCase()) {
                    case 'CREATE': return 'bg-secondary/100 shadow-emerald-200 border-emerald-100';
                    case 'UPDATE': return 'bg-blue-500 shadow-blue-200 border-blue-100';
                    case 'DELETE': return 'bg-rose-500 shadow-rose-200 border-rose-100';
                    case 'LOGIN': return 'bg-indigo-500 shadow-indigo-200 border-indigo-100';
                    default: return 'bg-gray-400 shadow-gray-200 border-gray-100';
                  }
                };

                return (
                  <div
                    key={log._id}
                    className="relative flex gap-5 z-10 group/log cursor-pointer"
                    onClick={() => {
                      if (log.userId) navigate(`/admin/user/${log.userId}`);
                      else if (log.resourceId) {
                        const path = log.resource?.toLowerCase().includes('event') ? 'event' :
                          log.resource?.toLowerCase().includes('blog') ? 'blog' : null;
                        if (path) navigate(`/admin/${path}/${log.resourceId}`);
                      }
                    }}
                  >
                    <div className={`w-4 h-4 rounded-full mt-1 border-4 border-white shadow-sm ${getActionColor(log.action)} group-hover/log:scale-125 transition-transform`}></div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600 leading-snug group-hover/log:text-gray-900 transition-colors">
                        <span className={`font-bold ${log.action?.toUpperCase() === 'DELETE' ? 'text-rose-600' :
                            log.action?.toUpperCase() === 'CREATE' ? 'text-secondary' :
                              log.action?.toUpperCase() === 'UPDATE' ? 'text-blue-600' : 'text-indigo-600'
                          }`}>{log.userName}</span> {log.details}
                      </p>
                      <p className="text-xs text-gray-400 font-semibold">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
              {stats.recent.activities.length === 0 && (
                <p className="text-center text-gray-400 font-medium py-8">No recent activities found.</p>
              )}
            </div>
            <button
              onClick={() => navigate('/admin/user')}
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
            >
              View All Users
            </button>
          </section>

          {/* Event Reminders Section */}
          <section className="bg-secondary/10 rounded-3xl border border-emerald-100 p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-emerald-900 flex items-center gap-2">
                <FaCalendarAlt className="text-secondary" />
                Coming Up
              </h3>
              <span className="px-3 py-1 bg-emerald-200/50 text-emerald-800 text-[10px] font-black rounded-full uppercase">Next 48h</span>
            </div>
            <div className="space-y-4">
              {stats.recent.reminders?.map((reminder, idx) => (
                <div key={idx} className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-amber-100/50 flex items-center justify-between group hover:bg-white transition-all">
                  <div>
                    <p className="text-sm font-black text-amber-950 truncate max-w-[180px]">{reminder.title}</p>
                    <p className="text-[10px] font-bold text-amber-600 uppercase mt-0.5">
                      {new Date(reminder.startDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-amber-800">{new Date(reminder.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
              {(!stats.recent.reminders || stats.recent.reminders.length === 0) && (
                <p className="text-xs text-amber-600 font-medium italic">No upcoming events in the next 2 days.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;