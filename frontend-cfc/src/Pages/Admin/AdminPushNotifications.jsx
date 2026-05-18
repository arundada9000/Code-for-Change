import React, { useState } from "react";
import API from "../../Services/api";
import { 
  FaBullhorn, 
  FaPaperPlane, 
  FaSpinner, 
  FaMobileAlt, 
  FaCheckCircle 
} from "react-icons/fa";
import toast from "react-hot-toast";

const PROVINCES = [
  "Kathmandu", "Pokhara", "Rupandehi", "Dang", 
  "Birgunj", "Farwest", "Koshi", "Chitwan", "LB Karnali"
];

const ROLES = [
  { value: "gm", label: "General Member (GM)" },
  { value: "cr", label: "Campus Representative (CR)" },
  { value: "eb", label: "Executive Board (EB)" },
  { value: "ippl", label: "Immediate Past Project Lead (IPPL)" },
  { value: "alumni", label: "Alumni" },
];

const AdminPushNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    url: "/",
    targetAll: true,
    targetProvince: "",
    targetRoles: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox" && name === "targetAll") {
      setFormData(prev => ({ ...prev, targetAll: checked }));
    } else if (name === "targetRoles") {
      const newRoles = [...formData.targetRoles];
      if (checked) {
        newRoles.push(value);
      } else {
        const index = newRoles.indexOf(value);
        if (index > -1) newRoles.splice(index, 1);
      }
      setFormData(prev => ({ ...prev, targetRoles: newRoles }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) {
      return toast.error("Title and body are required!");
    }

    if (!formData.targetAll && !formData.targetProvince && formData.targetRoles.length === 0) {
      return toast.error("Please specify a target audience or select 'Send to All Users'");
    }

    setLoading(true);
    try {
      const res = await API.post("/notifications/admin/send", formData);
      if (res.data.success) {
        toast.success(res.data.message || "Notification sent successfully!");
        setFormData({
          title: "",
          body: "",
          url: "/",
          targetAll: true,
          targetProvince: "",
          targetRoles: []
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
              <FaBullhorn size={20} />
            </div>
            Push Notifications
          </h1>
          <p className="text-slate-500 mt-1">
            Broadcast custom messages directly to user devices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSend} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              
              {/* Message Content */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Message Content
                </h2>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1 uppercase tracking-wider">
                    Notification Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., New Web Development Workshop!"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    maxLength={50}
                  />
                  <div className="text-right mt-1 text-[10px] text-slate-400">{formData.title.length}/50</div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1 uppercase tracking-wider">
                    Body Message *
                  </label>
                  <textarea
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    placeholder="e.g., Join us this Saturday at 10 AM. Registration is now open!"
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none"
                    maxLength={150}
                  />
                  <div className="text-right mt-1 text-[10px] text-slate-400">{formData.body.length}/150</div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1 uppercase tracking-wider">
                    Click Target URL (Optional)
                  </label>
                  <input
                    type="text"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="e.g., /events/web-workshop"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5 ml-1">
                    The internal route (e.g., `/events`) or external URL to open when the user clicks the notification.
                  </p>
                </div>
              </div>

              {/* Targeting Options */}
              <div className="space-y-4 pt-4">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Target Audience
                </h2>
                
                <label className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="targetAll"
                      checked={formData.targetAll}
                      onChange={handleChange}
                      className="peer w-5 h-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 checked:border-emerald-500 checked:bg-emerald-500 transition-all"
                    />
                    <FaCheckCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-800">Send to All Users</span>
                    <p className="text-[11px] text-emerald-600">Broadcast this to every user who has push enabled.</p>
                  </div>
                </label>

                {!formData.targetAll && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                        Filter by Province
                      </label>
                      <select
                        name="targetProvince"
                        value={formData.targetProvince}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      >
                        <option value="">-- All Provinces --</option>
                        {PROVINCES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                        Filter by Roles
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-white border border-slate-200 rounded-lg">
                        {ROLES.map(role => (
                          <label key={role.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="targetRoles"
                              value={role.value}
                              checked={formData.targetRoles.includes(role.value)}
                              onChange={handleChange}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-slate-700">{role.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.body}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane size={14} />}
                {loading ? "Sending..." : "Send Broadcast"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-6 flex items-center gap-2">
              <FaMobileAlt className="text-slate-400" /> Live Preview
            </h2>

            {/* Mobile OS Notification Mockup */}
            <div className="bg-slate-100 rounded-3xl p-4 shadow-inner">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm relative overflow-hidden group">
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <img src="/icons/icons/icon-72x72.png" alt="Icon" className="w-6 h-6 object-contain" onError={(e) => e.target.style.display='none'} />
                    {/* Fallback if image fails */}
                    <FaBullhorn className="text-white absolute opacity-50 w-5 h-5 -z-10 group-hover:opacity-0" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">CFC Nepal</p>
                      <p className="text-[10px] text-slate-400">now</p>
                    </div>
                    <p className="font-bold text-slate-800 text-sm truncate">
                      {formData.title || "Notification Title"}
                    </p>
                    <p className="text-slate-600 text-[13px] leading-snug line-clamp-2 mt-0.5">
                      {formData.body || "This is how your message will appear to users on their devices."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                <strong>Note:</strong> Push notifications require the user to have explicitly opted in via their Profile settings. iOS users must also "Add to Home Screen" to receive them.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPushNotifications;
