import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserTie,
  FaMapPin,
  FaExternalLinkAlt,
  FaStar,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import useFetch from "../../../Hooks/useFetch";
import { TerminalCardSkeleton } from "../../Loading/Skeleton";
import {
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "../../Common/Animations";

export default function CurrentEvent({ filterParams = {}, filterBar = null }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [page, setPage] = useState(1);
  const [accumulatedEvents, setAccumulatedEvents] = useState([]);
  const location = useLocation();
  const isHome = location.pathname === "/";

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
            {eventsToShow.map((event) => (
              <StaggerItem key={event._id || event.id}>
                <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                      <span
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${
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
                      <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 text-slate-800 backdrop-blur-md">
                        {event.type}
                      </span>
                      {event.isNational && (
                        <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/90 text-white backdrop-blur-md">
                          <FaStar size={8} /> National
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7 space-y-4 flex flex-col flex-1">
                    <h3 className="text-xl font-black text-primary group-hover:text-secondary transition-colors leading-tight">
                      {event.title}
                    </h3>

                    <p className="text-slate-600 text-sm line-clamp-2 flex-1">
                      {event.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-secondary shrink-0" />
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-secondary shrink-0" />
                        {event.location}
                      </div>
                      {event.venue && (
                        <div className="flex items-center gap-2">
                          <FaMapPin className="text-secondary shrink-0" />
                          {event.venue}
                        </div>
                      )}
                    </div>

                    {/* Speakers Preview */}
                    {event.speakers && event.speakers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <FaUserTie className="text-secondary" />
                        <span className="text-xs font-bold text-slate-500">
                          {event.speakers.length} Speaker
                          {event.speakers.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Link
                        to={`/events/${event.slug || event._id || event.id}`}
                        className="flex-1 px-6 py-3 bg-secondary text-white rounded-full text-center font-bold text-sm hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/10"
                      >
                        Learn More
                      </Link>
                      {event.registrationLink && activeTab === "upcoming" && (
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-3 border-2
                           border-secondary text-secondary rounded-full font-bold text-sm hover:bg-secondary/5 transition-all flex items-center justify-center gap-2"
                        >
                          Register <FaExternalLinkAlt size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* View All / Load More */}
        <div className="flex justify-center pt-8">
          {isHome ? (
            <Link
              to="/events"
              className="px-8 py-4 cursor-pointer bg-secondary rounded-full text-white hover:bg-secondary/90 hover:scale-105 transition-all font-bold shadow-lg shadow-secondary/20"
            >
              View All Events
            </Link>
          ) : (
            pagination &&
            pagination.page < pagination.totalPages && (
              <button
                onClick={() => setPage(page + 1)}
                className="px-8 py-4 bg-secondary cursor-pointer rounded-full text-white hover:bg-secondary/90 hover:scale-105 transition-all font-bold shadow-lg shadow-secondary/20"
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
