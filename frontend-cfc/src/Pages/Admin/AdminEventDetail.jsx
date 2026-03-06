import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserTie,
  FaClock,
  FaMapPin,
  FaLink,
  FaEdit,
  FaTrash,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import API from "../../Services/api";
import { toast } from "react-hot-toast";

function AdminEventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.data);
      }
    } catch (error) {
      console.error("Fetch event error:", error);
      toast.error("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <BsArrowRepeat className="text-4xl text-emerald-500 animate-spin" />
          <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
            Retrieving event data...
          </p>
        </div>
      </div>
    );

  if (!event)
    return (
      <div className="text-center p-20">
        <h2 className="text-2xl font-black text-slate-900 italic">
          Event not found.
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-emerald-600 font-bold underline"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 hover:bg-slate-900 transition-all shadow-sm"
        >
          <FaArrowLeft className="text-emerald-600 group-hover:text-white transition-colors" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-900 group-hover:text-white transition-colors">
            Events List
          </span>
        </button>

        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600`}
          >
            {event.status}
          </span>
          <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white">
            {event.type}
          </span>
        </div>
      </div>

      {/* Hero Content */}
      <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="h-96 md:h-auto overflow-hidden">
            <img
              src={event.bannerImage || event.image}
              alt={event.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="p-12 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-slate-950 tracking-tight leading-tight">
                {event.title}
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed">
                {event.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Date
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Location
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {event.location}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href={`/events/${event.slug}`}
                target="_blank"
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
              >
                View Public <FaExternalLinkAlt />
              </a>
              <button className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">
                <FaEdit /> Edit Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600">
              <FaClock />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
              Schedule
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Start Date
              </p>
              <p className="text-sm font-bold text-slate-900">
                {new Date(event.startDate).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                End Date
              </p>
              <p className="text-sm font-bold text-slate-900">
                {new Date(event.endDate).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600">
              <FaMapPin />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
              Venue Info
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Venue
              </p>
              <p className="text-sm font-bold text-slate-900">{event.venue}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Organizer
              </p>
              <p className="text-sm font-bold text-slate-900">
                {event.organizer}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600">
              <FaLink />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">
              Registration
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Registration Link
              </p>
              <a
                href={event.registrationLink}
                target="_blank"
                className="text-sm font-bold text-emerald-600 break-all underline decoration-2"
              >
                {event.registrationLink}
              </a>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Deadline
              </p>
              <p className="text-sm font-bold text-slate-900">
                {new Date(event.registrationDeadline).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Description */}
      <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm space-y-8">
        <h3 className="text-2xl font-black text-slate-950 tracking-tight">
          Additional Information
        </h3>
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line">
            {event.fullDescription}
          </p>
        </div>
      </div>

      <div className="p-8 text-center text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-40">
        Admin Event Management Record
      </div>
    </div>
  );
}

export default AdminEventDetail;
