import React, { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { 
  FaUser, FaEnvelope, FaShieldAlt, FaCalendarAlt, FaPhoneAlt,
  FaCheckCircle, FaTimesCircle, FaClock, FaKey, FaUniversity,
  FaGraduationCap, FaIdCard, FaSave, FaTimes, FaEdit, FaMapMarkerAlt,
  FaFacebookF, FaLinkedinIn, FaGithub, FaLink, FaVenusMars
} from "react-icons/fa";
import API from "../../Services/api";

function Profile() {
  const { user, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    bio: user?.bio || "",
    gender: user?.gender || "",
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
    collegeName: user?.education?.collegeName || "",
    university: user?.education?.university || "",
    faculty: user?.education?.faculty || "",
    semester: user?.education?.semester || "",
    position: user?.executiveDetails?.position || "",
    website: user?.website || "",
    linkedin: user?.linkedin || "",
    github: user?.github || "",
    facebook: user?.facebook || "",
  });

  if (!user) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await API.patch("/auth/profile", formData);
      if (res.data.success) {
        updateUserData(res.data.data);
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const InfoItem = ({ icon: Icon, label, value, name, color = "text-slate-600", bg = "bg-slate-50" }) => (
    <div className="flex items-center gap-4 p-4 border border-slate-100 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${bg} ${color}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        {isEditing && name ? (
          <input 
            type="text" 
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        ) : (
          <p className="text-slate-900 font-bold text-sm">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Notifications */}
      {message.text && (
        <div className={`fixed top-24 right-8 z-50 px-6 py-4 rounded-[1.5rem] shadow-2xl animate-in slide-in-from-right-10 duration-500 flex items-center gap-3 font-bold text-xs uppercase tracking-widest ${
          message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
        }`}>
          {message.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
          {message.text}
        </div>
      )}

      {/* --- Premium Header Section --- */}
      <div className="relative group overflow-hidden bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20 opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="relative px-10 py-12 flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl border-2 border-emerald-500/30 p-1.5 shadow-2xl shadow-emerald-500/10 transition-transform duration-500 group-hover:scale-105">
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-emerald-500 overflow-hidden border border-slate-800">
                <FaUser size={64} />
              </div>
            </div>
            {user.isActive && (
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-lg border-4 border-slate-950 shadow-xl">
                <FaCheckCircle size={14} />
              </div>
            )}
          </div>
            <div className="text-center md:text-left space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                {isEditing ? (
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="text-4xl font-black bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-white w-full md:w-auto"
                  />
                ) : (
                  <h1 className="text-4xl font-black text-white tracking-tight">
                    {user.name}
                  </h1>
                )}
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                  {user.role.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  className="w-full mt-2 p-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 font-medium text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  rows="2"
                />
              ) : (
                <p className="text-slate-400 font-medium max-w-xl italic">
                  {user.bio || "Committed to empowering the youth of Nepal through technology and innovation at Code for Change."}
                </p>
              )}
            </div>
          <div className="flex gap-4">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2">
                  <FaTimes /> Cancel
                </button>
                <button onClick={handleSave} disabled={loading} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 flex-nowrap whitespace-nowrap">
                  <FaSave /> {loading ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                <FaEdit /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- Main Information Column --- */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoItem icon={FaEnvelope} label="Email Address" value={user.email} color="text-emerald-600" bg="bg-emerald-50" />
              <InfoItem icon={FaPhoneAlt} label="Phone Number" value={user.phone || "Not provided"} name="phone" color="text-blue-600" bg="bg-blue-50" />
              <InfoItem icon={FaMapMarkerAlt} label="Living Address" value={user.address || "Not provided"} name="address" color="text-rose-600" bg="bg-rose-50" />
            </div>
            {isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Gender</label>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Date of Birth</label>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    value={formData.dateOfBirth} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold"
                  />
                </div>
              </div>
            )}
          </section>

          {((user.membership || user.education) || user.role === 'student') && (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Association Membership</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={FaIdCard} label="Member Code" value={user.membership?.membershipId || "N/A"} color="text-indigo-600" bg="bg-indigo-50" />
                <InfoItem icon={FaUniversity} label="University" value={user.education?.university || "N/A"} name="university" color="text-amber-600" bg="bg-amber-50" />
                <InfoItem icon={FaUniversity} label="College Name" value={user.education?.collegeName || "N/A"} name="collegeName" color="text-teal-600" bg="bg-teal-50" />
                <InfoItem icon={FaGraduationCap} label="Faculty" value={user.education?.faculty || 'N/A'} name="faculty" color="text-purple-600" bg="bg-purple-50" />
                <InfoItem icon={FaCalendarAlt} label="Semester" value={user.education?.semester || 'N/A'} name="semester" color="text-emerald-600" bg="bg-emerald-50" />
                {(user.executiveDetails?.position || isEditing) && (
                  <InfoItem icon={FaUser} label="EB Body Role" value={user.executiveDetails?.position || "Not Applicable"} name="position" color="text-rose-600" bg="bg-rose-50" />
                )}
              </div>
            </section>
          )}

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Social Presence</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem icon={FaLink} label="Website" value={user.website || "Not provided"} name="website" color="text-slate-600" bg="bg-slate-50" />
              <InfoItem icon={FaLinkedinIn} label="LinkedIn" value={user.linkedin || "Not provided"} name="linkedin" color="text-blue-700" bg="bg-blue-50" />
              <InfoItem icon={FaGithub} label="GitHub" value={user.github || "Not provided"} name="github" color="text-slate-900" bg="bg-slate-50" />
              <InfoItem icon={FaFacebookF} label="Facebook" value={user.facebook || "Not provided"} name="facebook" color="text-blue-600" bg="bg-blue-50" />
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Security & Permissions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem icon={FaShieldAlt} label="Account Status" value={user.accountStatus || "Active"} color={user.isActive ? "text-emerald-600" : "text-red-600"} bg={user.isActive ? "bg-emerald-50" : "bg-red-50"} />
              <InfoItem icon={FaKey} label="Verification" value={user.isVerified ? "Secured" : "Pending"} color={user.isVerified ? "text-emerald-600" : "text-amber-600"} bg={user.isVerified ? "bg-emerald-50" : "bg-amber-50"} />
            </div>
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Permissions</p>
              <div className="flex flex-wrap gap-2">
                {user.permissions?.length > 0 ? (
                  user.permissions.map((perm) => (
                    <span key={perm} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                      {perm.replace(/:/g, ' ')}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No specific permissions assigned.</span>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* --- System Metrics Column --- */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-slate-900 rounded-2xl p-8 text-white space-y-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 text-emerald-400">
              <FaClock size={20} />
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">Activity Log</h3>
            </div>
            <div className="space-y-6">
              <div className="border-l-2 border-emerald-500/20 pl-6 relative">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-slate-900 shadow-lg shadow-emerald-500/20"></div>
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Last Login</p>
                 <p className="text-sm font-bold text-slate-200 mt-1">{formatDate(user.lastLogin)}</p>
              </div>
              <div className="border-l-2 border-slate-800 pl-6 relative">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-700 border-4 border-slate-900"></div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Joined On</p>
                 <p className="text-sm font-bold text-slate-300 mt-1">{formatDate(user.createdAt)}</p>
              </div>
              <div className="border-l-2 border-slate-800 pl-6 relative">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-700 border-4 border-slate-900"></div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Updated</p>
                 <p className="text-sm font-bold text-slate-300 mt-1">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </section>

          <section className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100/50 space-y-4">
             <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <FaShieldAlt size={20} />
             </div>
             <h3 className="text-lg font-black text-slate-900 leading-tight">Secure Access</h3>
             <p className="text-emerald-700 text-xs font-semibold leading-relaxed">
               Your session is protected with industry-standard encryption. Always log out when using public devices.
             </p>
             <div className="pt-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
               Security Audit: Passed
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Profile;
