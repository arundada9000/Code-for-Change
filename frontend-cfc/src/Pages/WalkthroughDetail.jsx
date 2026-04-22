import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaChevronLeft, FaFileDownload, FaFilePdf, FaFileWord, FaFile } from "react-icons/fa";
import DOMPurify from "dompurify";
import useFetch from "../Hooks/useFetch";
import SEO from "../Components/Common/SEO";
import { ArticleDetailSkeleton } from "../Components/Loading/Skeleton";
import { FadeIn, SlideUp } from "../Components/Common/Animations";

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

function WalkthroughDetail() {
  const { slug: urlSlug = "" } = useParams();
  const [idStr] = urlSlug.split("-");
  const { data: apiData, loading } = useFetch(`/walkthroughs/${idStr}`);
  const [walkthrough, setWalkthrough] = useState(null);

  useEffect(() => {
    if (apiData) {
      const wt = apiData.walkthrough || apiData;
      setWalkthrough({
        ...wt,
        date: wt.publishedAt || wt.createdAt || new Date(),
        readTime: wt.readTime || "5 min read",
        tags: wt.tags || [],
      });
    }
  }, [apiData]);

  if (loading) return <ArticleDetailSkeleton />;

  if (!walkthrough)
    return (
      <div className="py-20 text-center text-2xl font-bold text-gray-400">
        Walkthrough not found.
      </div>
    );

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Walkthroughs", path: "/creative/walkthrough" },
    { name: walkthrough.title, path: "#" },
  ];

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title={walkthrough.title || "Walkthrough"}
        description={walkthrough.description || ""}
        image={walkthrough.image}
        type="article"
        breadcrumbs={breadcrumbs}
      />

      {/* Hero Header */}
      <header className="relative pt-28 pb-16 bg-white border-b border-slate-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

        <FadeIn className="max-w-5xl mx-auto px-5 relative">
          <Link
            to="/creative/walkthrough"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-secondary mb-8 px-4 py-2 bg-secondary/15 rounded-full transition-all ease-in duration-200 hover:gap-3 group"
          >
            <FaChevronLeft className="text-[18px]" />
            Back to Walkthroughs
          </Link>

          <div className="flex flex-wrap gap-2 mb-8">
            {(walkthrough.tags || []).map((tag) => (
              <span
                key={tag}
                className="text-[9px] uppercase tracking-[0.2em] font-black px-4 py-1.5 bg-slate-900 text-white rounded-full"
              >
                {tag}
              </span>
            ))}
            {walkthrough.province && (
              <span className="text-[9px] uppercase tracking-[0.2em] font-black px-4 py-1.5 bg-secondary text-white rounded-full">
                {walkthrough.province}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
            {walkthrough.title}
          </h1>

          <p className="text-lg text-slate-500 max-w-3xl mb-8 leading-relaxed">
            {walkthrough.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-slate-400 font-semibold">
            <span>{new Date(walkthrough.date).toDateString()}</span>
            <span className="text-slate-200">•</span>
            <span>{walkthrough.readTime}</span>
          </div>
        </FadeIn>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-5 py-12">
        {/* Cover Image */}
        <SlideUp className="relative mb-10">
          <div className="absolute -inset-4 bg-blue-100 rounded-[3rem] blur-2xl opacity-30 -z-10"></div>
          <figure className="relative">
            <div className="overflow-hidden rounded-[2.5rem] shadow-2xl bg-slate-100 border border-slate-100">
              <img
                src={walkthrough.image}
                alt={walkthrough.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </figure>
        </SlideUp>

        {/* Rich Text Content */}
        <SlideUp delay={0.1}>
          <div
            className="prose prose-lg prose-slate max-w-none
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
              __html: DOMPurify.sanitize(walkthrough.content || ""),
            }}
          />
        </SlideUp>

        {/* Attachments */}
        {walkthrough.files && walkthrough.files.length > 0 && (
          <SlideUp delay={0.2} className="mt-12">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-4">
                📎 Attachments ({walkthrough.files.length})
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {walkthrough.files.map((fileUrl, idx) => (
                  <a
                    key={idx}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-100 hover:border-secondary/30 hover:shadow-md transition-all text-sm font-semibold text-slate-600 group"
                  >
                    <span className="text-xl">{getFileIcon(fileUrl)}</span>
                    <span className="truncate flex-1">{getFileName(fileUrl)}</span>
                    <FaFileDownload className="text-slate-300 group-hover:text-secondary transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </SlideUp>
        )}
      </main>

      {/* Back to Walkthroughs */}
      <div className="py-12 flex justify-center bg-gray-50 border-t border-gray-100">
        <Link
          to="/creative/walkthrough"
          className="px-8 py-3 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-secondary hover:text-white hover:-translate-y-0.5 duration-200 hover:shadow-md transition-all uppercase tracking-widest"
        >
          Back to all walkthroughs
        </Link>
      </div>
    </div>
  );
}

export default WalkthroughDetail;
