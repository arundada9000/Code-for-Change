import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";
import DOMPurify from "dompurify";
import useFetch from "../Hooks/useFetch";
import SEO from "../Components/Common/SEO";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import { ArticleDetailSkeleton } from "../Components/Loading/Skeleton";
import { FadeIn, SlideUp } from "../Components/Common/Animations";
import API from "../Services/api";
import { FaChevronLeft } from "react-icons/fa";

function BlogDetail() {
  const { slug: urlSlug = "" } = useParams();
  const [idStr, ...slugParts] = urlSlug.split("-");

  const { data: apiBlog, loading } = useFetch(`/blogs/${idStr}`);
  const { data: allBlogs } = useFetch("/blogs"); // Fetch all for navigation
  const [blog, setBlog] = useState(null);

  // Newsletter sidebar state
  const [nlEmail, setNlEmail] = useState("");
  const [nlStatus, setNlStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [nlMessage, setNlMessage] = useState("");

  const handleNewsletterSubscribe = async () => {
    const trimmed = nlEmail.trim();
    if (!trimmed) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setNlStatus("error");
      setNlMessage("Please enter a valid email address.");
      return;
    }
    setNlStatus("loading");
    try {
      const res = await API.post("/newsletter/subscribe", { email: trimmed });
      setNlStatus("success");
      setNlMessage(res.data?.message || "You're subscribed!");
      setNlEmail("");
    } catch (err) {
      setNlStatus("error");
      setNlMessage(
        err.response?.data?.message || "Subscription failed. Try again.",
      );
    }
  };

  useEffect(() => {
    if (apiBlog) {
      // Map backend to frontend, handling possible nested { blog: {...} } structure
      const actualBlog = apiBlog.blog || apiBlog;
      setBlog({
        ...actualBlog,
        coverImage: actualBlog.image || actualBlog.coverImage || "",
        date: actualBlog.publishedAt || actualBlog.createdAt || new Date(),
        readTime: actualBlog.readTime || "5 min read",
        tags: actualBlog.tags || [],
      });
    }
  }, [apiBlog]);

  if (loading) return <ArticleDetailSkeleton />;

  if (!blog)
    return (
      <div className="py-20 text-center text-2xl font-bold text-gray-400">
        Article not found.
      </div>
    );

  // Find "Next Post" for the bottom navigation
  const blogList = Array.isArray(allBlogs) ? allBlogs : allBlogs?.blogs || [];
  const currentIndex = blogList.findIndex(
    (b) => (b._id || b.id) === (blog._id || blog.id),
  );
  const nextBlog = blogList[currentIndex + 1] || blogList[0] || null;
  const prevBlog =
    blogList[currentIndex - 1] || blogList[blogList.length - 1] || null;

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Articles", path: "/blog" },
    { name: blog.title, path: `/blog/${blog.slug}` },
  ];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    image: [blog.coverImage],
    datePublished: blog.date,
    author: [
      {
        "@type": "Person",
        name: blog.authorDetails?.name || blog.author,
        url: window.location.origin,
      },
    ],
  };

  // Share handler — opens native share dialogs
  const shareArticle = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(blog.title);
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    };
    if (links[platform]) {
      window.open(
        links[platform],
        "_blank",
        "noopener,noreferrer,width=620,height=450",
      );
    } else {
      // Fallback: copy URL to clipboard (e.g. Instagram)
      navigator.clipboard?.writeText(window.location.href).catch(() => {});
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title={blog.title || "Blog Single"}
        description={(blog.content || "")
          .replace(/<[^>]*>/g, "")
          .substring(0, 160)}
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

        <FadeIn className="max-w-5xl mx-auto px-2 relative">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-secondary mb-8 px-4 py-2 bg-secondary/15 rounded-full transition-all ease-in duration-200 hover:gap-3 group"
          >
            <FaChevronLeft className="text-[18px]" />
            Back to Articles
          </Link>

          <div className="flex flex-wrap gap-2 mb-8">
            {(blog.tags || []).map((tag) => (
              <span
                key={tag}
                className="text-[9px] uppercase tracking-[0.2em] font-black px-4 py-1.5 bg-slate-900 text-white rounded-full"
              >
                {tag}
              </span>
            ))}
            {blog.category && (
              <span className="text-[9px] uppercase tracking-[0.2em] font-black px-4 py-1.5 bg-secondary text-white rounded-full">
                {blog.category}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-10 tracking-tight">
            {blog.title || "Untitled Article"}
          </h1>

          <div className="flex items-center gap-6 p-1 pr-8 w-fit bg-slate-50/50 rounded-full border border-slate-100/50 backdrop-blur-sm">
            {blog.authorDetails?.image ? (
              <img
                src={blog.authorDetails.image}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xl"
                alt={blog.authorDetails.name}
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-linear-to-br from-secondary to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-xl border-2 border-white">
                {blog.authorDetails?.name?.[0] || blog.author?.[0]}
              </div>
            )}
            <div>
              <p className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1">
                {blog.authorDetails?.name || blog.author}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {blog.authorDetails?.role || "Publisher"} •{" "}
                {new Date(blog.date).toDateString()}
              </p>
            </div>
          </div>
        </FadeIn>
      </header>
      {/* <div className="max-w-5xl mx-auto px-4 mt-8">
        <Breadcrumbs crumbs={[
          { name: "Articles", path: "/blog" },
          { name: blog.title, path: `/blog/${blog.slug}` }
        ]} />
      </div> */}

      {/* 3. Main Content Layout */}
      <main className="max-w-7xl mx-auto px-5 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Floating/Sticky Share Bar */}
        <SlideUp delay={0.1} className="lg:col-span-1">
          <div
            className="
               hidden lg:flex gap-4 items-center lg:sticky lg:top-32 lg:flex-col
            "
          >
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] vertical-rl mb-6">
              Share Article
            </p>

            {[
              {
                icon: <FaFacebookF />,
                hover: "hover:bg-[#1877F2]",
                color: "text-[#1877F2]",
                platform: "facebook",
              },
              {
                icon: <FaLinkedinIn />,
                hover: "hover:bg-[#0A66C2]",
                color: "text-[#0A66C2]",
                platform: "linkedin",
              },
              {
                icon: <FaTwitter />,
                hover: "hover:bg-black",
                color: "text-black",
                platform: "twitter",
              },
            ].map((social, idx) => (
              <button
                key={idx}
                onClick={() => shareArticle(social.platform)}
                title={`Share on ${social.platform}`}
                className={`w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center bg-white shadow-sm hover:text-white transition-all duration-500 hover:-translate-y-1 ${social.hover}`}
              >
                <span className="text-lg">{social.icon}</span>
              </button>
            ))}
          </div>
        </SlideUp>

        {/* Article Body */}
        <SlideUp delay={0.2} className="lg:col-span-8">
          {/* 1. Immersive Media Section */}
          <div className="relative mb-8">
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
              className="prose prose-lg prose-slate max-w-none
                prose-first-letter:text-6xl prose-first-letter:font-black 
                prose-first-letter:text-secondary prose-first-letter:mr-4 
                prose-first-letter:float-left prose-first-letter:leading-[0.7]
                
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4
                
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-5
                
                prose-blockquote:italic prose-blockquote:font-bold 
                prose-blockquote:text-xl prose-blockquote:text-slate-700 
                prose-blockquote:border-l-4 prose-blockquote:border-secondary
                prose-blockquote:bg-slate-50 prose-blockquote:p-6 prose-blockquote:rounded-2xl
                
                prose-img:rounded-3xl prose-img:shadow-lg
                
                prose-strong:text-slate-950 prose-strong:font-black"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(blog.content || ""),
              }}
            />

            {/* Simple Brand Author Card */}
            <div className="mt-10 p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center gap-6 group">
              <div className="relative shrink-0">
                {blog.authorDetails?.image ? (
                  <img
                    src={blog.authorDetails.image}
                    className="w-20 h-20 rounded-2xl object-cover transition-all duration-500"
                    alt={blog.authorDetails?.name || "Author"}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl font-black">
                    {blog.authorDetails?.name?.[0] || blog.author?.[0]}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                  <div>
                    <h4 className="text-xl font-black text-slate-900">
                      {blog.authorDetails?.name || blog.author}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {blog.authorDetails?.role || "Article Contributor"}
                    </p>
                  </div>

                  {/* Minimal Social Links — includes TikTok */}
                  <div className="flex flex-wrap justify-center md:justify-end gap-2">
                    {[
                      {
                        id: "linkedin",
                        icon: <FaLinkedinIn size={13} />,
                        color: "hover:text-[#0A66C2]",
                      },
                      {
                        id: "facebook",
                        icon: <FaFacebookF size={13} />,
                        color: "hover:text-[#1877F2]",
                      },
                      {
                        id: "instagram",
                        icon: <FaInstagram size={13} />,
                        color: "hover:text-[#ee2a7b]",
                      },
                      {
                        id: "youtube",
                        icon: <FaYoutube size={13} />,
                        color: "hover:text-[#FF0000]",
                      },
                      {
                        id: "tiktok",
                        icon: <FaTiktok size={13} />,
                        color: "hover:text-black",
                      },
                    ].map(
                      (social) =>
                        blog.authorDetails?.[social.id] && (
                          <a
                            key={social.id}
                            href={
                              blog.authorDetails[social.id].startsWith("http")
                                ? blog.authorDetails[social.id]
                                : `https://${blog.authorDetails[social.id]}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            title={social.id}
                            className={`w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg transition-all ${social.color} hover:bg-white hover:shadow-sm`}
                          >
                            {social.icon}
                          </a>
                        ),
                    )}
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {blog.authorDetails?.bio ||
                    `A dedicated ${blog.authorDetails?.role || "contributor"} exploring ${blog.category} through professional insights and storytelling.`}
                </p>
              </div>
            </div>
          </div>
        </SlideUp>

        {/* Right Sidebar (Newsletter or Related) */}
        <SlideUp delay={0.3} className="lg:col-span-3">
          <div className="sticky top-32 p-6 bg-gray-50 rounded-lg border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2">Subscribe to News</h4>
            <p className="text-sm text-gray-500 mb-4">
              Get the latest updates delivered to your inbox.
            </p>
            {nlStatus === "success" ? (
              <div className="text-center py-4">
                <p className="text-green-600 font-bold text-sm">{nlMessage}</p>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  value={nlEmail}
                  onChange={(e) => {
                    setNlEmail(e.target.value);
                    setNlStatus(null);
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleNewsletterSubscribe()
                  }
                  disabled={nlStatus === "loading"}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-full border border-gray-200 mb-2 text-sm focus:outline-none focus:ring focus:ring-primary disabled:opacity-60"
                />
                {nlStatus === "error" && (
                  <p className="text-red-500 text-xs mb-2 px-1">{nlMessage}</p>
                )}
                <button
                  onClick={handleNewsletterSubscribe}
                  disabled={nlStatus === "loading"}
                  className="w-full py-3 bg-primary text-white rounded-full text-sm font-bold hover:bg-transparent hover:text-primary border cursor-pointer transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {nlStatus === "loading" ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    "Join Now"
                  )}
                </button>
              </>
            )}
          </div>
        </SlideUp>

        {/* Share in medium device */}
        <SlideUp
          delay={0.1}
          className="p-6 bg-gray-50 rounded-lg border border-gray-100 lg:hidden"
        >
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
                color: "bg-secondary text-white",
                label: "Facebook",
                platform: "facebook",
              },
              {
                icon: <FaLinkedinIn />,
                color: "bg-[#0177b5] text-white",
                label: "LinkedIn",
                platform: "linkedin",
              },
              {
                icon: <FaTwitter />,
                color: "bg-black text-white",
                label: "Twitter",
                platform: "twitter",
              },
              {
                icon: <FaInstagram />,
                color:
                  "bg-linear-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white",
                label: "Instagram (copy link)",
                platform: "instagram",
              },
            ].map((social, idx) => (
              <button
                key={idx}
                onClick={() => shareArticle(social.platform)}
                aria-label={`Share on ${social.label}`}
                className={`w-12 h-12 lg:w-11 lg:h-11 cursor-pointer rounded-full border border-gray-100 lg:border-gray-200 flex items-center justify-center duration-300 ${social.color}`}
              >
                <span className="text-lg lg:text-base">{social.icon}</span>
              </button>
            ))}
          </div>
        </SlideUp>
      </main>

      {/* 4. Next Post Navigation */}
      <section className="mt-20 border-t border-gray-100">
        <div className="grid md:grid-cols-2">
          {/* Previous Post */}
          <Link
            to={prevBlog ? `/blog/${prevBlog.slug}` : "#"}
            className={`group relative p-10 md:p-16 flex flex-col items-start justify-center transition-all duration-500 overflow-hidden border-b md:border-b-0 md:border-r border-gray-100 ${
              !prevBlog ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
          >
            {prevBlog && (
              <>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-4 flex items-center gap-2">
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
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-secondary transition-colors">
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
            className={`group relative p-10 md:p-16 flex flex-col items-end text-right justify-center transition-all duration-500 overflow-hidden ${
              !nextBlog
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-950 hover:text-white"
            }`}
          >
            {nextBlog && (
              <>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-4 flex items-center gap-2">
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
            className="px-8 py-3 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-secondary hover:text-white hover:-translate-y-0.5 duration-200 hover:shadow-md transition-all uppercase tracking-widest"
          >
            Back to all articles
          </Link>
        </div>
      </section>
    </div>
  );
}

export default BlogDetail;
