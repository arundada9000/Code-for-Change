import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserTie,
  FaLightbulb,
  FaGift,
  FaClock,
  FaMapPin,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import useFetch from "../../../Hooks/useFetch";
import { TerminalCardSkeleton } from "../../Loading/Skeleton";
import { SlideUp, StaggerContainer, StaggerItem } from "../../Common/Animations";

export default function CurrentEvent() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [page, setPage] = useState(1);
  const [accumulatedEvents, setAccumulatedEvents] = useState([]);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const limit = isHome ? 2 : 10;
  const statusParam = activeTab === "upcoming" ? "Upcoming,Published,Live" : "Completed";
  const sortParam = activeTab === "upcoming" ? "&sort=date" : "";
  const url = `/events?status=${statusParam}&limit=${limit}&page=${page}${sortParam}`;

  const { data: apiResponse, loading } = useFetch(url);

  // When new data arrives, accumulate (for Load More) OR reset (for tab switch, which resets page to 1)
  React.useEffect(() => {
    if (!apiResponse?.events) return;
    if (page === 1) {
      // Tab changed — reset accumulated list
      setAccumulatedEvents(apiResponse.events);
    } else {
      // Load More — append new events
      setAccumulatedEvents((prev) => [...prev, ...apiResponse.events]);
    }
  }, [apiResponse]);

  const pagination = apiResponse?.pagination || null;
  const eventsToShow = accumulatedEvents;

  const handleTabChange = (tab) => {
    setAccumulatedEvents([]);
    setActiveTab(tab);
    setPage(1);
  };

  if (loading && accumulatedEvents.length === 0)
    return (
      <section className="px-5 bg-gradient-to-br from-slate-50 to-white py-8">
        <div className="max-w-7xl mx-auto">
          <TerminalCardSkeleton count={isHome ? 2 : 4} cols="md:grid-cols-2" />
        </div>
      </section>
    );
  if (!loading && accumulatedEvents.length === 0 && !apiResponse) return null;

  return (
    <section className={` px-5 bg-gradient-to-br from-slate-50 to-white ${location.pathname=="/events"?"py-8":"pt-8"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-14">
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

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button
            onClick={() => handleTabChange("upcoming")}
            className={`px-6 py-3 font-bold text-sm uppercase tracking-widest transition-all relative ${
              activeTab === "upcoming"
                ? "text-secondary border-b-2 border-secondary"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Upcoming Events
            {activeTab === "upcoming" && pagination?.total > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-[10px]">
                {pagination.total}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange("completed")}
            className={`px-6 py-3 font-bold text-sm uppercase tracking-widest transition-all relative ${
              activeTab === "completed"
                ? "text-secondary border-b-2 border-secondary"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Past Events
            {activeTab === "completed" && pagination?.total > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px]">
                {pagination.total}
              </span>
            )}
          </button>
        </div>

        {/* Events Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {eventsToShow.length === 0 ? (
            <div className="col-span-2 text-center py-20 text-slate-400">
              No {activeTab} events at the moment.
            </div>
          ) : (
            eventsToShow.map((event) => (
              <StaggerItem key={event._id || event.id}>
                <div
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500 h-full flex flex-col"
                >
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${
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
                    <span className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 text-slate-800 backdrop-blur-md">
                      {event.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-4">
                  <h3 className="text-2xl font-black text-primary group-hover:text-secondary transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-slate-600 text-sm line-clamp-2">
                    {event.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 pt-2">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-secondary" />
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-blue-500" />
                      {event.location}
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <FaMapPin className="text-purple-500" />
                        {event.venue}
                      </div>
                    )}
                  </div>

                  {/* Speakers Preview */}
                  {event.speakers && event.speakers.length > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                      <FaUserTie className="text-amber-500" />
                      <span className="text-xs font-bold text-slate-500">
                        {event.speakers.length} Speaker
                        {event.speakers.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
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
                        className="px-6 py-3 border-2 border-secondary text-secondary rounded-full font-bold text-sm hover:bg-secondary/5 transition-all flex items-center gap-2"
                      >
                        Register <FaExternalLinkAlt size={12} />
                      </a>
                    )}
                  </div>
                </div>
                </div>
              </StaggerItem>
            ))
          )}
        </StaggerContainer>
        
        {/* View All / Load More Button */}
        <div className="flex justify-center pt-6">
          {isHome ? (
            <Link
              to="/events"
              className="px-8 py-4 bg-secondary rounded-full text-white hover:bg-secondary/90 hover:scale-105 transition-all font-bold shadow-lg shadow-secondary/20"
            >
              View All Events
            </Link>
          ) : (
            pagination && pagination.page < pagination.totalPages && (
              <button
                onClick={() => setPage(page + 1)}
                className="px-8 py-4 bg-secondary rounded-full text-white hover:bg-secondary/90 hover:scale-105 transition-all font-bold shadow-lg shadow-secondary/20"
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
