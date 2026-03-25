import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus,
  FaRegTrashAlt,
  FaTimes,
  FaCloudUploadAlt,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";
import { useAuth } from "../../Context/AuthContext";
import { AdminTableSkeleton } from "../../Components/Loading/Skeleton";

const InputField = React.memo(
  ({
    label,
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
        required={required}
        placeholder={placeholder}
        className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all"
        value={value}
        onChange={onChange}
      />
    </div>
  )
);

function AdminSupporters() {
  const { hasPermission } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    order: 0,
    isActive: true,
    logoFile: null,
    logoPreview: "",
  });

  const fetchSupporters = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/supporters/admin/all");
      setItems(data.data || []);
    } catch (error) {
      console.error("Failed to fetch supporters", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupporters();
  }, []);

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          logoFile: file,
          logoPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a valid image file.");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        url: item.url || "",
        order: item.order || 0,
        isActive: item.isActive,
        logoFile: null,
        logoPreview: item.logo,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        url: "",
        order: 0,
        isActive: true,
        logoFile: null,
        logoPreview: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await API.delete(`/supporters/${itemToDelete._id || itemToDelete.id}`);
      setItems(
        items.filter(
          (item) =>
            (item._id || item.id) !== (itemToDelete._id || itemToDelete.id)
        )
      );
      toast.success("Supporter deleted successfully");
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete supporter", error);
      toast.error("Failed to delete supporter");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.logoFile && !editingItem && !formData.logoPreview) {
      toast.error("Please select a logo image");
      return;
    }
    setSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("url", formData.url);
    data.append("order", formData.order);
    data.append("isActive", formData.isActive);
    if (formData.logoFile) {
      data.append("logo", formData.logoFile);
    }

    try {
      if (editingItem) {
        await API.put(`/supporters/${editingItem._id || editingItem.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Supporter updated!");
      } else {
        await API.post("/supporters", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Supporter added!");
      }
      setIsModalOpen(false);
      fetchSupporters();
    } catch (error) {
      console.error("Failed to save supporter", error);
      toast.error(error.response?.data?.message || "Failed to save supporter");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && items.length === 0) return <AdminTableSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center px-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Supporters & Partners
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            Manage Organizations That Support Us
          </p>
        </div>
        {hasPermission("supporter:create") && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 font-black text-[10px] uppercase tracking-widest"
          >
            <FaPlus className="text-lg" /> Add Supporter
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
        {loading ? (
          <div className="p-10 text-center text-slate-400 font-bold">
            Loading supporters...
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-bold">
            No supporters found.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-8">
            {items.map((item) => (
              <div
                key={item._id || item.id}
                className={`group relative rounded-2xl overflow-hidden border p-4 transition-all hover:shadow-xl ${
                  item.isActive ? "bg-slate-50 border-slate-100" : "bg-red-50 border-red-100"
                }`}
              >
                <div className="flex justify-center h-24 mt-2">
                  <img
                    src={item.logo}
                    className="max-w-full max-h-full object-contain filter group-hover:brightness-110 transition-all duration-300"
                    alt={item.name}
                  />
                </div>
                <div className="pt-4 text-center mt-auto">
                  <h3 className="font-bold text-slate-900 line-clamp-1">
                    {item.name}
                  </h3>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1 hover:underline">
                      Website
                    </a>
                  )}
                </div>
                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {hasPermission("supporter:update") && (
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-emerald-600 shadow-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                    >
                      <BsThreeDotsVertical />
                    </button>
                  )}
                  {hasPermission("supporter:delete") && (
                    <button
                      onClick={() => {
                        setItemToDelete(item);
                        setDeleteModalOpen(true);
                      }}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-rose-500 shadow-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                    >
                      <FaRegTrashAlt />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-10 py-8 border-b border-slate-50 flex-shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-950 tracking-tight">
                  {editingItem ? "Edit Supporter" : "Add Supporter"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 transition-all"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-10 space-y-6 overflow-y-auto"
            >
              <InputField
                label="Supporter Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="e.g. Acme Corporation"
              />

              <InputField
                label="Website URL (Optional)"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="e.g. https://www.acme.com"
              />

              <InputField
                label="Display Order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: e.target.value })
                }
                placeholder="Lower number means higher priority"
              />

              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current.click()}
                className={`relative border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden min-h-[200px] ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-slate-50 hover:border-emerald-500"
                }`}
              >
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                {formData.logoPreview ? (
                  <>
                    <img
                      src={formData.logoPreview}
                      className="w-full h-full object-contain"
                      alt="Preview"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-bold gap-2">
                      <FaCloudUploadAlt /> Change Logo
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <FaCloudUploadAlt className="text-4xl mx-auto mb-2" />
                    <p className="text-xs font-black uppercase tracking-widest">
                      Drop logo image here
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input
                  type="checkbox"
                  id="isActiveToggleS"
                  className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                <label
                  htmlFor="isActiveToggleS"
                  className="text-xs font-black text-slate-700 uppercase tracking-widest cursor-pointer"
                >
                  Active / Visible
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Supporter"}
              </button>
            </form>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Supporter"
        message="Are you sure you want to delete this supporter? This action cannot be undone."
      />
    </div>
  );
}

export default AdminSupporters;
