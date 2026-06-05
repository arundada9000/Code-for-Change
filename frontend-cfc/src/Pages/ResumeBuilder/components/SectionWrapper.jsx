import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

/**
 * SectionWrapper — Collapsible accordion wrapper for resume editor sections.
 *
 * Props:
 *   - icon: React icon component
 *   - title: string
 *   - count: number (optional — shows item count badge)
 *   - defaultOpen: boolean
 *   - children: form content
 *   - accentColor: hex string
 */
const SectionWrapper = ({
  icon: Icon,
  title,
  count,
  defaultOpen = false,
  children,
  accentColor = "#0076B4",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        isOpen
          ? "bg-white border-slate-200 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.06)]"
          : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer transition-colors group/btn"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: isOpen ? accentColor : `${accentColor}12`,
              color: isOpen ? "#fff" : accentColor,
            }}
          >
            <Icon size={14} />
          </div>
          <span className="text-sm font-black text-slate-800 tracking-tight">
            {title}
          </span>
          {count !== undefined && count > 0 && (
            <span
              className="text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: accentColor }}
            >
              {count}
            </span>
          )}
        </div>
        <div
          className={`w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center transition-all duration-300 group-hover/btn:bg-slate-100 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <FaChevronDown size={10} className="text-slate-400" />
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 border-t border-slate-100">
          <div className="pt-5">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default SectionWrapper;
