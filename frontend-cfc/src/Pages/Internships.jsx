import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Banner from "../Components/UI/Banner";
import SEO from "../Components/Common/SEO";
import { 
  FaBriefcase, FaMapMarkerAlt, FaClock, 
  FaBuilding, FaArrowRight, FaSearch, FaFilter 
} from "react-icons/fa";
import API from "../Services/api";
import DebouncedSearchInput from "../Components/UI/DebouncedSearchInput";
import { InternshipCardSkeleton } from "../Components/Loading/Skeleton";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "../Components/Common/Animations";

const parseArray = (data) => {
  const result = [];
  
  const process = (item) => {
    if (!item) return;
    
    if (Array.isArray(item)) {
      item.forEach(process);
    } else if (typeof item === 'string') {
      const trimmed = item.trim();
      
      // Handle stringified arrays like '["a", "b"]' or "['a', 'b']"
      if ((trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          // Try standard JSON parse
          const parsed = JSON.parse(trimmed.replace(/'/g, '"'));
          if (Array.isArray(parsed)) {
            parsed.forEach(process);
            return;
          }
        } catch (e) {
          // If JSON parse fails, manually strip and split
          const stripped = trimmed.slice(1, -1);
          stripped.split(',').forEach(s => {
            const clean = s.trim().replace(/^["']|["']$/g, '');
            if (clean) result.push(clean);
          });
          return;
        }
      }
      
      // Handle dot-separated values
      if (trimmed.includes('.')) {
        trimmed.split('.').forEach(s => {
          const clean = s.trim();
          if (clean && clean.length > 1) result.push(clean);
        });
      // Handle comma-separated values
      } else if (trimmed.includes(',')) {
        trimmed.split(',').forEach(s => {
          const clean = s.trim();
          if (clean) result.push(clean);
        });
      } else if (trimmed && !trimmed.includes('.')) {
        result.push(trimmed);
      }
    }
  };

  process(data);
  // Deduplicate and filter empty
  return [...new Set(result)].filter(Boolean);
};

const ActiveFilterChip = ({ label, onClear }) => (
  <span className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-700 border border-slate-200 shadow-sm rounded-xl text-sm font-semibold transition-all group animate-in zoom-in duration-300">
    {label}
    <button 
      onClick={onClear} 
      className="w-5 h-5 flex cursor-pointer group/btn items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-md transition-all"
      title="Remove Filter"
    >
      <span className="text-sm leading-none group-hover/btn:rotate-90 transition-all ease-in duration-200">×</span>
    </button>
  </span>
);

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [expandedJobs, setExpandedJobs] = useState(new Set());

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/internships");
        setInternships(data.data || []);
      } catch (error) {
        console.error("Failed to fetch internships:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInternships();
  }, []);

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedJobs(newExpanded);
  };

  const getJobStatus = (deadline, createdAt) => {
    const now = new Date();
    const target = deadline ? new Date(deadline) : null;
    const posted = new Date(createdAt);
    
    const diffPosted = now - posted;
    const daysSincePosted = Math.floor(diffPosted / (1000 * 60 * 60 * 24));
    
    if (target) {
      const diffDeadline = target - now;
      const daysToDeadline = Math.floor(diffDeadline / (1000 * 60 * 60 * 24));
      
      if (diffDeadline < 0) return { label: "Closed", type: 'expired' };
      if (daysToDeadline <= 3) return { label: "Expiring Soon", type: 'urgent' };
    }
    
    if (daysSincePosted <= 3) return { label: "New Opening", type: 'new' };
    
    return { label: "Hiring", type: 'active' };
  };

  const categories = useMemo(() => ["All", ...new Set(internships.map(i => i.category))], [internships]);
  const types = useMemo(() => ["All", "Full-time", "Remote", "Part-time", "Contract", ...new Set(internships.map(i => i.type))].filter((v, i, a) => a.indexOf(v) === i), [internships]);

  const filteredInternships = useMemo(() => {
    return internships.filter(job => {
      const matchesCategory = category === "All" || job.category === category;
      const matchesType = type === "All" || job.type === type;
      const matchesSearch = 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.companyName.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase());
      
      return matchesCategory && matchesType && matchesSearch;
    });
  }, [internships, category, type, search]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setType("All");
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      <SEO 
        title="Internship Opportunities"
        description="Launch your tech career with premium internship opportunities at top companies through Code for Change Nepal."
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Internships", path: "/internships" }]}
      />
      <Banner />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Compact Brand Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SlideUp className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-1 w-10 bg-blue-500 rounded-full"></span>
              <h4 className="uppercase tracking-tight text-sm font-bold text-blue-600">
                Opportunities
              </h4>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
               Find Your Next Step
            </h2>
            <p className="text-slate-500 text-lg max-w-xl leading-relaxed">
              Explore open roles and build the future of Nepal's tech ecosystem.
            </p>
          </SlideUp>
          
          <FadeIn delay={0.2} className="bg-white shadow-[0_8px_30px_-10px_rgba(0,0,0,0.06)] px-6 py-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Available Roles</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{filteredInternships.length}</span>
              <span className="text-sm font-semibold text-slate-500">Matching</span>
            </div>
          </FadeIn>
        </div>

        {/* Discovery Hub: Compact Premium Suite */}
        <SlideUp delay={0.2}>
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_-10px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden mb-12 duration-700 relative z-10">
          <div className="p-6 md:p-8 space-y-8">
            {/* Search Focal Point */}
            <div className="relative group">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors text-lg" />
              <DebouncedSearchInput 
                placeholder="Search by job title, technologies, or keywords..."
                value={search}
                onSearch={setSearch}
                className="w-full pl-14 pr-6 py-4 bg-slate-50/80 border border-slate-200 rounded-xl text-base font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-300 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Engagement Type Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 ml-1">
                  <FaBriefcase className="text-slate-400 text-sm" />
                  <label className="text-sm font-bold text-slate-700">Engagement Type</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {types.map(t => {
                    const isSelected = type === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`px-5 py-2.5 rounded-xl border transition-all duration-300 text-sm font-semibold cursor-pointer flex items-center gap-2 ${
                          isSelected 
                            ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/20" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {t === "Full-time" && <FaClock className="text-xs" />}
                        {t === "Remote" && <FaMapMarkerAlt className="text-xs" />}
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Category Chips */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 ml-1">
                  <FaFilter className="text-slate-400 text-sm" />
                  <label className="text-sm font-bold text-slate-700">Industry / Sector</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-5 py-2.5 rounded-xl border transition-all duration-300 text-sm font-semibold cursor-pointer flex items-center gap-2 ${
                        category === cat 
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20" 
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Active Filters Row */}
          {(type !== "All" || category !== "All" || search) && (
            <div className="bg-slate-50/80 border-t border-slate-100 px-6 md:px-8 py-4 flex flex-wrap items-center gap-3 animate-in slide-in-from-bottom-2 duration-500">
              <span className="text-sm font-bold text-slate-700">Active Filters:</span>
              
              {search && (
                <ActiveFilterChip label={`Search: ${search}`} onClear={() => setSearch("")} />
              )}
              {type !== "All" && (
                <ActiveFilterChip label={type} onClear={() => setType("All")} />
              )}
              {category !== "All" && (
                <ActiveFilterChip label={category} onClear={() => setCategory("All")} />
              )}

              <button 
                onClick={clearFilters}
                className="ml-auto text-sm font-bold text-slate-500 hover:text-red-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-red-50 transition-all flex items-center gap-2"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
        </SlideUp>

        {loading ? (
          <InternshipCardSkeleton count={4} />
        ) : filteredInternships.length > 0 ? (
          <StaggerContainer className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredInternships.map(job => {
              const status = getJobStatus(job.applicationDeadline, job.createdAt);
              const isClosed = status.type === 'expired';
              const isExpanded = expandedJobs.has(job._id);

              return (
                <StaggerItem key={job._id}>
                <div 
                  className={`group bg-white rounded-[2.5rem] p-2 border border-slate-200 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full ${
                    isClosed 
                      ? "scale-[0.98] opacity-75" 
                      : "hover:shadow-[0_30px_60px_-15px_rgba(37,99,235,0.2)] hover:-translate-y-2 hover:border-blue-200"
                  }`}
                >
                  {/* Card Header (Gradient background) */}
                  <div className="relative h-28 bg-gradient-to-br from-slate-50 via-slate-100/50 to-blue-50/50 rounded-t-[2rem] rounded-b-2xl overflow-hidden group-hover:from-blue-50 group-hover:via-indigo-50/50 group-hover:to-purple-50/50 transition-colors duration-700">
                    {/* Decorative blurred blob */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/10 blur-2xl rounded-full group-hover:bg-blue-400/20 transition-all duration-700"></div>
                    
                    {/* Top Right Badges */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                        isClosed ? 'bg-white/80 text-slate-500' : 'bg-slate-900 text-white'
                      }`}>
                        {job.type}
                      </span>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm backdrop-blur-md transition-all ${
                        status.type === 'urgent' ? 'bg-red-50/90 border-red-100 text-red-600 animate-pulse' :
                        status.type === 'new' ? 'bg-emerald-50/90 border-emerald-100 text-emerald-600' :
                        'bg-white/80 border-slate-200/50 text-slate-600'
                      }`}>
                        {status.type === 'urgent' && <FaClock size={10} />}
                        {status.label}
                      </div>
                    </div>

                    {/* Floating Logo Avatar */}
                    <div className="absolute -bottom-6 left-6 w-16 h-16 bg-white rounded-[1.25rem] p-2.5 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.12)] border border-slate-100/80 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500 z-10">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain drop-shadow-sm" />
                      ) : (
                        <FaBriefcase className="text-2xl drop-shadow-sm" />
                      )}
                    </div>
                  </div>

                  {/* Main Content Body */}
                  <div className="px-6 pt-10 pb-4 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h3 className="text-2xl font-black text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors leading-tight tracking-tight line-clamp-2">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                        <FaBuilding className="text-slate-400" /> {job.companyName}
                      </div>
                    </div>

                    {/* Widget Data Rows */}
                    <div className="flex flex-col gap-2.5 mb-6">
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100/60 group-hover:bg-blue-50/40 group-hover:border-blue-100/50 transition-all duration-300">
                         <div className="flex items-center gap-3">
                           <div className="w-9 h-9 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                             <FaMapMarkerAlt size={14} />
                           </div>
                           <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Location</p>
                             <p className="text-sm font-black text-slate-800 tracking-tight truncate max-w-[150px] sm:max-w-[180px]">{job.location}</p>
                           </div>
                         </div>
                      </div>
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100/60 group-hover:bg-emerald-50/40 group-hover:border-emerald-100/50 transition-all duration-300">
                         <div className="flex items-center gap-3">
                           <div className="w-9 h-9 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                             <div className="font-bold text-lg leading-none mt-[-2px]">$</div>
                           </div>
                           <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Compensation</p>
                             <p className="text-sm font-black text-emerald-600 tracking-tight">{job.salaryRange || "Competitive"}</p>
                           </div>
                         </div>
                      </div>
                    </div>

                    {/* Description Toggle */}
                    <div className="mb-4 mt-auto">
                      <button 
                        onClick={() => toggleExpand(job._id)}
                        className="flex items-center justify-center gap-2 cursor-pointer w-full py-3 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold tracking-tight text-xs transition-all duration-300 border border-transparent hover:border-slate-200"
                      >
                        <span>{isExpanded ? "Hide Details" : "Read Opportunity Details"}</span>
                        <svg 
                          className={`w-3.5 h-3.5 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Expandable Section */}
                      <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 animate-in fade-in duration-500 shadow-inner">
                          {/* Description Block */}
                          <div className="mb-6">
                             <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                               <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
                               Role Overview
                             </h4>
                             <p className="text-slate-600 text-xs leading-relaxed text-justify">
                               {job.description}
                             </p>
                          </div>

                          {/* Requirements & Responsibilities Grid */}
                          <div className="grid grid-cols-1 gap-5">
                             {job.requirements && parseArray(job.requirements).length > 0 && (
                               <div>
                                 <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                   <span className="w-1 h-3 bg-purple-500 rounded-full"></span>
                                   Requirements
                                 </h4>
                                 <div className="flex flex-wrap gap-1.5">
                                   {parseArray(job.requirements).map((req, i) => (
                                     <span 
                                       key={i} 
                                       className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 shadow-sm rounded-lg text-[10px] font-bold cursor-default"
                                     >
                                       {req}
                                     </span>
                                   ))}
                                 </div>
                               </div>
                             )}

                             {job.responsibilities && parseArray(job.responsibilities).length > 0 && (
                               <div>
                                 <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                   <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                                   Responsibilities
                                 </h4>
                                 <div className="flex flex-wrap gap-1.5">
                                   {parseArray(job.responsibilities).map((resp, i) => (
                                     <span 
                                       key={i} 
                                       className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 shadow-sm rounded-lg text-[10px] font-bold cursor-default"
                                     >
                                       {resp}
                                     </span>
                                   ))}
                                 </div>
                               </div>
                             )}
                          </div>

                          {/* Posted & Deadline Meta */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-5">
                             <div className="text-[10px] font-bold text-slate-500">
                               Posted {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                             </div>
                             <div className="text-[10px] font-bold text-red-500">
                               Closes {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "Rolling"}
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      {!isClosed ? (
                        <Link 
                          to={`/internship-application?id=${job._id}&track=${job.category}`}
                          className="w-full py-4 bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-sm tracking-tight shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:shadow-[0_12px_25px_-8px_rgba(37,99,235,0.5)] transition-all duration-300 active:scale-[0.98]"
                        >
                          Apply Now <FaArrowRight size={12} />
                        </Link>
                      ) : (
                        <div className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center gap-2 font-black text-sm tracking-tight cursor-not-allowed">
                          Application Closed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        ) : (
          <div className="bg-white rounded-[2rem] p-16 md:p-24 text-center border border-slate-100 shadow-sm">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-400">
               <FaSearch size={32} />
             </div>
             <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
               {search ? "No matches found" : "No open opportunities"}
             </h3>
             <p className="text-slate-500 text-base max-w-sm mx-auto mb-10 leading-relaxed">
               {search 
                 ? `We couldn't find any roles matching "${search}". Try resetting your filters.` 
                 : "We're currently scaling our operations. Check back soon for new openings."}
             </p>
             {search && (
               <button 
                 onClick={clearFilters}
                 className="px-8 py-4 bg-slate-900 text-white rounded-full font-black text-sm tracking-tight hover:bg-slate-800 hover:-translate-y-1 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] transition-all cursor-pointer"
               >
                 Reset Search
               </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Internships;
