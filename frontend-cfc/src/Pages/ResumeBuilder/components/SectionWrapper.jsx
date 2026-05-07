import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            <Icon size={14} />
          </div>
          <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            {title}
          </span>
          {count !== undefined && count > 0 && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: accentColor }}
            >
              {count}
            </span>
          )}
        </div>
        {isOpen ? (
          <FaChevronUp size={12} className="text-slate-400" />
        ) : (
          <FaChevronDown size={12} className="text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
};

export default SectionWrapper;
