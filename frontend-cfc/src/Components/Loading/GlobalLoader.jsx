import React from "react";

const GlobalLoader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="relative flex flex-col items-center">
        {/* Animated brackets and text */}
        <div className="text-2xl md:text-3xl font-black text-slate-800 tracking-widest flex items-center gap-3">
          <span className="text-emerald-500 animate-pulse">{"<"}</span>
          <div className="relative inline-block overflow-hidden">
            <span className="inline-block animate-[shimmer_2s_infinite] bg-gradient-to-r from-slate-800 via-slate-400 to-slate-800 bg-[length:200%_100%] bg-clip-text text-transparent">
              CODE FOR CHANGE
            </span>
          </div>
          <span className="text-emerald-500 animate-pulse">{"/>"}</span>
        </div>
        
        {/* Subtitle / loading indicator */}
        <div className="mt-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
        </div>

        {/* Global Keyframes for Shimmer if Tailwind doesn't have it natively */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}} />
      </div>
    </div>
  );
};

export default GlobalLoader;
