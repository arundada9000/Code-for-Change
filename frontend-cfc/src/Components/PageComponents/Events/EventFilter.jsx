import React, { useState } from "react";
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGlobe,
  FaStar,
  FaSortAmountDown,
} from "react-icons/fa";

const REGIONS = [
  "Kathmandu",
  "Pokhara",
  "Rupandehi",
  "Dang",
  "Birgunj",
  "Farwest",
  "Koshi",
  "Chitwan",
  "LB Karnali",
];
const EVENT_TYPES = [
  "hackathon",
  "workshop",
  "webinar",
  "conference",
  "social_impact",
];
const YEARS = [2022, 2023, 2024, 2025, 2026];

const EventFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    region: "",
    year: "",
    sort: "newest",
    isNational: "",
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Build API params: convert year to startDate/endDate
    const params = { ...newFilters };
    if (newFilters.year) {
      params.startDate = `${newFilters.year}-01-01`;
      params.endDate = `${newFilters.year}-12-31`;
      delete params.year;
    }
    // sort: convert to sort param the backend understands
    if (newFilters.sort === "newest") {
      delete params.sort; // default is date:-1
    } else {
      params.sort = "date"; // ascending
    }

    onFilterChange(params);
  };

  const handleReset = () => {
    const empty = {
      search: "",
      type: "",
      region: "",
      year: "",
      sort: "newest",
      isNational: "",
    };
    setFilters(empty);
    onFilterChange({});
  };

  const activeCount = [
    filters.search,
    filters.type,
    filters.region,
    filters.year,
    filters.isNational,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-3xl shadow-sm shadow-slate-200/50 border border-slate-100 p-6 mb-10 transition-all">
      {/* Top Row */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-5">
        <div className="flex flex-col gap-2 md:flex-row md:justify-between w-full md:items-center">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 shrink-0">
            <FaFilter className="text-secondary" />
            Find Events
            {activeCount > 0 && (
              <span className="ml-1 w-5 h-5 bg-secondary text-white rounded-full text-[10px] flex items-center justify-center font-black">
                {activeCount}
              </span>
            )}
          </h3>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search events, topics, or keywords..."
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              className="w-full pl-12 pr-4 py-3 border font-normal border-slate-300 shadow rounded-full focus:outline-none focus:border-transparent focus:ring focus:ring-secondary transition-all text-slate-700 placeholder:font-normal placeholder:text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={handleReset}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors whitespace-nowrap"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden flex items-center gap-2 text-sm font-medium text-black/70 hover:text-secondary transition-colors"
          >
            {isExpanded ? "Hide Filters" : "More Filters"}
          </button>
        </div>
      </div>

      {/* Filter Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 transition-all duration-300 ${isExpanded ? "block" : "hidden md:grid"}`}
      >
        {/* Event Type */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-primary/80 uppercase flex items-center gap-2">
            <FaGlobe className="text-secondary" /> Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className="w-full px-4 py-3 bg-slate-50/20 border border-slate-300 rounded-full focus:outline-none focus:ring focus:ring-secondary transition-all font-medium text-slate-700 appearance-none cursor-pointer text-sm"
          >
            <option value="">All Types</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type} className="capitalize">
                {type.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-primary/80 uppercase flex items-center gap-2">
            <FaMapMarkerAlt className="text-secondary" /> Region
          </label>
          <select
            value={filters.region}
            onChange={(e) => handleChange("region", e.target.value)}
            className="w-full px-4 py-3 bg-slate-50/20 border border-slate-300 rounded-full focus:outline-none focus:ring focus:ring-secondary transition-all font-medium text-slate-700 appearance-none cursor-pointer text-sm"
          >
            <option value="">All Regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-primary/80 uppercase flex items-center gap-2">
            <FaCalendarAlt className="text-secondary" /> Year
          </label>
          <select
            value={filters.year}
            onChange={(e) => handleChange("year", e.target.value)}
            className="w-full px-4 py-3 bg-slate-50/20 border border-slate-300 rounded-full focus:outline-none focus:ring focus:ring-secondary transition-all font-medium text-slate-700 appearance-none cursor-pointer text-sm"
          >
            <option value="">All Years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* National / Local */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-primary/80 uppercase flex items-center gap-2">
            <FaStar className="text-secondary" /> Scope
          </label>
          <select
            value={filters.isNational}
            onChange={(e) => handleChange("isNational", e.target.value)}
            className="w-full px-4 py-3 bg-slate-50/20 border border-slate-300 rounded-full focus:outline-none focus:ring focus:ring-secondary transition-all font-medium text-slate-700 appearance-none cursor-pointer text-sm"
          >
            <option value="">All Events</option>
            <option value="true">National Events</option>
            <option value="false">Local Events</option>
          </select>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-primary/80 uppercase flex items-center gap-2">
            <FaSortAmountDown className="text-secondary" /> Sort
          </label>
          <select
            value={filters.sort}
            onChange={(e) => handleChange("sort", e.target.value)}
            className="w-full px-4 py-3 bg-slate-50/20 border border-slate-300 rounded-full focus:outline-none focus:ring focus:ring-secondary transition-all font-medium text-slate-700 appearance-none cursor-pointer text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default EventFilter;
