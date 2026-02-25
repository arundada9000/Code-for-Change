import React, { useState, useRef, useEffect } from "react";
import { 
  FaPlus, FaSearch, FaFileAlt, FaCheckCircle, FaTimes, 
  FaCloudUploadAlt, FaHistory, FaBullseye, FaChartBar,
  FaGraduationCap, FaBook, FaDownload, FaTrash, FaEdit, FaEye
} from "react-icons/fa";
import { BsThreeDotsVertical, BsPencil, BsTrash } from "react-icons/bs";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";

const InputField = React.memo(({ label, value, onChange, type = "text", required = false, placeholder, name }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">{label}</label>
    <input
      type={type}
      name={name}
      required={required}
      placeholder={placeholder}
      className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all"
      value={value}
      onChange={onChange}
    />
  </div>
));

const SelectField = React.memo(({ label, value, onChange, options, required = false, name }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">{label}</label>
    <select
      name={name}
      required={required}
      className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all appearance-none"
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
));

const TextAreaField = React.memo(({ label, value, onChange, rows = 3, required = false, placeholder, name }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">{label}</label>
    <textarea
      name={name}
      rows={rows}
      required={required}
      placeholder={placeholder}
      className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all resize-none"
      value={value}
      onChange={onChange}
    />
  </div>
));

