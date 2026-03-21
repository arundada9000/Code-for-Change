import React from "react";

/* ============================================================
   CFC IT-THEMED SKELETON COMPONENTS
   Colors match CFC brand: primary #01152E, secondary #0076B4
   IT theme: terminal windows, code lines, data streams
   ============================================================ */

/* ------ Base pulse element with branded gradient ----------- */
export const Pulse = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded ${className}`}
    style={{
      background:
        "linear-gradient(90deg, #e8f0f7 25%, #d0e4f0 50%, #e8f0f7 75%)",
      backgroundSize: "200% 100%",
      animation: "cfcShimmer 1.6s ease-in-out infinite",
    }}
  />
);

/* ------ Global shimmer keyframe (injected once) ------------ */
const shimmerStyle = `
  @keyframes cfcShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes terminalBlink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
`;

const StyleInjector = () => (
  <style dangerouslySetInnerHTML={{ __html: shimmerStyle }} />
);

/* ------ Terminal window top bar dots ----------------------- */
const TerminalDots = () => (
  <div className="flex items-center gap-1.5 mb-4">
    <span className="w-3 h-3 rounded-full bg-red-400 opacity-80" />
    <span className="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
    <span className="w-3 h-3 rounded-full bg-green-400 opacity-80" />
    <span
      className="ml-auto text-[9px] font-mono text-blue-300/60 uppercase tracking-widest"
      style={{ animation: "terminalBlink 1.2s step-start infinite" }}
    >
      ▋
    </span>
  </div>
);

/* ------ Code line row (mimics lines of code loading) ------- */
const CodeLine = ({ width = "w-full", short = false }) => (
  <div className="flex items-center gap-2">
    <span className="text-blue-400/40 font-mono text-[10px] select-none w-4 shrink-0">
      {">"}
    </span>
    <Pulse className={`h-3 rounded-md ${short ? "w-2/3" : width}`} />
  </div>
);

/* ============================================================
   1. TerminalCardSkeleton
   Use for: Event cards, Blog cards, Impact cards, Internship cards
   ============================================================ */
export const TerminalCardSkeleton = ({ count = 3, cols = "md:grid-cols-3" }) => (
  <>
    <StyleInjector />
    <div className={`grid grid-cols-1 ${cols} gap-6 lg:gap-8`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          {/* Image placeholder */}
          <Pulse className="w-full h-48 rounded-none" />

          {/* Terminal-styled content area */}
          <div className="p-6 bg-[#01152E]/[0.02]">
            <TerminalDots />
            {/* Tag line */}
            <div className="flex gap-2 mb-4">
              <Pulse className="h-5 w-20 rounded-full" />
              <Pulse className="h-5 w-16 rounded-full" />
            </div>
            {/* Title lines */}
            <div className="space-y-2 mb-4">
              <CodeLine />
              <CodeLine width="w-4/5" />
            </div>
            {/* Meta info */}
            <div className="flex gap-4 mt-4">
              <Pulse className="h-3 w-20 rounded" />
              <Pulse className="h-3 w-16 rounded" />
            </div>
            {/* CTA */}
            <Pulse className="h-9 w-full rounded-xl mt-5" />
          </div>
        </div>
      ))}
    </div>
  </>
);

/* ============================================================
   2. InternshipCardSkeleton
   Use for: Internships page (wider 2-col cards)
   ============================================================ */
export const InternshipCardSkeleton = ({ count = 4 }) => (
  <>
    <StyleInjector />
    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl p-8 border border-[#0076B4]/10 shadow-sm"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {/* Top: logo + badges */}
          <div className="flex justify-between items-start mb-6">
            <Pulse className="w-16 h-16 rounded-2xl" />
            <div className="flex flex-col items-end gap-2">
              <Pulse className="h-6 w-20 rounded-full" />
              <Pulse className="h-5 w-24 rounded-full" />
            </div>
          </div>

          {/* Job title + company */}
          <div className="mb-6">
            <div className="space-y-2 mb-2">
              <CodeLine />
              <CodeLine width="w-1/2" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Pulse className="h-3 w-3 rounded-full" />
              <Pulse className="h-3 w-28 rounded" />
            </div>
          </div>

          {/* 2x2 data grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[0, 1].map((j) => (
              <div key={j} className="p-4 rounded-2xl bg-[#0076B4]/5">
                <Pulse className="h-2.5 w-14 rounded mb-2" />
                <Pulse className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>

          {/* Button */}
          <Pulse className="h-12 w-full rounded-full mt-2" />
        </div>
      ))}
    </div>
  </>
);

/* ============================================================
   3. GalleryMasonrySkeleton
   Use for: Gallery page masonry grid
   ============================================================ */
export const GalleryMasonrySkeleton = ({ count = 9 }) => {
  const heights = ["h-48", "h-64", "h-56", "h-72", "h-44", "h-60", "h-52", "h-68", "h-48"];
  return (
    <>
      <StyleInjector />
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 lg:px-10">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`break-inside-avoid rounded-3xl overflow-hidden border border-slate-100 shadow-sm ${heights[i % heights.length]}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <Pulse className="w-full h-full rounded-none" />
          </div>
        ))}
      </div>
    </>
  );
};

