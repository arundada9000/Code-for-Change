import React from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";

const Breadcrumbs = ({ crumbs }) => {
  if (!crumbs || crumbs.length === 0) return null;

  return (
    <nav className="flex mb-8" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 bg-white/50 backdrop-blur-sm border border-slate-100 px-5 py-2.5 rounded-2xl shadow-sm">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-secondary uppercase tracking-widest transition-colors"
          >
            <FiHome className="mr-2" />
            Home
          </Link>
        </li>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          
          // Skip home if it's the first crumb as we already rendered it
          if (crumb.path === "/" || crumb.name.toLowerCase() === "home") return null;

          return (
            <li key={index}>
              <div className="flex items-center">
                <FiChevronRight className="text-slate-300 mx-1 md:mx-2" />
                {isLast ? (
                  <span className="text-xs font-black text-secondary uppercase tracking-widest truncate max-w-[150px] md:max-w-xs">
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-xs font-bold text-slate-400 hover:text-secondary uppercase tracking-widest transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
