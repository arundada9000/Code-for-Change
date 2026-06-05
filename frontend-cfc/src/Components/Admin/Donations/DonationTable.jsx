import React from "react";
import {
  FaCheckCircle,
  FaTimes,
  FaClock,
  FaTags,
  FaEye,
  FaEdit,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";

import { Pulse } from "../../Loading/Skeleton";

function DonationTable({
  loading,
  filteredDonations,
  openMenuId,
  setOpenMenuId,
  setSelectedDonation,
  handleEdit,
  handleUpdateStatus,
  hasPermission,
}) {
  const SkeletonRows = () => (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="bg-white">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Pulse className="w-10 h-10 rounded-[0.75rem]" />
              <div className="space-y-2">
                <Pulse className="h-4 w-32 rounded" />
                <Pulse className="h-3 w-24 rounded" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="space-y-2">
              <Pulse className="h-4 w-24 rounded" />
              <Pulse className="h-3 w-32 rounded" />
            </div>
          </td>
          <td className="px-6 py-4">
            <Pulse className="h-6 w-20 rounded-lg" />
          </td>
          <td className="px-6 py-4">
            <Pulse className="h-6 w-24 rounded-md" />
          </td>
          <td className="px-6 py-4 text-right">
            <Pulse className="h-8 w-8 rounded-lg ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Contributor
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Transaction
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Category
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <SkeletonRows />
            ) : filteredDonations.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-16 text-center text-slate-400 font-semibold"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                      <FaTimes className="text-2xl" />
                    </div>
                    No records found matching your criteria.
                  </div>
                </td>
              </tr>
            ) : (
              filteredDonations.map((d) => (
                <tr
                  key={d._id}
                  className="bg-white hover:bg-slate-50/50 transition-all group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[0.75rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center font-black text-emerald-600 text-sm group-hover:scale-110 transition-transform">
                        {d.donorName[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">
                          {d.donorName}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                          {new Date(d.createdAt).toLocaleDateString()}
                          <span className="text-slate-300">•</span>
                          {d.province || "All Provinces"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-emerald-600 text-sm">
                      Rs. {d.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 tracking-wide font-mono mt-0.5">
                      #{d.transactionId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-white px-3 py-1.5 rounded-lg w-fit border border-slate-200 shadow-sm">
                      <FaTags className="text-emerald-500" />{" "}
                      {d.category || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                        d.status === "Verified"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : d.status === "Rejected"
                            ? "bg-rose-50 text-rose-500 border-rose-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}
                    >
                      {d.status === "Verified" ? (
                        <FaCheckCircle />
                      ) : d.status === "Rejected" ? (
                        <FaTimes />
                      ) : (
                        <FaClock />
                      )}
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === d._id ? null : d._id)
                      }
                      className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-white text-slate-400 hover:bg-slate-50 hover:text-emerald-600 border border-slate-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <BsThreeDotsVertical className="text-sm" />
                    </button>

                    {openMenuId === d._id && (
                      <div className="absolute right-16 top-1/2 -translate-y-1/2 w-48 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 z-50 py-2 animate-in fade-in zoom-in duration-200">
                        <button
                          onClick={() => {
                            setSelectedDonation(d);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-all"
                        >
                          <FaEye className="text-blue-500 text-sm" /> Quick View
                        </button>
                        <div className="h-[1px] bg-slate-100 my-1 mx-4"></div>
                        <button
                          onClick={() => handleEdit(d)}
                          className="w-full px-4 py-2 text-left flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-amber-600 transition-all"
                        >
                          <FaEdit className="text-amber-500 text-sm" /> Modify
                        </button>
                        {hasPermission("donation_verify") &&
                          d.status !== "Verified" && (
                            <>
                              <div className="h-[1px] bg-slate-100 my-1 mx-4"></div>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(d._id, "Verified")
                                }
                                className="w-full px-4 py-2 text-left flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                              >
                                <FaCheckCircle className="text-emerald-500 text-sm" />{" "}
                                Authorize
                              </button>
                            </>
                          )}
                        {hasPermission("donation_verify") &&
                          d.status !== "Rejected" && (
                            <>
                              <div className="h-[1px] bg-slate-100 my-1 mx-4"></div>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(d._id, "Rejected")
                                }
                                className="w-full px-4 py-2 text-left flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
                              >
                                <FaTimes className="text-rose-500 text-sm" />{" "}
                                Reject
                              </button>
                            </>
                          )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-4 grid grid-cols-1 gap-4 bg-slate-50/50">
        {loading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <Pulse className="w-10 h-10 rounded-xl flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Pulse className="h-4 w-32 rounded" />
                    <Pulse className="h-3 w-20 rounded" />
                  </div>
                  <Pulse className="w-8 h-8 rounded-lg flex-shrink-0" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Pulse className="h-16 w-full rounded-xl" />
                  <Pulse className="h-16 w-full rounded-xl" />
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <Pulse className="h-6 w-20 rounded-md" />
                  <Pulse className="h-3 w-24 rounded" />
                </div>
              </div>
            ))}
          </>
        ) : filteredDonations.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-semibold text-sm">
            No records found.
          </div>
        ) : (
          filteredDonations.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-black text-emerald-600 text-sm flex-shrink-0">
                    {d.donorName[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">
                      {d.donorName}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold tracking-wide mt-0.5 font-mono">
                      #{d.transactionId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === d._id ? null : d._id);
                  }}
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 transition-colors shadow-sm"
                >
                  <BsThreeDotsVertical />
                </button>
              </div>

              {/* Mobile Dropdown */}
              {openMenuId === d._id && (
                <div className="absolute top-16 right-4 w-48 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 z-50 py-2 animate-in fade-in zoom-in">
                  <button
                    onClick={() => {
                      setSelectedDonation(d);
                      setOpenMenuId(null);
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-3 text-[10px] font-bold text-slate-600 hover:bg-slate-50 uppercase tracking-widest"
                  >
                    <FaEye className="text-blue-500 text-sm" /> View
                  </button>
                  <div className="h-[1px] bg-slate-50 my-1 mx-4"></div>
                  <button
                    onClick={() => {
                      handleEdit(d);
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-3 text-[10px] font-bold text-slate-600 hover:bg-slate-50 uppercase tracking-widest"
                  >
                    <FaEdit className="text-amber-500 text-sm" /> Modify
                  </button>
                  {hasPermission("donation_verify") &&
                    d.status !== "Verified" && (
                      <>
                        <div className="h-[1px] bg-slate-50 my-1 mx-4"></div>
                        <button
                          onClick={() => handleUpdateStatus(d._id, "Verified")}
                          className="w-full px-4 py-2 text-left flex items-center gap-3 text-[10px] font-bold text-slate-600 hover:bg-emerald-50 uppercase tracking-widest"
                        >
                          <FaCheckCircle className="text-emerald-500 text-sm" />{" "}
                          Authorize
                        </button>
                      </>
                    )}
                  {hasPermission("donation_verify") &&
                    d.status !== "Rejected" && (
                      <>
                        <div className="h-[1px] bg-slate-50 my-1 mx-4"></div>
                        <button
                          onClick={() => handleUpdateStatus(d._id, "Rejected")}
                          className="w-full px-4 py-2 text-left flex items-center gap-3 text-[10px] font-bold text-slate-600 hover:bg-rose-50 uppercase tracking-widest"
                        >
                          <FaTimes className="text-rose-500 text-sm" /> Reject
                        </button>
                      </>
                    )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Amount
                  </p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">
                    Rs. {d.amount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Method
                  </p>
                  <p className="text-xs font-bold text-slate-700 mt-1">
                    {d.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                    d.status === "Verified"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : d.status === "Rejected"
                        ? "bg-rose-50 text-rose-600 border-rose-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      d.status === "Verified"
                        ? "bg-emerald-500"
                        : d.status === "Rejected"
                          ? "bg-rose-500"
                          : "bg-amber-500"
                    }`}
                  ></span>{" "}
                  {d.status}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {new Date(d.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DonationTable;
