import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../../Services/api";
import { BlogCardListSkeleton } from "../../Loading/Skeleton";
import {
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "../../Common/Animations";

export function BlogCard() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const navigate = useNavigate()

  const fetchBlogs = async (currentPage = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("limit", "6");
      params.append("page", String(currentPage));
      params.append("isPublished", "true");

      const { data } = await API.get(`/blogs?${params.toString()}`);
      const newBlogs = data.data?.blogs || [];
      const pagination = data.pagination || data.data?.pagination || null;

      if (currentPage === 1) {
        setBlogs(newBlogs);
      } else {
        setBlogs((prev) => [...prev, ...newBlogs]);
      }

      if (pagination && pagination.page < pagination.totalPages) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(1);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBlogs(nextPage);
  };

  const displayBlogs = blogs || [];

  if (loading && displayBlogs.length === 0)
    return (
      <section className="max-w-7xl mx-auto px-5">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Articles
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Explore our latest insights on React, JavaScript, and modern web
            development.
          </p>
        </div>
        <BlogCardListSkeleton count={3} />
      </section>
    );

  return (
    <section className="max-w-7xl mx-auto px-5">
      {/* Optional: Section Header */}
      <SlideUp className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Latest Articles
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Explore our latest insights on React, JavaScript, and modern web
          development.
        </p>
      </SlideUp>

      <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayBlogs.map((blog) => {
          // Mapper for backend to frontend fields
          const id = blog._id || blog.id || Math.random().toString();
          const slug =
            blog.slug ||
            (blog.title
              ? blog.title
                  .toLowerCase()
                  .replace(/ /g, "-")
                  .replace(/[^\w-]+/g, "")
              : "untitled");
          const coverImage = blog.image || blog.coverImage || "";
          const date = blog.publishedAt
            ? new Date(blog.publishedAt).toLocaleDateString()
            : blog.date || "";

          return (
            <StaggerItem key={id} className="h-full">
              <article
                onClick={() => navigate(`/creative/${id}-${slug}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/creative/${id}-${slug}`)}
                tabIndex={0}
                role="button"
                aria-label={`Read blog: ${blog.title}, published ${date}`}
                className="h-full group flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden">
                  <img
                    src={coverImage}
                    alt={`Cover image for ${blog.title}`}
                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Tag Overlay */}
                  <div className="absolute z-10 top-4 right-4 flex gap-2">
                    {(blog.tags || []).slice(0, 1).map((tag) => (
                      <span
                        key={tag}
                        className="bg-white/70 border-2 border-white backdrop-blur-sm shadow-md text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="absolute inset-0 h-full w-full bg-primary/20"></div>
                </div>

                {/* Content Container */}
                <div className="flex flex-col grow p-6">
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {date}
                    </span>
                    <span>{blog.readTime || "5 min read"}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-secondary transition-colors">
                    {blog.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                    {blog.excerpt}
                  </p>

                  {/* CTA Button */}
                  <div className="mt-auto pt-6 border-t border-slate-50">
                    <Link
                      to={`/creative/${id}-${slug}`}
                      className="inline-flex items-center text-sm font-bold text-slate-900 group/link"
                    >
                      <span className="relative">
                        Read Article
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover/link:w-full" />
                      </span>
                      <svg
                        className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/link:translate-x-2 text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
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
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </section>
  );
}