/* ============================================================
   4. ArticleDetailSkeleton
   Use for: BlogDetail, ImpactDetail pages (full article layout)
   ============================================================ */
export const ArticleDetailSkeleton = () => (
  <>
    <StyleInjector />
    <div className="bg-white min-h-screen">
      {/* Hero header */}
      <header className="pt-28 pb-16 border-b border-slate-100 px-6 max-w-5xl mx-auto">
        <Pulse className="h-8 w-24 rounded-full mb-8" />
        <div className="flex gap-2 mb-8">
          <Pulse className="h-6 w-16 rounded-full" />
          <Pulse className="h-6 w-20 rounded-full" />
        </div>
        {/* Big title lines */}
        <div className="space-y-3 mb-10">
          <Pulse className="h-10 w-full rounded-lg" />
          <Pulse className="h-10 w-5/6 rounded-lg" />
          <Pulse className="h-10 w-2/3 rounded-lg" />
        </div>
        {/* Author pill */}
        <div className="flex items-center gap-4 w-fit p-1 pr-8 bg-slate-50 rounded-full border border-slate-100">
          <Pulse className="w-14 h-14 rounded-full" />
          <div className="space-y-1.5">
            <Pulse className="h-4 w-28 rounded" />
            <Pulse className="h-3 w-36 rounded" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-5 py-20 grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Sidebar placeholder */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <Pulse key={i} className="w-12 h-12 rounded-2xl" />
            ))}
          </div>
        </aside>

        {/* Article body */}
        <article className="lg:col-span-8 space-y-6">
          {/* Cover image */}
          <Pulse className="w-full h-80 rounded-[2.5rem] mb-10" />

          {/* Terminal-styled content block */}
          <div className="bg-[#01152E]/[0.03] rounded-2xl p-6 border border-[#01152E]/5">
            <TerminalDots />
            <div className="space-y-3">
              {[
                "w-full", "w-full", "w-5/6", "w-full", "w-4/5",
                "w-full", "w-3/4", "w-full", "w-full", "w-2/3",
              ].map((w, i) => (
                <CodeLine key={i} width={w} />
              ))}
            </div>
          </div>

          {/* Second paragraph block */}
          <div className="space-y-3 mt-4">
            {["w-full", "w-full", "w-5/6", "w-4/5", "w-3/4"].map((w, i) => (
              <Pulse key={i} className={`h-4 ${w} rounded`} />
            ))}
          </div>
        </article>

        {/* Right sidebar */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-32 p-6 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
            <Pulse className="h-5 w-32 rounded" />
            <Pulse className="h-4 w-full rounded" />
            <Pulse className="h-4 w-4/5 rounded" />
            <Pulse className="h-10 w-full rounded-full mt-3" />
            <Pulse className="h-10 w-full rounded-full" />
          </div>
        </aside>
      </main>
    </div>
  </>
);

/* ============================================================
   5. ImpactCardSkeleton
   Use for: OurImpact page featured + history sections
   ============================================================ */
