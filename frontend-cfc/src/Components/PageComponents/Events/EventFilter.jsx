import React, { useState } from "react";
import { FaSearch, FaFilter, FaCalendarAlt, FaMapMarkerAlt, FaGlobe } from "react-icons/fa";

const EventFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    startDate: "",
    endDate: "",
    location: ""
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const eventTypes = ["hackathon", "workshop", "webinar", "conference", "social_impact"];

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 mb-12 transform transition-all hover:shadow-2xl">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FaFilter className="text-secondary" />
          Find Events
        </h3>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            placeholder="Search events, topics, or keywords..."
            value={filters.search}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all font-medium text-slate-700"
          />
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-secondary transition-colors"
        >
          {isExpanded ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-300 ease-in-out ${isExpanded ? 'block' : 'hidden md:grid'}`}>
        {/* Type Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FaGlobe className="text-blue-400" /> Event Type
          </label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all font-medium text-slate-700 appearance-none cursor-pointer"
          >
            <option value="">All Types</option>
            {eventTypes.map((type) => (
              <option key={type} value={type} className="capitalize">
                {type.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FaCalendarAlt className="text-secondary" /> From
          </label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all font-medium text-slate-700"
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FaCalendarAlt className="text-rose-400" /> To
          </label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all font-medium text-slate-700"
          />
        </div>

        {/* Location (optional extra) */}
        <div className="space-y-2">
           <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FaMapMarkerAlt className="text-amber-400" /> Location
          </label>
          <input
            type="text"
            name="location"
            placeholder="City or Venue"
            value={filters.location}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all font-medium text-slate-700"
          />
        </div>
      </div>
    </div>
  );
};

export default EventFilter;
