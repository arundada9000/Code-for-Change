import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaFileDownload, FaFilePdf, FaFileWord, FaFile } from "react-icons/fa";
import Banner from "../Components/UI/Banner";
import SEO from "../Components/Common/SEO";
import API from "../Services/api";
import DebouncedSearchInput from "../Components/UI/DebouncedSearchInput";
import { SlideUp, StaggerContainer, StaggerItem } from "../Components/Common/Animations";

const PROVINCES = [
  "Kathmandu","Pokhara","Rupandehi","Dang","Birgunj","Farwest","Koshi","Chitwan","LB Karnali",
];

function getFileIcon(url) {
  if (!url) return <FaFile />;
  const ext = url.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FaFilePdf className="text-rose-500" />;
  if (["doc", "docx"].includes(ext)) return <FaFileWord className="text-blue-500" />;
  return <FaFile className="text-slate-400" />;
}

function getFileName(url) {
  if (!url) return "File";
  const parts = url.split("/");
  return parts[parts.length - 1]?.split("?")[0] || "File";
}

function Periodicals() {
  const navigate = useNavigate();
  const location = useLocation();
  const [periodicals, setPeriodicals] = useState([]);
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

  const fetchPeriodicals = async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("limit", "9");
      params.append("page", String(currentPage));
      params.append("isPublished", "true");
      if (searchTerm) params.append("search", searchTerm);
      if (filterProvince) params.append("province", filterProvince);

      const { data } = await API.get(`/periodicals?${params.toString()}`);
      const items = data.data?.periodicals || [];
      const pagination = data.data?.pagination || null;

      if (currentPage === 1) {
        setPeriodicals(items);
      } else {
        setPeriodicals((prev) => [...prev, ...items]);
      }

      setHasMore(pagination && pagination.page < pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch periodicals", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchPeriodicals(1);
  }, [searchTerm, filterProvince]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPeriodicals(nextPage);
  };

  return (
    <div>
      <SEO
        title="Periodicals - Code for Change"
        description="Browse periodicals, reports, and publications from Code for Change Nepal community."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Creative", path: "/creative" },
          { name: "Periodicals", path: "/creative/periodicals" },
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
              placeholder="Search periodicals..."
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

      {/* Periodicals Grid */}
      <div className="max-w-7xl mx-auto px-5 py-16">
        {loading && periodicals.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-2/3 mb-6"></div>
                <div className="h-10 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : periodicals.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Periodicals Found</h3>
            <p className="text-slate-400">Check back later for new publications.</p>
          </div>
        ) : (
          <>
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {periodicals.map((item) => (
                <StaggerItem key={item._id} className="h-full">
                  <article className="h-full flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                    {/* Header */}
                    <div className="p-6 pb-0 flex-1">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-secondary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        {item.province && (
                          <span className="shrink-0 text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                            {item.province}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                        {item.description}
                      </p>
                      {item.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Files Section */}
                    <div className="p-6 pt-2 border-t border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        {item.files?.length || 0} Attachment{item.files?.length !== 1 ? "s" : ""}
                      </p>
                      <div className="space-y-2">
                        {(item.files || []).slice(0, 3).map((fileUrl, idx) => (
                          <a
                            key={idx}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg hover:bg-secondary/10 hover:text-secondary transition-all text-sm font-semibold text-slate-600 group/file"
                          >
                            <span className="text-lg">{getFileIcon(fileUrl)}</span>
                            <span className="truncate flex-1 text-xs">{getFileName(fileUrl)}</span>
                            <FaFileDownload className="text-slate-300 group-hover/file:text-secondary transition-colors" />
                          </a>
                        ))}
                        {(item.files || []).length > 3 && (
                          <p className="text-xs text-slate-400 font-semibold text-center pt-1">
                            + {item.files.length - 3} more files
                          </p>
                        )}
                      </div>
                      <div className="mt-3 text-[10px] text-slate-400 font-semibold">
                        {new Date(item.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              ))}
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

export default Periodicals;
