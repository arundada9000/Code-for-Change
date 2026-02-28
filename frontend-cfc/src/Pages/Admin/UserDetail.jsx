import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaIdCard, FaUniversity, FaGraduationCap,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaUserTie,
  FaCalendarAlt, FaCheckCircle, FaExclamationCircle, FaUserCircle
} from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import API from "../../Services/api";

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/users/${id}`);
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (error) {
      console.error("Fetch user error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <BsArrowRepeat className="text-4xl text-emerald-500 animate-spin" />
        <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Retrieving secure profile...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="text-center p-20">
      <h2 className="text-2xl font-extrabold text-gray-900 italic">User not found in directory.</h2>
      <button onClick={() => navigate(-1)} className="mt-4 text-emerald-600 font-bold underline">Go Back</button>
    </div>
  );

  const InfoCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-emerald-600">
          <Icon />
        </div>
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[0.2em]">{title}</h3>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  const DataItem = ({ label, value, icon: Icon }) => (
    <div className="flex flex-col gap-1.5 group">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</span>
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 bg-gray-50/50 p-3 rounded-xl group-hover:bg-gray-50 transition-all border border-transparent group-hover:border-gray-100">
        {Icon && <Icon className="text-emerald-500/50 group-hover:text-emerald-500 transition-colors" />}
        <span>{value || 'Not Provided'}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Back & Status */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 bg-white px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          <FaArrowLeft className="text-emerald-600" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-700">Directory</span>
        </button>

        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${user.isActive ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"}`}>
            {user.isActive ? "Active Account" : "Inactive Account"}
          </span>
          <span className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-700 ring-1 ring-gray-200`}>
            {user.role.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
        <div className="px-8 lg:px-12 py-10 lg:py-12">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10">
            <div className="w-40 h-40 rounded-3xl bg-gray-50 p-2 shadow-lg relative shrink-0">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover rounded-2xl border border-gray-200" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-2xl border border-gray-200">
                  <FaUserCircle className="text-7xl text-gray-300" />
                </div>
              )}
              {user.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-50 w-10 h-10 flex items-center justify-center rounded-xl shadow-md border border-emerald-100">
                  <FaCheckCircle className="text-emerald-500 text-2xl" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4 text-center lg:text-left">
              <div className="space-y-1">
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{user.name}</h2>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-4">
                  <span className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest bg-emerald-600 text-white shadow-sm shadow-emerald-200`}>
                    {user.role.replace('-', ' ')}
                  </span>
                  <span className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${user.isActive ? "bg-white text-emerald-700 border border-emerald-200" : "bg-white text-rose-700 border border-rose-200"}`}>
                    {user.isActive ? "Active Account" : "Inactive Account"}
                  </span>
                </div>
              </div>
              <p className="text-gray-500 font-medium text-lg leading-relaxed italic max-w-3xl">{user.bio || 'This member hasn\'t added a bio yet.'}</p>
            </div>

            <div className="flex flex-col gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-200 min-w-[240px] shrink-0">
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  <span>Joined Date</span>
                  <FaCalendarAlt />
                </div>
                <div className="text-sm font-bold text-gray-900">{new Date(user.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
              <div className="h-px bg-gray-200 w-full"></div>
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  <span>Last Activity</span>
                  <BsArrowRepeat />
                </div>
                <div className="text-sm font-bold text-gray-900">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Association Info */}
        <InfoCard title="Association Details" icon={FaIdCard}>
          <DataItem label="Membership ID" value={user.membership?.membershipId} icon={FaIdCard} />
          <DataItem label="Membership Status" value={user.membership?.membershipStatus} icon={FaCheckCircle} />
          <DataItem label="Gender" value={user.gender} />
          <DataItem label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : null} icon={FaCalendarAlt} />
        </InfoCard>

        {/* Executive Info */}
        <InfoCard title="Organizational Role" icon={FaUserTie}>
          <DataItem label="Position" value={user.executiveDetails?.position} icon={FaUserTie} />
          <DataItem label="Department" value={user.executiveDetails?.department} />
          <DataItem label="Term Started" value={user.executiveDetails?.termStart ? new Date(user.executiveDetails.termStart).toLocaleDateString() : null} />
          <DataItem label="Term Ends" value={user.executiveDetails?.termEnd ? new Date(user.executiveDetails.termEnd).toLocaleDateString() : null} />
        </InfoCard>

        {/* Academic Info */}
        <InfoCard title="Academic Profile" icon={FaUniversity}>
          <DataItem label="University" value={user.education?.university} icon={FaUniversity} />
          <DataItem label="College / Institution" value={user.education?.collegeName} icon={FaGraduationCap} />
          <DataItem label="Faculty / Program" value={user.education?.faculty} />
          <div className="grid grid-cols-2 gap-4">
            <DataItem label="Semester" value={user.education?.semester} />
            <DataItem label="Graduation" value={user.education?.graduationYear} />
          </div>
        </InfoCard>

        {/* Contact Info */}
        <InfoCard title="Communication & Location" icon={FaEnvelope}>
          <DataItem label="Primary Email" value={user.email} icon={FaEnvelope} />
          <DataItem label="Phone Number" value={user.phone} icon={FaPhone} />
          <DataItem label="Province" value={user.province} icon={FaMapMarkerAlt} />
          <DataItem label="Region" value={user.region} />
          <DataItem label="Current Address" value={user.address} />
        </InfoCard>

        {/* Social Profiles */}
        <InfoCard title="Digital Footprint" icon={FaUserCircle}>
          <DataItem label="LinkedIn" value={user.linkedin} />
          <DataItem label="GitHub" value={user.github} />
          <DataItem label="Facebook" value={user.facebook} />
          <DataItem label="Website" value={user.website} />
        </InfoCard>
      </div>

      {/* Footer Note */}
      <div className="p-8 text-center text-gray-400 font-bold text-xs uppercase tracking-widest opacity-60">
        End of secure profile record &bull; Association Management System
      </div>
    </div>
  );
}

export default UserDetail;
