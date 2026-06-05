import React from "react";
import { FaHandHoldingHeart, FaClock, FaShieldAlt } from "react-icons/fa";

function DonationStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="relative overflow-hidden bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/50 to-emerald-50/0 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="relative z-10 flex items-center gap-5">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-2xl text-emerald-600 text-2xl border border-emerald-100/50 shadow-sm shadow-emerald-900/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
            <FaHandHoldingHeart />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
              Total Verified
            </p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight flex items-baseline gap-1">
              <span className="text-emerald-500 text-xl font-bold">Rs.</span>
              {stats.totalAmount.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-amber-900/5 hover:-translate-y-1 transition-all duration-300 group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-amber-50/0 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="relative z-10 flex items-center gap-5">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 rounded-2xl text-amber-600 text-2xl border border-amber-100/50 shadow-sm shadow-amber-900/5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
            <FaClock />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
              Awaiting Audit
            </p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight flex items-baseline gap-2">
              {stats.pendingCount}{" "}
              <span className="text-xs text-slate-400 font-bold tracking-normal uppercase">
                Entries
              </span>
            </h3>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-blue-50/0 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="relative z-10 flex items-center gap-5">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-2xl text-blue-600 text-2xl border border-blue-100/50 shadow-sm shadow-blue-900/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
            <FaShieldAlt />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
              Verified Records
            </p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight flex items-baseline gap-2">
              {stats.verifiedCount}{" "}
              <span className="text-xs text-slate-400 font-bold tracking-normal uppercase">
                Records
              </span>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonationStats;
