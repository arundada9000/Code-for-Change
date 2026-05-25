import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import API from "../../../Services/api";
import useFetch from "../../../Hooks/useFetch";

export default function EventDetails() {
  const { eventSlug } = useParams();
  const idStr = eventSlug.split("-")[0];
  
  const { data: apiEvent, loading } = useFetch(`/events/${idStr}`);

  // Fallback to static data
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (apiEvent) {
      setEvent(apiEvent);
    }
  }, [apiEvent]);

  if (loading) return <div className="text-center mt-20">Loading event details...</div>;

  if (!event) {
    return (
      <p className="text-center mt-20 text-red-500 text-xl">Event not found</p>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-12 bg-slate-50/50">
      {/* Breadcrumbs - Cleaner Look */}
      <nav className="flex items-center space-x-2 text-sm font-medium text-slate-500 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="text-slate-300">/</span>
        <Link to="/events" className="hover:text-primary transition-colors">
          Events
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 truncate max-w-50">{event.title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left Column: Main Content (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Enhanced Banner */}
          {event.image && (
            <div className="group relative rounded-2xl overflow-hidden shadow-lg aspect-video">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <div className="flex gap-2 mb-4">
                  {event.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full uppercase tracking-widest font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-4xl md:text-6xl text-white font-black tracking-tight leading-none">
                  {event.title}
                </h1>
              </div>
            </div>
          )}

          {/* About Section */}
          <article className="prose prose-slate lg:prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <span className="w-8 h-1 bg-primary rounded-full inline-block"></span>
              About the Event
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {event.fullDescription || event.description}
            </p>
          </article>

          {/* Speakers - Cards instead of List */}
          {event.speakers && (
            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Featured Speakers
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {event.speakers.map((speaker) => (
                  <div
                    key={speaker}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {speaker[0]}
                    </div>
                    <span className="font-semibold text-slate-700">
                      {speaker}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-6 bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-gray-100">
            <h3 className="text-xl font-bold text-slate-900 border-b pb-4">
              Event Logistics
            </h3>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <FaCalendarAlt />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                    Date & Time
                  </p>
                  <p className="text-slate-700 font-medium">
                    {event.date || new Date(event.startDate).toDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                    Location
                  </p>
                  <p className="text-slate-700 font-medium">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <FaUser />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                    Organizer
                  </p>
                  <p className="text-slate-700 font-medium">
                    {event.organizer}{" "}
                    {event.province && <span>| {event.province}</span>}
                  </p>
                </div>
              </div>
            </div>

            {event.registrationLink && (
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 transition-all hover:-translate-y-1"
              >
                Secure My Spot
              </a>
            )}

            <p className="text-center text-xs text-slate-400">
              Limited seats available. Register early!
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
