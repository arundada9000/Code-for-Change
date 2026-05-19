import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FaPlus,
  FaRegTrashAlt,
  FaTimes,
  FaCloudUploadAlt,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaGithub,
  FaGlobe,
} from "react-icons/fa";
import { BsThreeDotsVertical, BsPencil } from "react-icons/bs";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";
import { useAuth } from "../../Context/AuthContext";
import DebouncedSearchInput from "../../Components/UI/DebouncedSearchInput";
import { compressImage } from "../../utils/imageCompressor";

const InputField = React.memo(({ label, value, onChange, placeholder, required = false }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
      {label}
    </label>
    <input
      type="text"
      required={required}
      placeholder={placeholder}
      className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all"
      value={value}
      onChange={onChange}
    />
  </div>
));

export default function AdminTeam() {
  const { hasPermission } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const fileInputRef = useRef(null);

  const [openMenuId, setOpenMenuId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    type: "Core Team",
    imageFile: null,
    imagePreview: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
      github: "",
      website: "",
    }
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        event.target.closest("[data-menu-dropdown]") ||
        event.target.closest("[data-menu-trigger]")
      ) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/team", {
        params: filterType ? { type: filterType } : {}
      });
      setItems(data.data || []);
    } catch (error) {
      console.error("Failed to fetch team", error);
      toast.error("Failed to load national team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [filterType]);

  const handleFile = async (file) => {
    if (file && file.type.startsWith("image/")) {
      const { file: compressedFile } = await compressImage(file);
      const fileToUse = compressedFile || file;
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageFile: fileToUse,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(fileToUse);
    } else {
      toast.error("Please upload a valid image file.");
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        designation: item.designation,
        type: item.type,
        imageFile: null,
        imagePreview: item.image || "",
        socialLinks: {
          linkedin: item.socialLinks?.linkedin || "",
          twitter: item.socialLinks?.twitter || "",
          facebook: item.socialLinks?.facebook || "",
          instagram: item.socialLinks?.instagram || "",
          github: item.socialLinks?.github || "",
          website: item.socialLinks?.website || "",
        }
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        designation: "",
        type: filterType || "Core Team",
        imageFile: null,
        imagePreview: "",
        socialLinks: { linkedin: "", twitter: "", facebook: "", instagram: "", github: "", website: "" }
      });
    }
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await API.delete(`/team/${itemToDelete._id || itemToDelete.id}`);
      setItems((prev) => prev.filter(i => (i._id || i.id) !== (itemToDelete._id || itemToDelete.id)));
      toast.success("Team member deleted");
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error("Failed to delete member");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("designation", formData.designation);
    data.append("type", formData.type);
    data.append("socialLinks", JSON.stringify(formData.socialLinks));
    if (formData.imageFile) {
      data.append("image", formData.imageFile);
    }

    try {
      if (editingItem) {
        await API.put(`/team/${editingItem._id || editingItem.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Member updated!");
      } else {
        await API.post("/team", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Member added!");
      }
      setIsModalOpen(false);
      fetchTeam();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save member");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.designation.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            National Team Management
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            Manage Core Team, Board Members & Advisors
          </p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 font-black text-[10px] uppercase tracking-widest"
        >
          <FaPlus className="text-lg" /> Add Member
        </button>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 mb-6">
         <select
           className="w-full md:w-64 px-4 py-3 bg-gray-50 border border-transparent focus:border-gray-200 rounded-xl outline-none text-gray-700 font-semibold text-xs transition-all cursor-pointer"
           value={filterType}
           onChange={(e) => setFilterType(e.target.value)}
          >
           <option value="">All Types</option>
           <option value="Core Team">Core Team</option>
           <option value="Board Member">Board Member</option>
           <option value="Advisor">Advisor</option>
         </select>
         <DebouncedSearchInput
           placeholder="Search by name or designation..."
           className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-gray-200 rounded-xl outline-none text-gray-700 font-medium text-sm transition-all"
           value={search}
           onSearch={setSearch}
         />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="p-10 text-center text-slate-400 font-bold">
            Loading team members...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-bold">
            No team members found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
            {filteredItems.map((item) => (
              <div
                key={item._id || item.id}
                className="group relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 transition-all hover:shadow-xl"
              >
                <div className="flex justify-center h-48 bg-slate-200 overflow-hidden relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      className="w-full h-full object-cover filter group-hover:scale-105 transition-transform duration-500"
                      alt={item.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 font-bold">No Image</div>
                  )}
                  
                  {/* Actions Dropdown */}
                  <div className="absolute top-2 right-2">
                    <button
                      data-menu-trigger
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === (item._id || item.id) ? null : (item._id || item.id));
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur border border-slate-200 text-slate-500 hover:text-emerald-600 transition-colors shadow-sm"
                    >
                      <BsThreeDotsVertical />
                    </button>
                    {openMenuId === (item._id || item.id) && (
                      <div data-menu-dropdown className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-2 border-emerald-100 animate-in fade-in zoom-in duration-200">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="w-full px-4 py-2 text-left flex items-center gap-3 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <BsPencil /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(item);
                            setDeleteModalOpen(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left flex items-center gap-3 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <FaRegTrashAlt /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 flex flex-col items-center text-center">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
                    {item.type}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight mb-1">
                    {item.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mb-4">{item.designation}</p>
                  
                  <div className="flex gap-2">
                     {item.socialLinks?.linkedin && <a href={item.socialLinks.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-[#0077b5] hover:text-white transition-colors"><FaLinkedin /></a>}
                     {item.socialLinks?.twitter && <a href={item.socialLinks.twitter} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-[#1DA1F2] hover:text-white transition-colors"><FaTwitter /></a>}
                     {item.socialLinks?.facebook && <a href={item.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-[#1877F2] hover:text-white transition-colors"><FaFacebook /></a>}
                     {item.socialLinks?.instagram && <a href={item.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-[#E1306C] hover:text-white transition-colors"><FaInstagram /></a>}
                     {item.socialLinks?.github && <a href={item.socialLinks.github} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-[#333] hover:text-white transition-colors"><FaGithub /></a>}
                     {item.socialLinks?.website && <a href={item.socialLinks.website} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-emerald-600 hover:text-white transition-colors"><FaGlobe /></a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-10 py-8 border-b border-slate-50 flex-shrink-0">
               <div>
                 <h3 className="text-xl font-black text-slate-950 tracking-tight">
                   {editingItem ? "Edit Team Member" : "Add Team Member"}
                 </h3>
               </div>
               <button
                 onClick={() => setIsModalOpen(false)}
                 className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 transition-all"
               >
                 <FaTimes />
               </button>
             </div>

             <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8">
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                   <InputField
                     label="Full Name"
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     required
                     placeholder="e.g. John Doe"
                   />
                   
                   <InputField
                     label="Designation/Role"
                     value={formData.designation}
                     onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                     required
                     placeholder="e.g. Project Manager, UI/UX Designer"
                   />

                   <div className="space-y-1.5">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
                       Member Type
                     </label>
                     <select
                       required
                       className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all cursor-pointer"
                       value={formData.type}
                       onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                     >
                       <option value="Core Team">Core Team</option>
                       <option value="Board Member">Board Member</option>
                       <option value="Advisor">Advisor</option>
                     </select>
                   </div>
                 </div>

                 {/* Image Upload */}
                 <div
                   onDragOver={onDragOver}
                   onDragLeave={onDragLeave}
                   onDrop={onDrop}
                   onClick={() => fileInputRef.current?.click()}
                   className={`relative border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden h-full min-h-[250px] ${
                     isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-emerald-500"
                   }`}
                 >
                   <input
                     type="file"
                     className="hidden"
                     ref={fileInputRef}
                     accept="image/*"
                     onChange={(e) => handleFile(e.target.files[0])}
                   />
                   {formData.imagePreview ? (
                     <>
                       <img src={formData.imagePreview} className="w-full h-full object-cover" alt="Preview" />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-bold gap-2">
                         <FaCloudUploadAlt /> Change Photo
                       </div>
                     </>
                   ) : (
                     <div className="text-center p-6 text-slate-400">
                       <FaCloudUploadAlt className="text-4xl mx-auto mb-2" />
                       <p className="text-xs font-black uppercase tracking-widest">Drop photo here</p>
                     </div>
                   )}
                 </div>
               </div>

               {/* Social Links */}
               <div className="pt-6 border-t border-slate-100">
                 <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Social Links (Optional)</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {Object.keys(formData.socialLinks).map((platform) => (
                     <div className="space-y-1.5" key={platform}>
                       <label className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest ml-4">
                         {platform === 'linkedin' ? <FaLinkedin/> : null}
                         {platform === 'twitter' ? <FaTwitter/> : null}
                         {platform === 'facebook' ? <FaFacebook/> : null}
                         {platform === 'instagram' ? <FaInstagram/> : null}
                         {platform === 'github' ? <FaGithub/> : null}
                         {platform === 'website' ? <FaGlobe/> : null}
                         {platform} URL
                       </label>
                       <input
                         type="url"
                         placeholder={`https://${platform}.com/...`}
                         className="w-full px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-xs transition-all"
                         value={formData.socialLinks[platform]}
                         onChange={(e) => setFormData({
                           ...formData,
                           socialLinks: { ...formData.socialLinks, [platform]: e.target.value }
                         })}
                       />
                     </div>
                   ))}
                 </div>
               </div>

               <div className="pt-4">
                 <button
                   type="submit"
                   disabled={submitting}
                   className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50"
                 >
                   {submitting ? "Saving..." : "Save Team Member"}
                 </button>
               </div>
             </form>

          </div>
        </div>
      )}

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Member"
        message="Are you sure you want to delete this team member? This action cannot be undone."
      />
    </div>
  );
}
