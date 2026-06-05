import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserTie,
  FaMapPin,
  FaExternalLinkAlt,
  FaStar,
  FaArrowRight,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useFetch from "../../../Hooks/useFetch";
import { TerminalCardSkeleton } from "../../Loading/Skeleton";
import {
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "../../Common/Animations";
import { useProvinceColors } from "../../../Hooks/useProvinceColors";

export default function CurrentEvent({ filterParams = {}, filterBar = null }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [page, setPage] = useState(1);
  const [accumulatedEvents, setAccumulatedEvents] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const { getColor } = useProvinceColors();

  const limit = isHome ? 3 : 9;

  // Build query string from filterParams + tab + pagination
  const buildUrl = () => {
    const params = new URLSearchParams();
    const statusParam =
      activeTab === "upcoming" ? "Upcoming,Published,Live" : "Completed";
    params.append("status", statusParam);
    params.append("limit", String(limit));
    params.append("page", String(page));
    if (activeTab === "upcoming") params.append("sort", "date");

    // Apply filter params (from EventFilter)
    Object.entries(filterParams).forEach(([key, val]) => {
      if (val !== "" && val !== undefined && val !== null) {
        params.append(key, String(val));
      }
    });
    return `/events?${params.toString()}`;
  };

  const url = buildUrl();
  const { data: apiResponse, loading } = useFetch(url);

  React.useEffect(() => {
    if (!apiResponse?.events) return;
    if (page === 1) {
      setAccumulatedEvents(apiResponse.events);
    } else {
      setAccumulatedEvents((prev) => [...prev, ...apiResponse.events]);
    }
  }, [apiResponse]);

  // Reset page when filters or tab change
  // Use a stringified version of filterParams to avoid infinite loop from new {} object references on every render
  const filterParamsString = JSON.stringify(filterParams);

  React.useEffect(() => {
    setAccumulatedEvents([]);
    setPage(1);
  }, [filterParamsString, activeTab]);

  const pagination = apiResponse?.pagination || null;
  const eventsToShow = accumulatedEvents;

  const handleTabChange = (tab) => {
    setAccumulatedEvents([]);
    setActiveTab(tab);
    setPage(1);
  };

  if (!loading && accumulatedEvents.length === 0 && !apiResponse && isHome)
    return null;

  return (
    <section
      className={`px-5 bg-gradient-to-br from-slate-50 to-white ${location.pathname === "/events" ? "py-8" : "pt-8"}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-10">
          <div className="flex gap-2 items-center group cursor-pointer">
            <div className="w-10 h-0.5 bg-secondary transition-all duration-300"></div>
            <h4 className="uppercase text-base font-medium tracking-wider text-secondary">
              Our Events
            </h4>
          </div>
          <SlideUp>
            <h2 className="md:text-4xl text-3xl font-bold text-primary py-4">
              Join us in shaping the future through exciting projects and
              initiatives
            </h2>
          </SlideUp>
          <p className="text-slate-600 max-w-3xl">
            Collaborate with passionate individuals, gain real-world experience,
            and make a meaningful impact through technology-driven initiatives.
          </p>
        </div>

        {/* Filter bar — only on /events page */}
        {!isHome && filterBar && <div className="mb-4">{filterBar}</div>}

        {/* Tabs */}
        <div className="flex justify-around md:justify-start gap-4 md:gap-12 mb-8 border-b border-slate-200">
          <button
            onClick={() => handleTabChange("upcoming")}
            className={`px-2 md:px-2 text-center py-3 font-bold text-sm md:text-sm uppercase cursor-pointer tracking-widest transition-all relative ${
              activeTab === "upcoming"
                ? "text-secondary border-b-2 border-secondary"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Upcoming Events
            {activeTab === "upcoming" && pagination?.total > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-[10px] md:text-sm absolute top-0">
                {pagination.total}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange("completed")}
            className={`text-center px-2 py-3 font-bold text-sm cursor-pointer uppercase tracking-widest transition-all relative ${
              activeTab === "completed"
                ? "text-secondary border-b-2 border-secondary"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Past Events
            {activeTab === "completed" && pagination?.total > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] absolute top-0">
                {pagination.total}
              </span>
            )}
          </button>
        </div>

        {/* Events Grid */}
        {loading && accumulatedEvents.length === 0 ? (
          <TerminalCardSkeleton
            count={isHome ? 2 : 6}
            cols="md:grid-cols-2 lg:grid-cols-3"
          />
        ) : eventsToShow.length === 0 && !loading ? (
          <div className="text-center py-20 text-slate-400">
            No {activeTab} events found with the current filters.
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventsToShow.map((event) => {
              const eventRegion = event.province || event.region;
              return (
                <StaggerItem key={event._id || event.id}>
                  <div
                  onClick={()=>navigate(`/events/${event.slug || event._id || event.id}`)}
                   className="group bg-white rounded-3xl overflow-hidden border border-slate-100 cursor-pointer shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,118,180,0.15)] transition-all duration-500 hover:-translate-y-2 h-full flex flex-col relative">
                    
                    {/* Hover Top Border */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>

                    {/* Image Header */}
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Left Badges (Status, Region) */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span
                          className={`w-fit px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm ${
                            event.status === "Live"
                              ? "bg-rose-500/90 text-white"
                              : event.status === "Upcoming" ||
                                  event.status === "Published"
                                ? "bg-secondary/90 text-white"
                                : "bg-slate-800/90 text-white"
                          }`}
                        >
                          {event.status}
                        </span>
                        {eventRegion && (
                          <span 
                            style={{ backgroundColor: getColor(eventRegion) }}
                            className="w-fit px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm opacity-90 backdrop-blur-md"
                          >
                            {eventRegion}
                          </span>
                        )}
                      </div>

                      {/* Right Date Badge */}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2 text-center shadow-lg border border-white/20">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">
                          {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                        </p>
                        <p className="text-2xl font-black text-slate-800 leading-none">
                          {new Date(event.date).toLocaleDateString("en-US", { day: "2-digit" })}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600">
                          {event.type}
                        </span>
                        {event.isNational && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600">
                            <FaStar size={10} /> National
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-slate-900 group-hover:text-secondary transition-colors leading-tight mb-3">
                        {event.title}
                      </h3>

                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-6 flex-1">
                        {event.description}
                      </p>

                      {/* Structured Meta Info Box */}
                      <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100/50 flex items-center justify-center text-secondary shrink-0">
                            <FaMapMarkerAlt size={16} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Location</p>
                            <p className="text-sm font-bold text-slate-700 truncate" title={event.venue ? `${event.venue}, ${event.location}` : event.location}>
                              {event.venue ? (
                                <>{event.venue}<span className="text-slate-400 font-normal">, {event.location}</span></>
                              ) : (
                                event.location || "TBA"
                              )}
                            </p>
                          </div>
                        </div>

                        {event.speakers && event.speakers.length > 0 && (
                          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                            <div className="w-10 h-10 rounded-full bg-rose-100/50 flex items-center justify-center text-rose-500 shrink-0">
                              <FaUserTie size={16} />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Speakers</p>
                              <p className="text-sm font-bold text-slate-700 truncate">{event.speakers.length}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-2 w-full mt-auto">
                        <Link
                          to={`/events/${event.slug || event._id || event.id}`}
                          className="flex-1 flex justify-center items-center gap-2 px-6 py-3.5 bg-secondary text-white rounded-xl font-bold text-sm hover:bg-secondary/90 active:scale-95 transition-all duration-300 shadow-md shadow-secondary/20 group"
                        >
                          Learn More <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                        </Link>
                        {event.registrationLink && activeTab === "upcoming" && (
                          <a
                            href={event.registrationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex justify-center items-center gap-2 px-5 py-3.5 border-2 border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:border-secondary hover:text-secondary hover:bg-secondary/5 active:scale-95 transition-all duration-300"
                          >
                            Register <FaExternalLinkAlt className="text-xs" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}

        {/* View All / Load More */}
        <div className="flex justify-center pt-10">
          {isHome ? (
            <Link
              to="/events"
              className="group flex items-center justify-center gap-3 px-10 py-4 bg-secondary rounded-full text-white hover:scale-[1.02] active:scale-95 transition-all duration-300 font-bold uppercase tracking-widest text-sm shadow-lg shadow-secondary/20 hover:shadow-secondary/40"
            >
              <span>View All Events</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            pagination &&
            pagination.page < pagination.totalPages && (
              <button
                onClick={() => setPage(page + 1)}
                className="group flex items-center justify-center gap-3 px-10 py-4 bg-secondary rounded-full text-white hover:scale-[1.02] active:scale-95 transition-all duration-300 font-bold uppercase tracking-widest text-sm shadow-lg shadow-secondary/20 hover:shadow-secondary/40"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            )
          )}
        </div>
      </div>
    </section>
  );
}
