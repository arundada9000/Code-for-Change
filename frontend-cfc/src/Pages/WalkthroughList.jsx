import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import Banner from "../Components/UI/Banner";
import SEO from "../Components/Common/SEO";
import API from "../Services/api";
import DebouncedSearchInput from "../Components/UI/DebouncedSearchInput";
import { SlideUp, StaggerContainer, StaggerItem } from "../Components/Common/Animations";

const PROVINCES = [
  "Kathmandu","Pokhara","Rupandehi","Dang","Birgunj","Farwest","Koshi","Chitwan","LB Karnali",
];

function WalkthroughList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [walkthroughs, setWalkthroughs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProvince, setFilterProvince] = useState("");

  const creativeItems = [
    { label: "Blog", path: "/creative" },
    { label: "Walkthrough", path: "/creative/walkthrough" },
    { label: "Periodicals", path: "/creative/periodicals" },
  ];
  const currentPath = location.pathname;

  const fetchWalkthroughs = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("limit", "6");
      params.append("page", String(currentPage));
      params.append("isPublished", "true");
      if (searchTerm) params.append("search", searchTerm);
      if (filterProvince) params.append("province", filterProvince);

      const { data } = await API.get(`/walkthroughs?${params.toString()}`);
      const items = data.data?.walkthroughs || [];
      const pagination = data.data?.pagination || null;

      if (currentPage === 1) {
        setWalkthroughs(items);
      } else {
        setWalkthroughs((prev) => [...prev, ...items]);
      }

      setHasMore(pagination && pagination.page < pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch walkthroughs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchWalkthroughs(1);
  }, [searchTerm, filterProvince]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchWalkthroughs(nextPage);
  };

  return (
    <div>
      <SEO
        title="Walkthroughs - Code for Change"
        description="Step-by-step guides and walkthroughs from the Code for Change Nepal community."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Creative", path: "/creative" },
          { name: "Walkthrough", path: "/creative/walkthrough" },
        ]}
      />
      <Banner />

      {/* Creative Tabs */}
      <div className="max-w-7xl mx-auto pt-16">
        <div className="flex flex-wrap justify-center gap-4">
          {creativeItems.map((item) => {
            const isActive =
              item.path === "/creative"
                ? currentPath === "/creative"
                : currentPath.startsWith(item.path);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`px-6 py-2 rounded-full font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-secondary text-white shadow-lg shadow-secondary/25 scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-5 pt-10">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <DebouncedSearchInput
              placeholder="Search walkthroughs..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-full outline-none text-slate-700 font-medium focus:ring-4 focus:ring-secondary/10 focus:border-secondary/30 transition-all text-sm"
              value={searchTerm}
              onSearch={setSearchTerm}
            />
          </div>
          <select
            className="w-full md:w-48 px-4 py-3 bg-white border border-slate-200 rounded-full outline-none text-slate-700 font-semibold text-sm cursor-pointer focus:ring-4 focus:ring-secondary/10 focus:border-secondary/30 transition-all"
            value={filterProvince}
            onChange={(e) => setFilterProvince(e.target.value)}
          >
            <option value="">All Provinces</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Walkthrough Cards Grid */}
      <div className="max-w-7xl mx-auto px-5 py-16">
        {loading && walkthroughs.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-56 bg-slate-200"></div>
                <div className="p-6">
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : walkthroughs.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Walkthroughs Found</h3>
            <p className="text-slate-400">Check back later for new guides.</p>
          </div>
        ) : (
          <>
            <SlideUp className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Walkthroughs & Guides
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Detailed step-by-step guides created by our community members across Nepal.
              </p>
            </SlideUp>

            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {walkthroughs.map((wt) => {
                const id = wt._id || wt.id;
                const slug = wt.slug || wt.title?.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") || "untitled";
                const date = wt.publishedAt
                  ? new Date(wt.publishedAt).toLocaleDateString()
                  : new Date(wt.createdAt).toLocaleDateString();

                return (
                  <StaggerItem key={id} className="h-full">
                    <article
                      onClick={() => navigate(`/creative/walkthrough/${id}-${slug}`)}
                      className="h-full group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden">
                        <img
                          src={wt.image}
                          alt={wt.title}
                          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {wt.province && (
                          <div className="absolute z-10 top-4 right-4">
                            <span className="bg-white/70 border-2 border-white backdrop-blur-sm shadow-md text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                              {wt.province}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 h-full w-full bg-primary/20"></div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col grow p-6">
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {date}
                          </span>
                          <span>{wt.readTime || "5 min read"}</span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                          {wt.title}
                        </h3>

                        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                          {wt.description}
                        </p>

                        {/* CTA */}
                        <div className="mt-auto pt-6 border-t border-slate-50">
                          <Link
                            to={`/creative/walkthrough/${id}-${slug}`}
                            className="inline-flex items-center text-sm font-bold text-slate-900 group/link"
                          >
                            <span className="relative">
                              Read Walkthrough
                              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover/link:w-full" />
                            </span>
                            <svg
                              className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/link:translate-x-2 text-secondary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </article>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-4 bg-secondary cursor-pointer rounded-full text-white hover:bg-secondary/90 hover:scale-105 transition-all font-bold shadow-lg shadow-secondary/20"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default WalkthroughList;
