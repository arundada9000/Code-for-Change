import React from "react";
import { FaTimes, FaCloudUploadAlt, FaCheckCircle } from "react-icons/fa";

function DonationFormModal({
  showAddModal,
  isEditing,
  resetForm,
  formData,
  setFormData,
  handleFileChange,
  receiptPreview,
  handleSubmit,
  submitting,
  PROVINCES,
}) {
  if (!showAddModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20 relative">
        {/* Header with gradient subtle background */}
        <div className="flex justify-between items-start px-8 py-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {isEditing ? "Update Record" : "Create Donation Record"}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Financial Entry
            </p>
          </div>
          <button
            onClick={resetForm}
            className="relative z-10 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <FaTimes />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 custom-scrollbar overflow-y-auto bg-slate-50/30"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Donor Full Name
              </label>
              <input
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-slate-700 shadow-sm"
                value={formData.donorName}
                onChange={(e) =>
                  setFormData({ ...formData, donorName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Amount (NPR)
              </label>
              <input
                required
                type="number"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-slate-700 shadow-sm"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Payment Method
              </label>
              <select
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-slate-700 shadow-sm cursor-pointer"
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: e.target.value,
                  })
                }
              >
                <option value="eSewa">eSewa Mobile Wallet</option>
                <option value="Khalti">Khalti Digital Wallet</option>
                <option value="Bank Transfer">Direct Bank Transfer</option>
                <option value="ConnectIPS">ConnectIPS Protocol</option>
                <option value="Cash">Cash / Offline Ledger</option>
                <option value="Card">Direct Card Payment</option>
                <option value="Other">External Gateway</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Category / Purpose
              </label>
              <select
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-slate-700 shadow-sm cursor-pointer"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="General">General Contribution</option>
                <option value="Project">Specific Project Aid</option>
                <option value="Event">Event Sponsorship</option>
                <option value="Charity">Special Charity Drive</option>
                <option value="Emergency">Emergency Relief Fund</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Region
              </label>
              <select
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-slate-700 shadow-sm cursor-pointer"
                value={formData.province}
                onChange={(e) =>
                  setFormData({ ...formData, province: e.target.value })
                }
              >
                <option value="">Select Province</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Transaction ID
              </label>
              <input
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-slate-700 shadow-sm"
                value={formData.transactionId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transactionId: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Receiver Account
              </label>
              <input
                required
                placeholder="e.g. CFC Central Bank AC"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-slate-700 shadow-sm"
                value={formData.receiverAccount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    receiverAccount: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Email (Optional)
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-slate-700 shadow-sm"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Phone (Optional)
              </label>
              <input
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-slate-700 shadow-sm"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Remarks
              </label>
              <textarea
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-slate-700 shadow-sm h-28"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col justify-center space-y-4 md:col-span-2">
              <label className="flex items-center gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  hidden
                  checked={formData.isAnonymous}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isAnonymous: e.target.checked,
                    })
                  }
                />
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border-2 transition-all shadow-sm ${formData.isAnonymous ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300 group-hover:border-emerald-400"}`}
                >
                  {formData.isAnonymous && (
                    <FaCheckCircle className="text-white text-xs" />
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  Anonymous / Confidential
                </span>
              </label>
            </div>

            {/* Receipt Upload */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Payment Receipt (Optional)
              </label>
              <div
                onClick={() =>
                  document.getElementById("receipt-upload").click()
                }
                className={`border-2 border-dashed rounded-[1.5rem] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${receiptPreview ? "border-emerald-400 bg-emerald-50/50" : "border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-300"}`}
              >
                <input
                  id="receipt-upload"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {receiptPreview ? (
                  <div className="relative group w-full flex justify-center">
                    <img
                      src={receiptPreview}
                      alt="Receipt Preview"
                      className="h-48 w-auto rounded-[1.25rem] shadow-lg object-cover border border-slate-200"
                    />
                    <div className="absolute inset-0 bg-slate-900/50 rounded-[1.25rem] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity w-fit mx-auto aspect-square h-48">
                      <FaCloudUploadAlt className="text-white text-3xl mb-2" />
                      <span className="text-white text-[10px] font-bold uppercase tracking-widest">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-2">
                      <FaCloudUploadAlt className="text-3xl" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                        Click to upload receipt
                      </p>
                      <p className="text-[9px] text-slate-400 mt-2 font-semibold tracking-wide">
                        JPEG, PNG, WEBP (Max 5MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="px-8 py-3.5 border border-slate-200 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-10 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                submitting
                  ? "bg-slate-100 cursor-not-allowed text-slate-400 border border-slate-200"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
              }`}
            >
              {submitting
                ? "Processing..."
                : isEditing
                  ? "Update Record"
                  : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DonationFormModal;