export const ImpactCardSkeleton = () => (
  <>
    <StyleInjector />
    <>
      {/* Featured section */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="mb-12">
          <Pulse className="h-10 w-64 rounded-lg mb-2" />
          <Pulse className="h-3 w-48 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-4xl overflow-hidden border border-slate-100 shadow-sm">
              <Pulse className="w-full aspect-video rounded-none" />
              <div className="p-8">
                <TerminalDots />
                <div className="space-y-2 mb-4">
                  <CodeLine />
                  <CodeLine width="w-4/5" />
                </div>
                <div className="flex gap-4 mb-4">
                  <Pulse className="h-3 w-20 rounded" />
                  <Pulse className="h-3 w-20 rounded" />
                </div>
                <Pulse className="h-4 w-full rounded mb-2" />
                <Pulse className="h-4 w-3/4 rounded mb-6" />
                <Pulse className="h-4 w-32 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* History section */}
      <section className="bg-white py-16 border-t border-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <Pulse className="h-10 w-48 rounded-lg mx-auto mb-2" />
            <Pulse className="h-3 w-56 rounded mx-auto" />
          </div>
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-8 rounded-4xl border border-slate-100">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 mb-2">
                    <Pulse className="w-2 h-2 rounded-full" />
                    <Pulse className="h-6 w-48 rounded" />
                  </div>
                  <Pulse className="h-4 w-full rounded" />
                  <div className="flex gap-3 mt-2">
                    <Pulse className="h-5 w-20 rounded-lg" />
                    <Pulse className="h-5 w-24 rounded-lg" />
                  </div>
                </div>
                <Pulse className="w-12 h-12 rounded-2xl ml-6 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  </>
);

/* ============================================================
   6. ProvinceDetailSkeleton
   Use for: ProvinceDetails page
   ============================================================ */
export const ProvinceDetailSkeleton = () => (
  <>
    <StyleInjector />
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <Pulse className="w-full h-96 rounded-none" />
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        {/* Section heading */}
        <div className="space-y-3">
          <Pulse className="h-10 w-64 rounded-lg" />
          <Pulse className="h-4 w-96 rounded" />
        </div>

        {/* Terminal data blocks – represents members/team */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-[#01152E]/[0.03] rounded-2xl p-5 border border-[#01152E]/5">
              <TerminalDots />
              <Pulse className="w-16 h-16 rounded-full mx-auto mb-4" />
              <Pulse className="h-5 w-24 rounded mx-auto mb-2" />
              <Pulse className="h-3 w-20 rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Event listing rows */}
        <div className="space-y-4">
          <Pulse className="h-8 w-48 rounded-lg mb-6" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 p-6 rounded-2xl border border-slate-100">
              <Pulse className="w-16 h-16 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <CodeLine />
                <CodeLine width="w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

/* ============================================================
   7. CertificateVerificationSkeleton
   Use for: CertificateVerification result area
   ============================================================ */
export const CertificateResultSkeleton = () => (
  <>
    <StyleInjector />
    <div className="mt-8 bg-[#01152E]/[0.03] rounded-3xl p-8 border border-[#0076B4]/10">
      <TerminalDots />
      <div className="space-y-4">
        <Pulse className="h-8 w-48 rounded-lg" />
        {[
          ["w-32", "w-48"],
          ["w-28", "w-36"],
          ["w-24", "w-40"],
          ["w-36", "w-52"],
        ].map(([label, val], i) => (
          <div key={i} className="flex gap-6 items-center">
            <Pulse className={`h-4 ${label} rounded`} />
            <Pulse className={`h-4 ${val} rounded`} />
          </div>
        ))}
      </div>
    </div>
  </>
);

/* ============================================================
   8. DonationVerificationSkeleton
   Use for: DonationSuccess page while verifying eSewa
   ============================================================ */
export const DonationVerificationSkeleton = () => (
  <>
    <StyleInjector />
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-10 border border-[#0076B4]/10 shadow-sm">
        <TerminalDots />
        <Pulse className="w-20 h-20 rounded-full mx-auto mb-6" />
        <Pulse className="h-8 w-48 rounded-lg mx-auto mb-4" />
        <Pulse className="h-4 w-full rounded mb-2" />
        <Pulse className="h-4 w-3/4 rounded mx-auto mb-8" />
        <div className="space-y-3">
          {[["w-28", "w-36"], ["w-24", "w-40"], ["w-32", "w-28"]].map(
            ([l, v], i) => (
              <div key={i} className="flex justify-between">
                <Pulse className={`h-4 ${l} rounded`} />
                <Pulse className={`h-4 ${v} rounded`} />
              </div>
            )
          )}
        </div>
        <Pulse className="h-12 w-full rounded-full mt-8" />
      </div>
    </div>
  </>
);

/* ============================================================
   9. BlogCardListSkeleton
   Use for: BlogCard component (homepage / event page blog list)
   ============================================================ */
export const BlogCardListSkeleton = ({ count = 3 }) => (
  <>
    <StyleInjector />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
          <Pulse className="w-full h-44 rounded-none" />
          <div className="p-5 bg-[#01152E]/[0.02]">
            <TerminalDots />
            <div className="space-y-2 mb-3">
              <CodeLine />
              <CodeLine width="w-4/5" />
            </div>
            <Pulse className="h-3 w-full rounded mb-1.5" />
            <Pulse className="h-3 w-5/6 rounded mb-4" />
            <div className="flex items-center gap-3">
              <Pulse className="w-7 h-7 rounded-full" />
              <Pulse className="h-3 w-24 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </>
);

export default {
  TerminalCardSkeleton,
  InternshipCardSkeleton,
  GalleryMasonrySkeleton,
  ArticleDetailSkeleton,
  ImpactCardSkeleton,
  ProvinceDetailSkeleton,
  CertificateResultSkeleton,
  DonationVerificationSkeleton,
  BlogCardListSkeleton,
};
