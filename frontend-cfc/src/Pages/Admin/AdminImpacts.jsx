import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaTimes,
  FaImage,
  FaCloudUploadAlt,
  FaHistory,
  FaBullseye,
  FaChartBar,
  FaEye,
} from "react-icons/fa";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";
import { useAuth } from "../../Context/AuthContext";
import { AdminTableSkeleton } from "../../Components/Loading/Skeleton";

const InputField = React.memo(
  ({
    label,
    name,
    value,
    onChange,
    type = "text",
    required = false,
    placeholder,
  }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 font-medium text-sm transition-all"
        value={value}
        onChange={onChange}
      />
    </div>
  ),
);

const SelectField = React.memo(
  ({ label, value, onChange, options, required = false }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
        {label}
      </label>
      <select
        required={required}
        className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 font-medium text-sm transition-all appearance-none"
        value={value}
        onChange={onChange}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
);

const TextAreaField = React.memo(
  ({
    label,
    name,
    value,
    onChange,
    rows = 3,
    required = false,
    placeholder,
  }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
        {label}
      </label>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 font-medium text-sm transition-all resize-none"
        value={value}
        onChange={onChange}
      />
    </div>
  ),
);

function AdminImpacts() {
  const { hasPermission } = useAuth();
  const [impacts, setImpacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImpact, setEditingImpact] = useState(null);
  const [viewingImpact, setViewingImpact] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [impactToDelete, setImpactToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [filterProvince, setFilterProvince] = useState("");
  const PROVINCES = [
    "Kathmandu",
    "Pokhara",
    "Rupandehi",
    "Dang",
    "Birgunj",
    "Farwest",
    "Koshi",
    "Chitwan",
    "LB Karnali",
  ];

  const [formData, setFormData] = useState({
    title: "",
    category: "Current",
    dates: "",
    location: "",
    platform: "",
    description: "",
    details: "",
    isLarge: false,
    participants: 0,
    projects: 0,
    impactNote: "",
    province: "",
    imageFile: null,
    imagePreview: "",
  });

  useEffect(() => {
    fetchImpacts();
  }, [searchTerm, filterProvince]);

  const fetchImpacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterProvince) params.append("province", filterProvince);

      const response = await API.get(`/impacts?${params.toString()}`);
      // The backend uses sendSuccess which wraps data in { success, data, message }
      const data = response.data?.data || response.data;
      setImpacts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch impacts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "Current",
      dates: "",
      location: "",
      platform: "",
      description: "",
      details: "",
      isLarge: false,
      participants: 0,
      projects: 0,
      impactNote: "",
      province: "",
      imageFile: null,
      imagePreview: "",
    });
    setEditingImpact(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "imageFile") {
          if (formData[key]) data.append("image", formData[key]);
        } else if (["participants", "projects", "impactNote"].includes(key)) {
          // Metrics are handled separately or as a flat object if backend supports it
          // For our backend, we need to nest them
        } else {
          data.append(key, formData[key]);
        }
      });

      // Append metrics
      data.append("metrics[participants]", formData.participants);
      data.append("metrics[projects]", formData.projects);
      data.append("metrics[impact]", formData.impactNote);

      if (editingImpact) {
        await API.put(`/impacts/${editingImpact._id}`, data);
        toast.success("Impact updated successfully");
      } else {
        await API.post("/impacts", data);
        toast.success("Impact created successfully");
      }
      setIsModalOpen(false);
      resetForm();
      fetchImpacts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save impact");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (impact) => {
    setEditingImpact(impact);
    setFormData({
      title: impact.title || "",
      category: impact.category || "Current",
      dates: impact.dates || "",
      location: impact.location || "",
      platform: impact.platform || "",
      description: impact.description || "",
      details: impact.details || "",
      isLarge: impact.isLarge || false,
      participants: impact.metrics?.participants || 0,
      projects: impact.metrics?.projects || 0,
      impactNote: impact.metrics?.impact || "",
      province: impact.province || "",
      imageFile: null,
      imagePreview: impact.image || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/impacts/${impactToDelete._id}`);
      toast.success("Impact deleted successfully");
      setDeleteModalOpen(false);
      fetchImpacts();
    } catch (error) {
      toast.error("Failed to delete impact", error);
    }
  };

  const filteredImpacts = impacts.filter((impact) =>
    impact.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading && impacts.length === 0) return <AdminTableSkeleton />;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tightests mb-2">
            Our <span className="text-blue-600">Impacts</span>
          </h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
            Manage impact stories & history
          </p>
        </div>
        {hasPermission("impact_create") && (
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 group"
          >
            <FaPlus className="group-hover:rotate-90 transition-transform" />{" "}
            CREATE IMPACT
          </button>
        )}
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 relative">
          <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or category..."
            className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-3xl outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="lg:col-span-1 relative">
          <select
            className="w-full px-6 py-5 bg-white border border-slate-100 rounded-3xl outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer appearance-none"
            value={filterProvince}
            onChange={(e) => setFilterProvince(e.target.value)}
          >
            <option value="">All Regions</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <FaMapMarkerAlt size={12} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Total Impacts
            </p>
            <p className="text-2xl font-black text-primary">{impacts.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <FaChartBar />
          </div>
        </div>
      </div>

      {/* Impact Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-8 py-5">Impact Story</th>
                <th className="px-8 py-5">Category / Timeline</th>
                <th className="px-8 py-5">Outcomes</th>
                <th className="px-8 py-5">Layout</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredImpacts.map((impact) => (
                <tr
                  key={impact._id}
                  className="hover:bg-slate-50/50 transition-all group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                        <img
                          src={impact.image}
                          className="w-full h-full object-cover"
                          alt={impact.title}
                        />
                      </div>
                      <div>
                        <div className="font-black text-gray-900 leading-none mb-1">
                          {impact.title}
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FaMapMarkerAlt
                            className="text-emerald-500"
                            size={8}
                          />{" "}
                          {impact.province || "National"} •{" "}
                          {impact.location || "Online"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <span
                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${impact.category === "Current" ? "bg-blue-600 text-white" : "bg-slate-700 text-white"}`}
                      >
                        {impact.category}
                      </span>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                        {impact.dates}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black">
                        {impact.metrics?.participants || 0} PART.
                      </span>
                      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black">
                        {impact.metrics?.projects || 0} PROJ.
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${impact.isLarge ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"}`}
                    >
                      {impact.isLarge ? "LARGE CARD" : "STANDARD"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setViewingImpact(impact)}
                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {hasPermission("impact_update") && (
                        <button
                          onClick={() => handleEdit(impact)}
                          className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90"
                        >
                          <FaEdit />
                        </button>
                      )}
                      {hasPermission("impact_delete") && (
                        <button
                          onClick={() => {
                            setImpactToDelete(impact);
                            setDeleteModalOpen(true);
                          }}
                          className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredImpacts.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-black uppercase tracking-[0.2em]">
              No impact stories found
            </div>
          )}
        </div>
      )}

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden relative shadow-2xl animate-modal-in flex flex-col">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-3xl font-black text-primary tracking-tight">
                  {editingImpact ? "Edit" : "Create New"}{" "}
                  <span className="text-blue-600">Impact</span>
                </h2>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                  Fill in the details below
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all active:scale-90"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-10 overflow-y-auto flex-1 space-y-10 custom-scrollbar"
            >
              {/* Image Upload */}
              <div
                className="relative group cursor-pointer"
                onClick={() => document.getElementById("impact-image").click()}
              >
                <div className="aspect-[21/9] rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center group-hover:bg-slate-100 group-hover:border-blue-400 transition-all">
                  {formData.imagePreview ? (
                    <img
                      src={formData.imagePreview}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt="Preview"
                    />
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-all">
                        <FaCloudUploadAlt className="text-3xl" />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                        Click to upload cover image
                      </p>
                    </>
                  )}
                  <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                    <div className="px-6 py-3 bg-white rounded-xl shadow-xl font-black text-blue-600 text-xs tracking-widest">
                      CHANGE IMAGE
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  id="impact-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              {/* Basic Fields */}
              <div className="grid md:grid-cols-2 gap-8">
                <InputField
                  label="Impact Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Codefest 2022"
                />
                <SelectField
                  label="Category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  options={[
                    { value: "Current", label: "Current Impact" },
                    { value: "History", label: "Our History" },
                  ]}
                />
                <SelectField
                  label="Region"
                  value={formData.province}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      province: e.target.value,
                    }))
                  }
                  options={[
                    { value: "", label: "Select Region" },
                    ...PROVINCES.map((p) => ({ value: p, label: p })),
                  ]}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <InputField
                  label="Dates / Timeline"
                  name="dates"
                  value={formData.dates}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., March 01, 2022 - April 30, 2022"
                />
                <InputField
                  label="Location (Optional)"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., National or Multi-City"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <InputField
                  label="Platform / Venue"
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  placeholder="e.g., Zoom, Physical, etc."
                />
                <div className="flex items-center gap-4 ml-4">
                  <input
                    type="checkbox"
                    id="isLarge"
                    name="isLarge"
                    className="w-5 h-5 accent-blue-600"
                    checked={formData.isLarge}
                    onChange={handleInputChange}
                  />
                  <label
                    htmlFor="isLarge"
                    className="text-xs font-black text-slate-500 uppercase tracking-widest"
                  >
                    Large Card Layout
                  </label>
                </div>
              </div>

              <TextAreaField
                label="Short Description"
                name="description"
                value={formData.description}
                rows={2}
                onChange={handleInputChange}
                required
                placeholder="A brief summary for the impact..."
              />
              <TextAreaField
                label="Full Detailed Story"
                name="details"
                value={formData.details}
                rows={6}
                onChange={handleInputChange}
                placeholder="Enter the complete impact story here..."
              />

              {/* Metrics Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <FaChartBar size={14} />
                  </div>
                  <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em]">
                    Impact Outcomes (Metrics)
                  </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-8 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <InputField
                    label="Participants"
                    name="participants"
                    type="number"
                    value={formData.participants}
                    onChange={handleInputChange}
                  />
                  <InputField
                    label="Projects"
                    name="projects"
                    type="number"
                    value={formData.projects}
                    onChange={handleInputChange}
                  />
                  <InputField
                    label="Impact Note"
                    name="impactNote"
                    value={formData.impactNote}
                    onChange={handleInputChange}
                    placeholder="e.g., 80% Success Rate"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pb-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs tracking-widest hover:bg-slate-200 transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:bg-blue-300"
                >
                  {submitting
                    ? "SAVING..."
                    : editingImpact
                      ? "UPDATE IMPACT"
                      : "SAVE IMPACT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Impact Story"
        message="Are you sure you want to delete this impact story? This action cannot be undone."
      />

      {/* Quick View Modal */}
      {viewingImpact && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setViewingImpact(null)}
          />
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden relative shadow-2xl animate-modal-in flex flex-col max-h-[85vh]">
            <div className="relative h-64 flex-shrink-0">
              <img
                src={viewingImpact.image}
                className="w-full h-full object-cover"
                alt={viewingImpact.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setViewingImpact(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/40 transition-all"
              >
                <FaTimes />
              </button>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="px-3 py-1 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
                  {viewingImpact.category}
                </span>
                <h2 className="text-3xl font-black tracking-tight leading-none">
                  {viewingImpact.title}
                </h2>
              </div>
            </div>

            <div className="p-10 overflow-y-auto custom-scrollbar space-y-8">
              <div className="grid grid-cols-2 gap-6 pb-8 border-b border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    TIMELINE
                  </p>
                  <p className="font-bold text-slate-700">
                    {viewingImpact.dates}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    LOCATION
                  </p>
                  <p className="font-bold text-slate-700">
                    {viewingImpact.location || "National"}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Story Highlights
                </h3>
                <p className="p-6 bg-slate-50 rounded-2xl italic border-l-4 border-blue-500">
                  {viewingImpact.description}
                </p>
                <div className="whitespace-pre-wrap pt-4">
                  {viewingImpact.details}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Verified Metrics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 text-center">
                    <p className="text-[10px] font-black text-blue-400 uppercase mb-1">
                      Participants
                    </p>
                    <p className="text-xl font-black text-blue-600">
                      {viewingImpact.metrics?.participants || 0}
                    </p>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 text-center">
                    <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">
                      Projects
                    </p>
                    <p className="text-xl font-black text-emerald-600">
                      {viewingImpact.metrics?.projects || 0}
                    </p>
                  </div>
                  <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 text-center">
                    <p className="text-[10px] font-black text-amber-500 uppercase mb-1">
                      Impact Score
                    </p>
                    <p className="text-xl font-black text-amber-600 font-mono text-xs">
                      {viewingImpact.metrics?.impact || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-4">
                {hasPermission("impact_update") && (
                  <button
                    onClick={() => {
                      setViewingImpact(null);
                      handleEdit(viewingImpact);
                    }}
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] tracking-widest hover:bg-slate-200 transition-all uppercase"
                  >
                    EDIT STORY
                  </button>
                )}
                <button
                  onClick={() => setViewingImpact(null)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] tracking-widest hover:bg-blue-700 transition-all uppercase shadow-lg shadow-blue-500/20"
                >
                  CLOSE VIEW
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminImpacts;
