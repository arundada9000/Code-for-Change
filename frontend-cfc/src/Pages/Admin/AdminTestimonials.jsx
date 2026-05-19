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
import { compressImage } from "../../utils/imageCompressor";

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

function AdminTestimonials() {
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
    author: "",
    role: "",
    text: "",
    order: 0,
    isActive: true,
    imageFile: null,
    imagePreview: "",
  });

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/testimonials/admin/all");
      setItems(data.data || []);
    } catch (error) {
      console.error("Failed to fetch testimonials", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

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
        author: item.author,
        role: item.role,
        text: item.text,
        order: item.order || 0,
        isActive: item.isActive,
        imageFile: null,
        imagePreview: item.image,
      });
    } else {
      setEditingItem(null);
      setFormData({
        author: "",
        role: "",
        text: "",
        order: 0,
        isActive: true,
        imageFile: null,
        imagePreview: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await API.delete(`/testimonials/${itemToDelete._id || itemToDelete.id}`);
      setItems(
        items.filter(
          (item) =>
            (item._id || item.id) !== (itemToDelete._id || itemToDelete.id)
        )
      );
      toast.success("Testimonial deleted successfully");
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete testimonial", error);
      toast.error("Failed to delete testimonial");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageFile && !editingItem && !formData.imagePreview) {
      toast.error("Please select an image");
      return;
    }
    setSubmitting(true);

    const data = new FormData();
    data.append("author", formData.author);
    data.append("role", formData.role);
    data.append("text", formData.text);
    data.append("order", formData.order);
    data.append("isActive", formData.isActive);
    if (formData.imageFile) {
      data.append("image", formData.imageFile);
    }

    try {
      if (editingItem) {
        await API.put(`/testimonials/${editingItem._id || editingItem.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Testimonial updated!");
      } else {
        await API.post("/testimonials", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Testimonial added!");
      }
      setIsModalOpen(false);
      fetchTestimonials();
    } catch (error) {
      console.error("Failed to save testimonial", error);
      toast.error(error.response?.data?.message || "Failed to save testimonial");
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
            Testimonials Management
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            Manage What Well-Wishers Say
          </p>
        </div>
        {hasPermission("testimonial:create") && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 font-black text-[10px] uppercase tracking-widest"
          >
            <FaPlus className="text-lg" /> Add Testimonial
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
        {loading ? (
          <div className="p-10 text-center text-slate-400 font-bold">
            Loading testimonials...
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-bold">
            No testimonials found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
            {items.map((item) => (
              <div
                key={item._id || item.id}
                className={`group relative rounded-2xl overflow-hidden border transition-all hover:shadow-xl ${
                  item.isActive ? "bg-slate-50 border-slate-100" : "bg-red-50 border-red-100"
                }`}
              >
                <div className="flex justify-center mt-4">
                  <img
                    src={item.image}
                    className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md transition-transform duration-500 group-hover:scale-110"
                    alt={item.author}
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-slate-900 line-clamp-1">
                    {item.author}
                  </h3>
                  <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">
                    {item.role}
                  </p>
                  <p className="text-sm text-slate-500 mt-3 line-clamp-3">
                    "{item.text}"
                  </p>
                </div>
                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {hasPermission("testimonial:update") && (
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-emerald-600 shadow-xl hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <BsThreeDotsVertical />
                    </button>
                  )}
                  {hasPermission("testimonial:delete") && (
                    <button
                      onClick={() => {
                        setItemToDelete(item);
                        setDeleteModalOpen(true);
                      }}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-rose-500 shadow-xl hover:bg-rose-500 hover:text-white transition-all"
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
                  {editingItem ? "Edit Testimonial" : "Add Testimonial"}
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
                label="Author Name"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                required
                placeholder="e.g. John Doe"
              />

              <InputField
                label="Role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                required
                placeholder="e.g. CEO at Generic Company"
              />

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
                  Testimonial Text
                </label>
                <textarea
                  required
                  placeholder="Write the testimonial here..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 font-medium text-sm transition-all min-h-[120px] resize-none"
                  value={formData.text}
                  onChange={(e) => setFormData({...formData, text: e.target.value})}
                ></textarea>
              </div>

              <InputField
                label="Display Order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: e.target.value })
                }
                placeholder="Lower number means higher priority (e.g. 0 or 1)"
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
                {formData.imagePreview ? (
                  <>
                    <img
                      src={formData.imagePreview}
                      className="w-full h-full object-contain"
                      alt="Preview"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-bold gap-2">
                      <FaCloudUploadAlt /> Change Profile Image
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <FaCloudUploadAlt className="text-4xl mx-auto mb-2" />
                    <p className="text-xs font-black uppercase tracking-widest">
                      Drop profile image here
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                <label
                  htmlFor="isActiveToggle"
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
                {submitting ? "Saving..." : "Save Testimonial"}
              </button>
            </form>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
      />
    </div>
  );
}

export default AdminTestimonials;
