import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaYoutube } from "react-icons/fa";
import useFetch from "../Hooks/useFetch";
import SEO from "../Components/Common/SEO";
import Breadcrumbs from "../Components/UI/Breadcrumbs";

function BlogDetail() {
  const { slug: urlSlug } = useParams();
  const [idStr, ...slugParts] = urlSlug.split("-");

  const { data: apiBlog, loading } = useFetch(`/blogs/${idStr}`);
  const { data: allBlogs } = useFetch("/blogs"); // Fetch all for navigation
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    if (apiBlog) {
      // Map backend to frontend
      setBlog({
        ...apiBlog,
        coverImage: apiBlog.image,
        date: apiBlog.publishedAt || apiBlog.createdAt,
        readTime: apiBlog.readTime || "5 min read",
        tags: apiBlog.tags || []
      });
    }
  }, [apiBlog]);

  if (loading) return <div className="py-20 text-center text-2xl font-bold text-gray-400">Loading article...</div>;

  if (!blog)
    return (
      <div className="py-20 text-center text-2xl font-bold text-gray-400">
        Article not found.
      </div>
    );

  // Find "Next Post" for the bottom navigation
  const blogList = allBlogs || [];
  const currentIndex = blogList.findIndex((b) => (b._id || b.id) === (blog._id || blog.id));
  const nextBlog = blogList[currentIndex + 1] || blogList[0];
  const prevBlog = blogList[currentIndex - 1] || blogList[blogList.length - 1];

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Articles", path: "/blog" },
    { name: blog.title, path: `/blog/${blog.slug}` }
  ];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "image": [blog.coverImage],
    "datePublished": blog.date,
    "author": [{
      "@type": "Person",
      "name": blog.authorDetails?.name || blog.author,
      "url": window.location.origin
    }]
  };

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title={blog.title}
        description={blog.content?.replace(/<[^>]*>/g, '').substring(0, 160)}
        image={blog.coverImage}
        type="article"
        breadcrumbs={breadcrumbs}
        jsonLd={articleJsonLd}
      />
      {/* Hero Header */}
      <header className="relative pt-28 pb-16 bg-white border-b border-slate-100 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-5xl mx-auto px-2 relative">
          <Link
            to="/blog"
            className="inline-flex items-center text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 mb-8 px-4 py-2 bg-blue-50 rounded-full transition-all hover:gap-3 group"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.5"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Articles
          </Link>

          <div className="flex flex-wrap gap-2 mb-8">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] uppercase tracking-[0.2em] font-black px-4 py-1.5 bg-slate-900 text-white rounded-full"
              >
                {tag}
              </span>
            ))}
            <span className="text-[9px] uppercase tracking-[0.2em] font-black px-4 py-1.5 bg-blue-600 text-white rounded-full">
              {blog.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-10 tracking-tight">
            {blog.title}
          </h1>

          <div className="flex items-center gap-6 p-1 pr-8 w-fit bg-slate-50/50 rounded-full border border-slate-100/50 backdrop-blur-sm">
            {blog.authorDetails?.image ? (
              <img src={blog.authorDetails.image} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xl" alt={blog.authorDetails.name} />
            ) : (
              <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-xl border-2 border-white">
                {blog.authorDetails?.name?.[0] || blog.author?.[0]}
              </div>
            )}
            <div>
              <p className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1">
                {blog.authorDetails?.name || blog.author}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {blog.authorDetails?.role || "Publisher"} • {new Date(blog.date).toDateString()}
              </p>
            </div>
          </div>
        </div>
      </header>
      {/* <div className="max-w-5xl mx-auto px-4 mt-8">
        <Breadcrumbs crumbs={[
          { name: "Articles", path: "/blog" },
          { name: blog.title, path: `/blog/${blog.slug}` }
        ]} />
      </div> */}

      {/* 3. Main Content Layout */}
      <main className="max-w-7xl mx-auto px-5 py-20 grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Floating/Sticky Share Bar */}
        <aside className="lg:col-span-1">
          <div
            className="
               hidden lg:flex gap-4 items-center lg:sticky lg:top-32 lg:flex-col
            "
          >
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] vertical-rl mb-6">
              Share Article
            </p>

            {[
              { icon: <FaFacebookF />, hover: "hover:bg-[#1877F2]", color: "text-[#1877F2]" },
              { icon: <FaLinkedinIn />, hover: "hover:bg-[#0A66C2]", color: "text-[#0A66C2]" },
              { icon: <FaTwitter />, hover: "hover:bg-black", color: "text-black" },
            ].map((social, idx) => (
              <button
                key={idx}
                className={`w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center bg-white shadow-sm hover:text-white transition-all duration-500 hover:-translate-y-1 ${social.hover}`}
              >
                <span className="text-lg">{social.icon}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Article Body */}
        <article className="lg:col-span-8">
          {/* 1. Immersive Media Section */}
          <div className="relative mb-20">
            <div className="absolute -inset-4 bg-blue-100 rounded-[3rem] blur-2xl opacity-30 -z-10"></div>
            <figure className="relative">
              <div className="overflow-hidden rounded-[2.5rem] shadow-2xl bg-slate-100 border border-slate-100">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-auto object-cover"
                />
              </div>
              <figcaption className="mt-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black">
                <span className="w-12 h-px bg-slate-200"></span>
                Captured by {blog.authorDetails?.name || blog.author}
              </figcaption>
            </figure>
          </div>

          <div className="relative">
            <div
              className="prose prose-slate max-w-none
                prose-first-letter:text-6xl prose-first-letter:font-black 
                prose-first-letter:text-blue-600 prose-first-letter:mr-4 
                prose-first-letter:float-left prose-first-letter:leading-[0.7]
                
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-8 text-base md:text-lg
                
                prose-blockquote:italic prose-blockquote:font-bold 
                prose-blockquote:text-xl prose-blockquote:text-slate-700 
                prose-blockquote:border-l-4 prose-blockquote:border-blue-600
                prose-blockquote:bg-slate-50 prose-blockquote:p-8 prose-blockquote:rounded-2xl
                
                prose-img:rounded-3xl prose-img:shadow-lg
                
                prose-strong:text-slate-950 prose-strong:font-black"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Simple Brand Author Card */}
            <div className="mt-20 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center gap-8 group">
              <div className="relative shrink-0">
                {blog.authorDetails?.image ? (
                  <img src={blog.authorDetails.image} className="w-20 h-20 rounded-2xl object-cover transition-all duration-500" alt={blog.authorDetails?.name || "Author"} />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl font-black">
                    {blog.authorDetails?.name?.[0] || blog.author?.[0]}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <div>
                    <h4 className="text-xl font-black text-slate-900">
                      {blog.authorDetails?.name || blog.author}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {blog.authorDetails?.role || "Article Contributor"}
                    </p>
                  </div>

                  {/* Minimal Social Links */}
                  <div className="flex justify-center md:justify-end gap-3">
                    {[
                      { id: 'linkedin', icon: <FaLinkedinIn size={12} />, color: 'hover:text-[#0A66C2]' },
                      { id: 'facebook', icon: <FaFacebookF size={12} />, color: 'hover:text-[#1877F2]' },
                      { id: 'instagram', icon: <FaInstagram size={12} />, color: 'hover:text-[#ee2a7b]' },
                      { id: 'youtube', icon: <FaYoutube size={12} />, color: 'hover:text-[#FF0000]' },
                    ].map((social) => (
                      blog.authorDetails?.[social.id] && (
                        <a
                          key={social.id}
                          href={blog.authorDetails[social.id].startsWith('http') ? blog.authorDetails[social.id] : `https://${blog.authorDetails[social.id]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg transition-all ${social.color} hover:bg-white hover:shadow-sm`}
                        >
                          {social.icon}
                        </a>
                      )
                    ))}
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed max-w-2xl font-medium line-clamp-2">
                  {blog.authorDetails?.bio || `A dedicated ${blog.authorDetails?.role || 'contributor'} exploring ${blog.category} through professional insights and storytelling.`}
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Right Sidebar (Newsletter or Related) */}
        <aside className="lg:col-span-3">
          <div className="sticky top-32 p-6 bg-gray-50 rounded-lg border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2">Subscribe to News</h4>
            <p className="text-sm text-gray-500 mb-4">
              Get the latest {blog.tags[0]} updates delivered to your inbox.
            </p>
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full px-4 py-3 rounded-full border border-gray-200 mb-3 text-sm focus:outline-none focus:ring focus:ring-primary"
            />
            <button className="w-full py-3 bg-primary text-white rounded-full text-sm font-bold hover:bg-transparent hover:text-primary border cursor-pointer transition-colors">
              Join Now
            </button>
          </div>
        </aside>

        {/* Share in medium device */}
        <aside className="p-6 bg-gray-50 rounded-lg border border-gray-100 lg:hidden">
          <p className="text-base font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
            Share
          </p>
          <div
            className="
               flex flex-row lg:hidden items-center gap-2 p-2 bg-white/80 backdrop-blur-md rounded-full border border-gray-100
            "
          >
            {[
              {
                icon: <FaFacebookF />,
                color: "bg-blue-600 text-white",
                label: "Facebook",
              },
              {
                icon: <FaLinkedinIn />,
                color: "bg-[#0177b5] text-white",
                label: "LinkedIn",
              },
              {
                icon: <FaTwitter />,
                color: "bg-black text-white",
                label: "Twitter",
              },
              {
                icon: <FaInstagram />,
                color:
                  "bg-linear-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white",
                label: "Instagram",
              },
            ].map((social, idx) => (
              <button
                key={idx}
                aria-label={`Share on ${social.label}`}
                className={`w-12 h-12 lg:w-11 lg:h-11 cursor-pointer rounded-full border border-gray-100 lg:border-gray-200 flex items-center justify-center duration-300 ${social.color}`}
              >
                <span className="text-lg lg:text-base">{social.icon}</span>
              </button>
            ))}
          </div>
        </aside>
      </main>

      {/* 4. Next Post Navigation */}
      <section className="mt-20 border-t border-gray-100">
        <div className="grid md:grid-cols-2">
          {/* Previous Post */}
          <Link
            to={prevBlog ? `/blog/${prevBlog.slug}` : "#"}
            className={`group relative p-10 md:p-16 flex flex-col items-start justify-center transition-all duration-500 overflow-hidden border-b md:border-b-0 md:border-r border-gray-100 ${!prevBlog ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
              }`}
          >
            {prevBlog && (
              <>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-4 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 transition-transform group-hover:-translate-x-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16l-4-4m0 0l4-4m-4 4h18"
                    />
                  </svg>
                  Previous
                </span>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {prevBlog.title}
                </h4>
                {/* Subtle Background Number */}
                <span className="absolute -bottom-4 -left-4 text-9xl font-black text-gray-100/50 select-none group-hover:text-blue-100/30 transition-colors">
                  PREV
                </span>
              </>
            )}
          </Link>

          {/* Next Post */}
          <Link
            to={nextBlog ? `/blog/${nextBlog.slug}` : "#"}
            className={`group relative p-10 md:p-16 flex flex-col items-end text-right justify-center transition-all duration-500 overflow-hidden ${!nextBlog
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-950 hover:text-white"
              }`}
          >
            {nextBlog && (
              <>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500 mb-4 flex items-center gap-2">
                  Next
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
                <h4 className="text-xl md:text-2xl font-bold transition-colors">
                  {nextBlog.title}
                </h4>
                {/* Subtle Background Number */}
                <span className="absolute -bottom-4 -right-4 text-9xl font-black text-gray-100/50 select-none group-hover:text-white/5 transition-colors">
                  NEXT
                </span>
              </>
            )}
          </Link>
        </div>

        {/* Final "Back to List" link */}
        <div className="py-12 flex justify-center bg-gray-50">
          <Link
            to="/blog"
            className="px-8 py-3 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-white hover:shadow-md transition-all uppercase tracking-widest"
          >
            Back to all articles
          </Link>
        </div>
      </section>
    </div>
  );
}

export default BlogDetail;
