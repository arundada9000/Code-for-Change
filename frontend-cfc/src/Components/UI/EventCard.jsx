import React from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaStar,
} from "react-icons/fa";

const EventCard = ({ event }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500 border border-slate-100 flex flex-col h-full">
      {/* Event Image */}
      <div className="h-48 w-full overflow-hidden relative shrink-0">
        <img
          src={
            event.image ||
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800"
          }
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Status badge top-right */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md ${
              event.status === "Live"
                ? "bg-rose-500/90 text-white"
                : "bg-secondary/90 text-white"
            }`}
          >
            {event.status || "Published"}
          </span>
        </div>
        {/* National badge top-left */}
        {event.isNational && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md bg-amber-500/90 text-white">
              <FaStar size={8} /> National
            </span>
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-xl font-black text-primary mb-3 line-clamp-2 group-hover:text-secondary transition-colors tracking-tight">
            {event.title}
          </h3>
          <div className="space-y-2 text-sm text-slate-600 mb-3">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-secondary" />
              {new Date(event.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-secondary" />
              <span className="truncate">{event.location || "Online"}</span>
            </div>
          </div>
          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        <Link
          to={`/events/${event.slug || event._id || event.id}`}
          className="mt-6 self-start px-6 py-2.5 border-2 border-secondary text-secondary rounded-full hover:bg-secondary hover:text-white transition-all font-bold text-sm flex items-center gap-2 group"
        >
          Learn More{" "}
          <FaArrowRight
            className="group-hover:translate-x-1 transition-transform"
            size={12}
          />
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
