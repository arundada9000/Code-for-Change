import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Banner from "../Components/UI/Banner";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import SEO from "../Components/Common/SEO";
import { 
  FaBriefcase, FaMapMarkerAlt, FaClock, 
  FaBuilding, FaArrowRight, FaSearch, FaFilter 
} from "react-icons/fa";
import API from "../Services/api";
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
      }

      // Handle comma-separated values
      if (trimmed.includes(',')) {
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
  <span className="flex items-center gap-2 px-2.5 py-2 bg-white text-secondary border border-secondary/20 rounded-xl text-xs transition-all group animate-in zoom-in duration-300">
    {label}
    <button 
      onClick={onClear} 
      className="w-5 h-5 flex cursor-pointer group/btn items-center justify-center bg-gray-200/70 hover:bg-secondary/20 rounded-lg transition-all"
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

  const categories = ["All", ...new Set(internships.map(i => i.category))];
  const types = ["All", "Full-time", "Remote", "Part-time", "Contract", ...new Set(internships.map(i => i.type))].filter((v, i, a) => a.indexOf(v) === i);

  const filteredInternships = internships.filter(job => {
    const matchesCategory = category === "All" || job.category === category;
    const matchesType = type === "All" || job.type === type;
    const matchesSearch = 
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.companyName.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());
    
    return matchesCategory && matchesType && matchesSearch;
  });

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setType("All");
  };

  return (
    <div className="bg-[#FDFDFD] min-h-screen pb-32">
      <SEO 
        title="Internship Opportunities"
        description="Launch your tech career with premium internship opportunities at top companies through Code for Change Nepal."
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Internships", path: "/internships" }]}
      />
      <Banner />
      {/* <div className="max-w-7xl mx-auto px-6 mt-8">
        <Breadcrumbs crumbs={[{ name: "Internships", path: "/internships" }]} />
      </div> */}
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Compact Brand Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SlideUp className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-0.5 w-10 bg-primary"></span>
              <h4 className="uppercase tracking-wider text-xs font-bold text-primary">
                Opportunities
              </h4>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
               Find Your Next Step
            </h2>
            <p className="text-gray-500 font-medium max-w-xl text-base">
              Explore open roles and build the future of Nepal's tech ecosystem.
            </p>
          </SlideUp>
          
          <FadeIn delay={0.2} className="bg-secondary/5 px-6 py-3 rounded-2xl border border-secondary/10 backdrop-blur-sm">
            <p className="text-[9px] text-gray-800 font-bold uppercase tracking-widest mb-0.5">Available Roles</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">{filteredInternships.length}</span>
              <span className="text-xs font-medium text-gray-600">Matching</span>
            </div>
          </FadeIn>
        </div>

        {/* Discovery Hub: Compact Premium Suite */}
        <SlideUp delay={0.2}>
        <div className="bg-white backdrop-blur-xl rounded-[2rem] shadow-sm border border-secondary/20 overflow-hidden mb-12 duration-700">
          <div className="p-6 md:p-8 space-y-8">
            {/* Search Focal Point */}
            <div className="relative group">
              <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-secondary transition-all text-base" />
              <input 
                type="text" 
                placeholder="Search by job title, technologies, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-300 rounded-2xl text-sm font-bold text-primary  outline-none focus:bg-white focus:border-secondary focus:ring focus:ring-secondary/5 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Engagement Type Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 ml-2">
                  <FaBriefcase className="text-secondary text-[10px]" />
                  <label className="text-sm  text-primary ">Engagement Type</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {types.map(t => {
                    const isSelected = type === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`px-5 py-2.5 rounded-xl border transition-all duration-300 text-xs cursor-pointer flex items-center gap-2 ${
                          isSelected 
                            ? "bg-secondary border-secondary text-white shadow-md shadow-secondary/10 -translate-y-0.5" 
                            : "bg-white border-gray-400 text-gray-700 hover:border-secondary/20 hover:text-secondary hover:bg-secondary/5"
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
                <div className="flex items-center gap-2 ml-2">
                  <FaFilter className="text-secondary text-[10px]" />
                  <label className="text-sm  text-primary">Industry / Sector</label>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-5 py-2.5 rounded-xl border transition-all duration-300 text-xs cursor-pointer flex items-center gap-2 ${
                        category === cat 
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/10 scale-105" 
                          : "bg-white border-gray-400 text-gray-700 hover:border-primary/20 hover:text-primary"
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
            <div className="bg-secondary/5 border-t border-secondary/10 px-6 md:px-12 py-5 flex flex-wrap items-center gap-1 md:gap-4 animate-in slide-in-from-bottom-2 duration-500">
              <span className="text-sm font-bold text-gray-700 mr-2">Active Filters:</span>
              
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
                className="ml-auto text-xs font-bold text-white bg-red-800 px-5 py-3 rounded-full cursor-pointer hover:bg-red-800/80  transition-all  flex items-center gap-2"
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
                  className={`group bg-white rounded-3xl p-8 border border-gray-300 shadow-sm transition-all duration-500 flex flex-col h-full ${
                    isClosed 
                      ? "scale-[0.98]" 
                      : "hover:border-secondary/30 hover:shadow-xl hover:shadow-secondary/5"
                  }`}
                >
                  {/* Top Meta Data Section */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/5 flex items-center justify-center p-3  text-secondary group-hover:text-white transition-all duration-300 shadow-inner">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain" />
                      ) : (
                        <FaBriefcase className="text-2xl" />
                      )}
                    </div>
                    <div className="flex items-end gap-2 text-right">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                        isClosed ? 'bg-gray-300 text-gray-500' : 'bg-primary text-white shadow-md shadow-primary/10'
                      }`}>
                        {job.type}
                      </span>
                      <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs border transition-all ${
                        status.type === 'urgent' ? 'bg-red-50 border-red-100 text-red-500 animate-pulse' :
                        status.type === 'new' ? 'bg-green-50 border-green-100 text-green-600' :
                        'bg-gray-200 border-gray-100 text-gray-700'
                      }`}>
                        {status.type === 'urgent' && <FaClock />}
                        {status.label}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors leading-tight">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-700 font-medium ">
                      <FaBuilding className="text-secondary" /> {job.companyName}
                    </div>
                  </div>

                  {/* 2x2 Basic Data Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-secondary/5 border border-transparent hover:border-secondary/10 transition-all">
                      <p className="text-xs font-medium text-gray-700 mb-1.5">Location</p>
                      <div className="flex items-center gap-2 text-primary text-xs font-bold truncate">
                         <FaMapMarkerAlt className="text-secondary/50" /> {job.location}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/5 border border-transparent hover:border-secondary/10 transition-all">
                      <p className="text-xs font-medium text-gray-700 mb-1.5">Compensation</p>
                      <div className="flex items-center gap-2 text-secondary text-xs font-bold font-mono">
                         {job.salaryRange || "Competitive"}
                      </div>
                    </div>
                  </div>

                  {/* Description Preview / Toggle */}
                  <div className="mb-6">
                    <button 
                      onClick={() => toggleExpand(job._id)}
                      className="flex items-center justify-between cursor-pointer w-full px-6 py-3.5 bg-secondary/5 text-secondary hover:bg-secondary hover:text-white rounded-2xl font-bold text-sm transition-all duration-300 group/btn shadow-inner"
                    >
                      <span>{isExpanded ? "Minimize Summary" : "View Full Opportunity Details"}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Expandable Section */}
                    <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
                      <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                        {/* Description Block */}
                        <div>
                           <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-3">
                             <span className="w-8 h-[2px] bg-secondary/30 rounded-full"></span>
                             Role Overview
                           </h4>
                           <p className="text-gray-600 text-sm leading-relaxed text-justify bg-[#FDFDFD] p-6 rounded-2xl border border-secondary/5 shadow-inner">
                             {job.description}
                           </p>
                        </div>

                        {/* Requirements & Responsibilities Grid */}
                        <div className="grid grid-cols-1 gap-10">
                           {job.requirements && parseArray(job.requirements).length > 0 && (
                             <div>
                               <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest mb-5 flex items-center gap-3">
                                 <span className="w-8 h-[2px] bg-secondary/30 rounded-full"></span>
                                 Candidate Requirements
                               </h4>
                               <div className="flex flex-wrap gap-3">
                                 {parseArray(job.requirements).map((req, i) => (
                                   <span 
                                     key={i} 
                                     className="px-5 py-2.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl text-xs font-bold hover:bg-secondary hover:text-white hover:-translate-y-1 transition-all duration-300 cursor-default shadow-sm shadow-secondary/5"
                                   >
                                     {req}
                                   </span>
                                 ))}
                               </div>
                             </div>
                           )}

                           {job.responsibilities && parseArray(job.responsibilities).length > 0 && (
                             <div>
                               <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest mb-5 flex items-center gap-3">
                                 <span className="w-8 h-[2px] bg-secondary/30 rounded-full"></span>
                                 Key Responsibilities
                               </h4>
                               <div className="flex flex-wrap gap-3">
                                 {parseArray(job.responsibilities).map((resp, i) => (
                                   <span 
                                     key={i} 
                                     className="px-5 py-2.5 bg-primary/5 text-primary border border-primary/10 rounded-xl text-xs font-bold hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300 cursor-default shadow-sm shadow-primary/5"
                                   >
                                     {resp}
                                   </span>
                                 ))}
                               </div>
                             </div>
                           )}
                        </div>

                        {/* Posted & Deadline Meta */}
                        <div className="flex flex-wrap gap-4 pt-4 border-t border-secondary/5">
                           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                             <FaClock className="text-secondary/50" /> Posted: {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                           </div>
                           <div className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                             <FaClock className="animate-pulse" /> Closing: {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Rolling"}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-secondary/5 flex flex-col sm:flex-row gap-4">
                    {!isClosed ? (
                      <Link 
                        to={`/internship-application?id=${job._id}&track=${job.category}`}
                        className="flex-1 py-4 bg-primary text-white rounded-full flex items-center justify-center gap-3 font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-secondary hover:shadow-secondary/20 transition-all active:scale-[0.98]"
                      >
                        Apply Now <FaArrowRight />
                      </Link>
                    ) : (
                      <div className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center gap-3 font-bold text-[11px] uppercase tracking-widest cursor-not-allowed">
                        Application Closed
                      </div>
                    )}
                  </div>
                </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        ) : (
          <div className="bg-white rounded-3xl p-24 text-center border border-secondary/10 shadow-sm">
             <div className="w-24 h-24 bg-secondary/5 rounded-full flex items-center justify-center mx-auto mb-8 text-secondary/30">
               <FaSearch size={40} />
             </div>
             <h3 className="text-2xl font-bold text-primary mb-4">
               {search ? "No matches found" : "No open opportunities"}
             </h3>
             <p className="text-gray-500 text-sm max-w-sm mx-auto mb-10">
               {search 
                 ? `We couldn't find any roles matching "${search}". Try resetting your filters.` 
                 : "We're currently scaling our operations. Check back soon for new openings."}
             </p>
             {search && (
               <button 
                 onClick={clearFilters}
                 className="px-8 py-3 bg-secondary text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-primary transition-all"
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
