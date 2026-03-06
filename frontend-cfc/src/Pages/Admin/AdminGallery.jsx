import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus,
  FaSearch,
  FaRegTrashAlt,
  FaTimes,
  FaCloudUploadAlt,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";
import { useAuth } from "../../Context/AuthContext";

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
  ),
);

function AdminGallery() {
  const { hasPermission } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [filterProvince, setFilterProvince] = useState("all");
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
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Workshops",
    imageFile: null,
    imagePreview: "",
    isFeatured: false,
    province: "",
  });

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterProvince !== "all") params.append("province", filterProvince);

      const { data } = await API.get(`/gallery?${params.toString()}`);
      setItems(data.data || []);
    } catch (error) {
      console.error("Failed to fetch gallery", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [filterProvince]);

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result,
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
        title: item.title,
        category: item.category,
        imageFile: null,
        imagePreview: item.imageUrl,
        isFeatured: item.isFeatured,
        province: item.province || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        category: "Workshops",
        imageFile: null,
        imagePreview: "",
        isFeatured: false,
        province: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await API.delete(`/gallery/${itemToDelete._id || itemToDelete.id}`);
      setItems(
        items.filter(
          (item) =>
            (item._id || item.id) !== (itemToDelete._id || itemToDelete.id),
        ),
      );
      toast.success("Image deleted successfully");
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete gallery item", error);
      toast.error("Failed to delete image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageFile && !editingItem) {
      toast.error("Please select an image");
      return;
    }
    setSubmitting(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("category", formData.category);
    data.append("isFeatured", formData.isFeatured);
    data.append("province", formData.province);
    if (formData.imageFile) {
      data.append("image", formData.imageFile);
    }

    try {
      if (editingItem) {
        await API.put(`/gallery/${editingItem._id || editingItem.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Gallery item updated!");
      } else {
        await API.post("/gallery", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Image added to gallery!");
      }
      setIsModalOpen(false);
      fetchGallery();
    } catch (error) {
      console.error("Failed to save gallery item", error);
      toast.error(error.response?.data?.message || "Failed to save image");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center px-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Gallery Management
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            Manage Public Gallery Images
          </p>
          <select
            className="mt-4 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-[10px] font-black uppercase tracking-widest focus:bg-white"
            value={filterProvince}
            onChange={(e) => setFilterProvince(e.target.value)}
          >
            <option value="all">All Provinces</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        {hasPermission("gallery_create") && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 font-black text-[10px] uppercase tracking-widest"
          >
            <FaPlus className="text-lg" /> Add Image
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
        {loading ? (
          <div className="p-10 text-center text-slate-400 font-bold">
            Loading gallery items...
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-bold">
            No gallery items found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
            {items.map((item) => (
              <div
                key={item._id || item.id}
                className="group relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 transition-all hover:shadow-xl"
              >
                <img
                  src={item.imageUrl}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={item.title}
                />
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">
                    {item.category} • {item.province || "National"}
                  </p>
                </div>
                {/* Always visible action buttons on hover */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {hasPermission("gallery_update") && (
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-emerald-600 shadow-xl hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <BsThreeDotsVertical />
                    </button>
                  )}
                  {hasPermission("gallery_delete") && (
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
                  {editingItem ? "Edit Gallery Image" : "Add Gallery Image"}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {editingItem ? "Update existing asset" : "Upload New Asset"}
                </p>
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
                label="Image Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="e.g. Workshop Session"
              />

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
                  Category
                </label>
                <select
                  className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 transition-all"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option>Workshops</option>
                  <option>Events</option>
                  <option>Community</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
                  Region
                </label>
                <select
                  className="w-full px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 transition-all"
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

              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current.click()}
                className={`relative border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden min-h-[250px] ${
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
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-bold gap-2">
                      <FaCloudUploadAlt /> Change Image
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <FaCloudUploadAlt className="text-4xl mx-auto mb-2" />
                    <p className="text-xs font-black uppercase tracking-widest">
                      Drop gallery image here
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input
                  type="checkbox"
                  id="isFeaturedG"
                  className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                />
                <label
                  htmlFor="isFeaturedG"
                  className="text-xs font-black text-slate-700 uppercase tracking-widest cursor-pointer"
                >
                  Featured Image
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {submitting ? "Uploading..." : "Save Image"}
              </button>
            </form>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Image"
        message="Are you sure you want to delete this image from the gallery? This action cannot be undone."
      />
    </div>
  );
}

export default AdminGallery;
