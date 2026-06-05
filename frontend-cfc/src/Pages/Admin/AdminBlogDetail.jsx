import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, FaCalendarAlt, FaUserEdit, FaTrash, 
  FaExternalLinkAlt, FaClock, FaTag, FaParagraph
} from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import DOMPurify from "dompurify";
import API from "../../Services/api";
import { toast } from "react-hot-toast";

function AdminBlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogDetails();
  }, [id]);

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/blogs/${id}`);
      if (res.data.success) {
        setBlog(res.data.data);
      }
    } catch (error) {
      console.error("Fetch blog error:", error);
      toast.error("Failed to load blog details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="text-xl font-black text-slate-800 tracking-widest flex items-center gap-3">
          <span className="text-emerald-500 animate-pulse">{"<"}</span>
          <span className="animate-pulse text-slate-300">Loading...</span>
          <span className="text-emerald-500 animate-pulse">{"/>"}</span>
        </div>
        <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Retrieving blog data...</p>
      </div>
    </div>
  );

  if (!blog) return (
    <div className="text-center p-20">
      <h2 className="text-2xl font-black text-slate-900 italic">Blog article not found.</h2>
      <button onClick={() => navigate(-1)} className="mt-4 text-emerald-600 font-bold underline">Go Back</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 hover:bg-slate-900 transition-all shadow-sm"
        >
          <FaArrowLeft className="text-emerald-600 group-hover:text-white transition-colors" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-900 group-hover:text-white transition-colors">Blogs List</span>
        </button>
        
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-orange-50 text-orange-600">
            {blog.category || 'General'}
          </span>
          <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white">
            {blog.status || 'Published'}
          </span>
        </div>
      </div>

      {/* Hero Content */}
      <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm">
        <div className="relative h-96 overflow-hidden">
          <img 
            src={blog.bannerImage || blog.image} 
            alt={blog.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-10 left-10 right-10">
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-4">{blog.title}</h1>
            <div className="flex items-center gap-4 text-white/80 text-sm font-bold">
              <span className="flex items-center gap-2"><FaCalendarAlt className="text-emerald-400" /> {new Date(blog.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-2"><FaClock className="text-emerald-400" /> {blog.readTime || '5 min'} read</span>
            </div>
          </div>
        </div>
        
        <div className="p-12 space-y-8">
            <div className="flex flex-wrap gap-4">
              <a 
                href={`/blog/${blog._id}-${blog.slug}`} 
                target="_blank" 
                className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200"
              >
                View Live Article <FaExternalLinkAlt />
              </a>
              <button className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">
                <FaUserEdit size={16} /> Edit Article
              </button>
              <button className="flex items-center gap-2 bg-rose-50 text-rose-600 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all ml-auto">
                <FaTrash size={14} /> Delete
              </button>
            </div>
        </div>
      </div>

      {/* Content Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600">
              <FaTag />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Metadata</h3>
          </div>
          <div className="space-y-4">
             <div className="flex flex-wrap gap-2">
               {(blog.tags || []).map(tag => (
                 <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100 italic">#{tag}</span>
               ))}
             </div>
             <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Author</p>
              <p className="text-sm font-black text-slate-900">{blog.author}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600">
              <FaParagraph />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Content Stats</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-bold text-slate-800">
               <span className="text-slate-400">Word Count</span>
               <span>{blog.content?.split(' ').length || 0} words</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-slate-800">
               <span className="text-slate-400">SEO Score</span>
               <span className="text-emerald-500">Premium 92/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Body Preview */}
      <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm space-y-8">
        <h3 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-3">
          <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
          Article Content
        </h3>
        <div 
          className="prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
        />
      </div>

      <div className="p-8 text-center text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-40">
        Internal Communication Record • Admin Blog System v2.0
      </div>
    </div>
  );
}

export default AdminBlogDetail;
