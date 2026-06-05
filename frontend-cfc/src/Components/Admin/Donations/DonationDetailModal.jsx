import React from "react";
import {
  FaTimes,
  FaHandHoldingHeart,
  FaWallet,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaUniversity,
  FaInfoCircle,
  FaEye,
  FaEdit,
} from "react-icons/fa";

function DonationDetailModal({
  selectedDonation,
  setSelectedDonation,
  handleEdit,
  handleUpdateStatus,
}) {
  if (!selectedDonation) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 border border-white/20 relative">
        {/* Header with gradient subtle background */}
        <div className="flex justify-between items-start px-8 py-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/50 flex items-center justify-center text-emerald-600">
                <FaHandHoldingHeart className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
                  Donation Details
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-0.5">
                  <span className="text-emerald-500">●</span>{" "}
                  {selectedDonation.transactionId}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedDonation(null)}
            className="relative z-10 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-8 custom-scrollbar overflow-y-auto max-h-[70vh] bg-slate-50/30">
          {/* Financial Section (Hero Card) */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-[1.5rem] text-white shadow-xl shadow-emerald-900/20">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-emerald-100/80 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <FaWallet /> Contribution Amount
                </p>
                <h2 className="text-5xl font-black tracking-tight mt-2 flex items-baseline gap-2">
                  <span className="text-emerald-200/60 text-3xl">Rs.</span>
                  {selectedDonation.amount.toLocaleString()}
                </h2>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Status
              </p>
              <span
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest border-2 ${
                  selectedDonation.status === "Verified"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100"
                    : selectedDonation.status === "Rejected"
                      ? "bg-rose-50 text-rose-500 border-rose-100 shadow-rose-100"
                      : "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100"
                } shadow-sm`}
              >
                {selectedDonation.status === "Verified" ? (
                  <FaCheckCircle className="text-base" />
                ) : selectedDonation.status === "Rejected" ? (
                  <FaTimes className="text-base" />
                ) : (
                  <FaClock className="text-base" />
                )}
                {selectedDonation.status}
              </span>
            </div>
          </div>

          {/* Contributor Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                  <FaUser className="text-xl" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Donor Identity
                  </p>
                  <p className="text-base font-bold text-slate-800">
                    {selectedDonation.donorName}
                  </p>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <FaEnvelope className="text-slate-400" /> Email
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedDonation.email || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <FaPhone className="text-slate-400" /> Phone
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedDonation.phone || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <FaShieldAlt className="text-slate-400" /> Visibility
                  </span>
                  <span
                    className={`font-semibold ${
                      selectedDonation.isAnonymous
                        ? "text-amber-500"
                        : "text-emerald-500"
                    }`}
                  >
                    {selectedDonation.isAnonymous ? "Anonymous" : "Public"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                  <FaUniversity className="text-xl" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Transaction Details
                  </p>
                  <p className="text-base font-bold text-slate-800">
                    {selectedDonation.paymentMethod}
                  </p>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Receiver</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDonation.receiverAccount}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Category</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDonation.category || "General"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(
                      selectedDonation.createdAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt & Remarks section */}
          {(selectedDonation.receipt || selectedDonation.remarks) && (
            <div className="grid md:grid-cols-2 gap-4">
              {selectedDonation.remarks && (
                <div
                  className={`bg-amber-50/50 p-6 rounded-[1.5rem] border border-amber-100/50 ${
                    !selectedDonation.receipt ? "md:col-span-2" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FaInfoCircle className="text-amber-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                      Audit Remarks
                    </h4>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    "{selectedDonation.remarks}"
                  </p>
                </div>
              )}

              {selectedDonation.receipt && (
                <div
                  className={`bg-slate-100/50 p-6 rounded-[1.5rem] border border-slate-200/50 flex flex-col justify-center items-center relative overflow-hidden group ${
                    !selectedDonation.remarks ? "md:col-span-2" : ""
                  }`}
                >
                  <a
                    href={selectedDonation.receipt}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center backdrop-blur-sm rounded-[1.5rem]">
                      <FaEye className="text-3xl text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform" />
                      <span className="text-white font-bold text-xs uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform delay-75">
                        View Receipt
                      </span>
                    </div>
                    <img
                      src={selectedDonation.receipt}
                      alt="Donation Receipt"
                      className="w-full h-40 object-cover rounded-[1.25rem] shadow-sm border border-slate-200"
                    />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Verification Audit Log */}
          {selectedDonation.status === "Verified" && (
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700">
                  <FaShieldAlt className="text-sm" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                    Verified By
                  </p>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedDonation.verifiedBy || "System Admin"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Date
                </p>
                <p className="text-xs font-bold text-slate-600">
                  {new Date(
                    selectedDonation.verifiedAt || selectedDonation.updatedAt
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-white border-t border-slate-100 flex flex-wrap gap-3 justify-end items-center">
          <button
            onClick={() => handleEdit(selectedDonation)}
            className="px-6 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <FaEdit /> Modify
          </button>
          {selectedDonation.status === "Pending" && (
            <>
              <button
                onClick={() =>
                  handleUpdateStatus(selectedDonation._id, "Rejected")
                }
                className="px-6 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
              >
                <FaTimes /> Reject
              </button>
              <button
                onClick={() =>
                  handleUpdateStatus(selectedDonation._id, "Verified")
                }
                className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <FaCheckCircle /> Authorize
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DonationDetailModal;
