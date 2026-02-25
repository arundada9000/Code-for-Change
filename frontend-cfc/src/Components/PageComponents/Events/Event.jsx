import React from "react";
import { Link } from "react-router-dom";
import useFetch from "../../../Hooks/useFetch";
import EventCard from "../../UI/EventCard";

function Event({ events: propEvents, loading: propLoading }) {
  const { data: apiEvents, loading: apiLoading } = useFetch("/events");

  // Determine if controlled or uncontrolled
  const isControlled = propEvents !== undefined;

  const events = isControlled ? propEvents || [] : apiEvents || [];
  const loading = isControlled ? propLoading : apiLoading;

  // Show only published/upcoming events, sorted by date
  // If controlled (Events page), show all (backend already filtered). If uncontrolled (Home page), slice to 6.
  const displayEvents = isControlled
    ? events
    : events
        .filter(
          (e) =>
            e.status === "Published" ||
            e.status === "Upcoming" ||
            e.status === "Live",
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 6);

  if (loading)
    return <div className="py-16 text-center">Loading events...</div>;
  if (displayEvents.length === 0) return null;

  return (
    <div className="py-16 max-w-7xl mx-auto px-5">
      {/* Section Header */}
      <div className="max-w-2xl mb-14">
        <div className="flex gap-2 items-center">
          <div className="w-10 h-0.5 bg-secondary"></div>
          <h4 className="uppercase text-base font-medium tracking-wider text-secondary">
            Upcoming Events
          </h4>
        </div>
        <h2 className="md:text-4xl text-3xl font-black text-primary py-4 tracking-tight">
          Empowering innovation through nationwide events
        </h2>
        <p className="text-slate-600 max-w-3xl">
          We organize hackathons, workshops, and training programs across the
          country, creating platforms for learning, collaboration, and
          real-world innovation.
        </p>
      </div>
      Events Grid
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayEvents.map((event) => (
          <EventCard key={event._id || event.id} event={event} />
        ))}
      </div>
      {/* View All Button */}
      <div className="flex justify-center pt-12">
        <Link
          to="/events"
          className="px-8 py-4 bg-secondary rounded-full text-white hover:bg-secondary/90 hover:scale-105 transition-all font-bold shadow-lg shadow-secondary/20"
        >
          View All Events
        </Link>
      </div>
    </div>
  );
}

export default Event;
