import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  FaCalendarAlt, FaMapMarkerAlt, FaMapPin, FaUserTie, FaLightbulb, 
  FaGift, FaExternalLinkAlt, FaClock, FaArrowLeft, FaLinkedin 
} from "react-icons/fa";
import API from "../Services/api";
import SEO from "../Components/Common/SEO";
import Breadcrumbs from "../Components/UI/Breadcrumbs";

function EventDetails() {
  const { eventSlug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        let endpoint = "";
        // Check if eventSlug is a valid MongoID (24 hex characters)
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(eventSlug);
        
        if (isMongoId) {
            endpoint = `/events/${eventSlug}`;
        } else {
            endpoint = `/events/slug/${eventSlug}`;
        }
        
        const { data } = await API.get(endpoint);
        setEvent(data.data);
      } catch (error) {
        console.error("Failed to fetch event", error);
      } finally {
        setLoading(false);
      }
    };
    if (eventSlug) {
        fetchEvent();
    }
  }, [eventSlug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading event...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found</div>;

  const isUpcoming = event.status === "Upcoming" || event.status === "Published" || event.status === "Live";
  const registrationOpen = isUpcoming && event.registrationDeadline && new Date(event.registrationDeadline) > new Date();
  
  const safeParseArr = (arr) => {
    if (!arr) return [];
    if (typeof arr === 'string') {
        try {
            const parsed = JSON.parse(arr);
            return Array.isArray(parsed) ? parsed : [arr];
        } catch (e) {
            return arr.split(',').map(s => s.trim()).filter(Boolean);
        }
    }
    if (Array.isArray(arr)) {
        if (arr.length === 1 && typeof arr[0] === 'string' && arr[0].startsWith('[')) {
            try {
                const parsed = JSON.parse(arr[0]);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {}
        }
        return arr;
    }
    return [];
  };

  const highlights = safeParseArr(event.highlights);
  const benefits = safeParseArr(event.benefits);

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: event.title, path: `/events/${eventSlug}` }
  ];

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "image": [event.image],
    "startDate": event.startDate || event.date,
    "endDate": event.endDate || event.date,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": event.location?.toLowerCase().includes("online") ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": event.location?.toLowerCase().includes("online") ? "VirtualLocation" : "Place",
      "name": event.venue || event.location,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.location,
        "addressRegion": "Nepal",
        "postalCode": "44600",
        "addressCountry": "NP"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": event.organizer || "Code for Change",
      "url": window.location.origin
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <SEO 
        title={event.title}
        description={event.description}
        image={event.image}
        type="website"
        breadcrumbs={breadcrumbs}
        jsonLd={eventJsonLd}
      />
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-5 pb-16 w-full">
            <Link to="/events" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 font-medium">
              <FaArrowLeft /> Back to Events
            </Link>
            <div className="flex gap-3 mb-4">
              <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md ${
                event.status === 'Live' ? 'bg-rose-500/90 text-white' :
                isUpcoming ? 'bg-secondary/90 text-white' :
                'bg-slate-800/90 text-white'
              }`}>
                {event.status}
              </span>
              <span className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-white/20 text-white backdrop-blur-md">
                {event.type}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">{event.title}</h1>
            <p className="text-xl text-white/90 max-w-3xl">{event.description}</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 mt-8">
        <Breadcrumbs crumbs={[
          { name: "Events", path: "/events" },
          { name: event.title, path: `/events/${eventSlug}` }
        ]} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Event Details */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-6">About This Event</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {event.fullDescription || event.description}
              </p>
            </div>

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <FaUserTie className="text-secondary" /> Speakers & Facilitators
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.speakers.map((speaker, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-secondary/5 transition-all">
                      {speaker.image && (
                        <img src={speaker.image} alt={speaker.name} className="w-16 h-16 rounded-full object-cover" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">{speaker.name}</h3>
                        <p className="text-sm text-slate-600">{speaker.role}</p>
                        {speaker.organization && (
                          <p className="text-xs text-slate-500 mt-1">{speaker.organization}</p>
                        )}
                        {speaker.linkedin && (
                          <a href={speaker.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 mt-2 inline-flex items-center gap-1 text-xs">
                            <FaLinkedin /> LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <FaLightbulb className="text-amber-500" /> Event Highlights
                </h2>
                <ul className="space-y-3">
                  {highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-slate-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <div className="bg-gradient-to-br from-secondary/5 to-white rounded-3xl p-8 border border-secondary/10">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <FaGift className="text-secondary" /> What You'll Gain
                </h2>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-secondary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-slate-700 font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            {isUpcoming && event.registrationLink && (
              <div className="bg-gradient-to-br from-secondary to-primary rounded-3xl p-8 text-white shadow-xl sticky top-6">
                <h3 className="text-2xl font-black mb-6">Register Now</h3>
                {registrationOpen ? (
                  <>
                    <p className="mb-6 text-secondary/10">
                      Secure your spot for this amazing event!
                    </p>
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-6 py-4 bg-white text-secondary rounded-full text-center font-bold hover:bg-secondary/5 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      Register Now <FaExternalLinkAlt />
                    </a>
                    {event.registrationDeadline && (
                      <p className="mt-4 text-sm text-emerald-100 text-center">
                        Registration closes: {new Date(event.registrationDeadline).toLocaleDateString()}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-white/80">Registration has closed for this event.</p>
                )}
              </div>
            )}

            {/* Event Info Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-xl font-black text-slate-900 mb-4">Event Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <FaCalendarAlt className="text-secondary mt-1" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</p>
                    <p className="text-slate-900 font-medium">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {event.startDate && event.endDate && (
                      <p className="text-sm text-slate-600 mt-1">
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="text-blue-500 mt-1" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</p>
                    <p className="text-slate-900 font-medium">{event.location}</p>
                  </div>
                </div>

                {event.venue && (
                  <div className="flex items-start gap-4">
                    <FaMapPin className="text-purple-500 mt-1" />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Venue</p>
                      <p className="text-slate-900 font-medium">{event.venue}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <FaUserTie className="text-amber-500 mt-1" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Organizer</p>
                    <p className="text-slate-900 font-medium">{event.organizer}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Card */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-3">Share This Event</h3>
              <p className="text-sm text-slate-600">
                Spread the word and invite your friends to join this amazing event!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