function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [viewingResource, setViewingResource] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    semester: "First",
    subject: "",
    type: "notes",
    fileUrl: "",
    uploadedBy: "Admin",
    isApproved: true,
    file: null
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await API.get("/resources");
      setResources(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      toast.error("Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, file: files[0] }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      semester: "First",
      subject: "",
      type: "notes",
      fileUrl: "",
      uploadedBy: "Admin",
      isApproved: true,
      file: null
    });
    setEditingResource(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'file') {
          if (formData[key]) data.append('file', formData[key]);
        } else {
          data.append(key, formData[key]);
        }
      });

      if (editingResource) {
        await API.put(`/resources/${editingResource._id}`, data);
        toast.success("Resource updated successfully");
      } else {
        await API.post("/resources", data);
        toast.success("Resource created successfully");
      }
      setIsModalOpen(false);
      resetForm();
      fetchResources();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save resource");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title || "",
      description: resource.description || "",
      semester: resource.semester || "First",
      subject: resource.subject || "",
      type: resource.type || "notes",
      fileUrl: resource.fileUrl || "",
      uploadedBy: resource.uploadedBy || "Admin",
      isApproved: resource.isApproved ?? true,
      file: null
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/resources/${resourceToDelete._id}`);
      toast.success("Resource deleted successfully");
      setDeleteModalOpen(false);
      fetchResources();
    } catch (error) {
      toast.error("Failed to delete resource");
    }
  };

  const toggleApproval = async (resource) => {
    try {
      await API.put(`/resources/${resource._id}`, { isApproved: !resource.isApproved });
      toast.success(`Resource ${!resource.isApproved ? 'approved' : 'unapproved'} successfully`);
      fetchResources();
    } catch (error) {
      toast.error("Failed to update approval status");
    }
  };

  const filteredResources = resources.filter(res => 
    res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tightests mb-2">Academic <span className="text-emerald-600">Resources</span></h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Manage notes, assignments & projects</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group"
        >
          <FaPlus className="group-hover:rotate-90 transition-transform" /> ADD RESOURCE
        </button>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 relative">
          <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or subject..."
            className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-3xl outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Resources</p>
            <p className="text-2xl font-black text-primary">{resources.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FaBook />
          </div>
        </div>
      </div>

      {/* Resource Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-8 py-5">Resource Info</th>
                <th className="px-8 py-5">Type / Semester</th>
                <th className="px-8 py-5">Downloads</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredResources.map((res) => (
                <tr key={res._id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        res.type === 'notes' ? 'bg-blue-50 text-blue-600' : 
                        res.type === 'assignment' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        <FaFileAlt size={18} />
                      </div>
                      <div>
                        <div className="font-black text-gray-900 leading-none">{res.title}</div>
                        <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{res.subject}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-600 uppercase tracking-widest">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-[9px] mr-2">{res.type}</span>
                    <span className="text-[10px]">{res.semester} Sem</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-600 font-black">
                      <FaDownload size={10} className="text-slate-400" />
                      {res.downloads || 0}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => toggleApproval(res)}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                        res.isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {res.isApproved ? 'APPROVED' : 'PENDING'}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setViewingResource(res)} 
                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button onClick={() => handleEdit(res)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90">
                        <FaEdit />
                      </button>
                      <button onClick={() => { setResourceToDelete(res); setDeleteModalOpen(true); }} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredResources.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-black uppercase tracking-[0.2em]">
              No resources found
            </div>
          )}
        </div>
      )}

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden relative shadow-2xl animate-modal-in flex flex-col">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-3xl font-black text-primary tracking-tight">
                  {editingResource ? "Edit" : "Add New"} <span className="text-emerald-600">Resource</span>
                </h2>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Fill in the details below</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              <InputField label="Resource Title" name="title" value={formData.title} onChange={handleInputChange} required placeholder="e.g., C Programming Notes" />
              
              <div className="grid grid-cols-2 gap-6">
                <InputField label="Subject" name="subject" value={formData.subject} onChange={handleInputChange} required placeholder="e.g., Programming Fundamentals" />
                <SelectField 
                  label="Type" 
                  name="type"
                  value={formData.type} 
                  onChange={handleInputChange}
                  options={[
                    { value: "notes", label: "Notes" },
                    { value: "assignment", label: "Assignment" },
                    { value: "lab", label: "Lab Sheet" },
                    { value: "project", label: "Project" },
                    { value: "other", label: "Other" }
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <SelectField 
                  label="Semester" 
                  name="semester"
                  value={formData.semester} 
                  onChange={handleInputChange}
                  options={[
                    { value: "First", label: "1st Semester" },
                    { value: "Second", label: "2nd Semester" },
                    { value: "Third", label: "3rd Semester" },
                    { value: "Fourth", label: "4th Semester" },
                    { value: "Fifth", label: "5th Semester" },
                    { value: "Sixth", label: "6th Semester" },
                    { value: "Seventh", label: "7th Semester" },
                    { value: "Eighth", label: "8th Semester" }
                  ]}
                />
                <InputField label="Uploaded By" name="uploadedBy" value={formData.uploadedBy} onChange={handleInputChange} required />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <FaCloudUploadAlt size={16} />
                  </div>
                  <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em]">Resource File</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Direct File Upload (Optional)</label>
                    <input 
                      type="file" 
                      onChange={handleInputChange}
                      className="w-full px-6 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    <p className="text-[9px] text-slate-400 font-bold ml-4 uppercase tracking-tighter">* Uploading a file will overwrite the external link below.</p>
                  </div>

                  <InputField 
                    label="External File Link (Optional)" 
                    name="fileUrl" 
                    value={formData.fileUrl} 
                    onChange={handleInputChange} 
                    placeholder="https://drive.google.com/..." 
                  />
                </div>
              </div>
              
              <TextAreaField label="Brief Description" name="description" value={formData.description} onChange={handleInputChange} required placeholder="Briefly explain what this resource contains..." />

              <div className="flex items-center gap-4 ml-4">
                <input
                  type="checkbox"
                  id="isApproved"
                  name="isApproved"
                  className="w-5 h-5 accent-emerald-600"
                  checked={formData.isApproved}
                  onChange={handleInputChange}
                />
                <label htmlFor="isApproved" className="text-xs font-black text-slate-500 uppercase tracking-widest">Mark as Approved (Visible to Users)</label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
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
                  className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:bg-emerald-300"
                >
                  {submitting ? "SAVING..." : (editingResource ? "UPDATE RESOURCE" : "SAVE RESOURCE")}
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
        title="Delete Academic Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
      />

      {/* Quick View Modal */}
      {viewingResource && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setViewingResource(null)} />
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden relative shadow-2xl animate-modal-in flex flex-col max-h-[85vh]">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
               <div className="flex items-center gap-6">
                 <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl ${
                   viewingResource.type === 'notes' ? 'bg-blue-50 text-blue-600' : 
                   viewingResource.type === 'assignment' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
                 }`}>
                   <FaFileAlt />
                 </div>
                 <div>
                   <span className="px-3 py-1 bg-emerald-600/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
                     {viewingResource.type}
                   </span>
                   <h2 className="text-2xl font-black text-primary tracking-tight leading-none">{viewingResource.title}</h2>
                 </div>
               </div>
               <button onClick={() => setViewingResource(null)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                 <FaTimes />
               </button>
            </div>
            
            <div className="p-10 overflow-y-auto custom-scrollbar space-y-8">
              <div className="grid grid-cols-2 gap-6 pb-8 border-b border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SUBJECT / SEMESTER</p>
                  <p className="font-bold text-slate-700">{viewingResource.subject} — {viewingResource.semester} Sem</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UPLOADED BY</p>
                  <p className="font-bold text-slate-700">{viewingResource.uploadedBy}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Resource Description</h3>
                <div className="p-6 bg-slate-50 rounded-2xl text-slate-600 leading-relaxed font-medium">
                  {viewingResource.description || "No description provided."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</h3>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    viewingResource.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {viewingResource.isApproved ? <FaCheckCircle /> : <FaTimes />}
                    {viewingResource.isApproved ? 'Approved Resource' : 'Pending Review'}
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Usage</h3>
                  <div className="inline-flex items-center gap-2 text-slate-400 font-black">
                     <FaDownload size={14} />
                     <span className="text-xl text-primary">{viewingResource.downloads || 0} Downloads</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end gap-3">
                <button 
                  onClick={() => { setViewingResource(null); handleEdit(viewingResource); }}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] tracking-widest hover:bg-slate-200 transition-all uppercase"
                >
                  EDIT RESOURCE
                </button>
                {viewingResource.fileUrl && (
                  <a 
                    href={viewingResource.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 uppercase inline-flex items-center gap-2"
                  >
                    <FaDownload /> DOWNLOAD FILE
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminResources;
