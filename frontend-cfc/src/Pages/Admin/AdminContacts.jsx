import React, { useState, useEffect } from "react";
import { FaRegTrashAlt, FaEye, FaCheckDouble, FaRegEnvelope } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";
import MessageModal from "../../Components/UI/Modal/MessageModal";
import { useAuth } from "../../Context/AuthContext";
import { AdminTableSkeleton } from "../../Components/Loading/Skeleton";

// Reusable Message Modal for Contact Messages
function ContactMessageModal({ isOpen, onClose, contact }) {
  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900">{contact.subject}</h3>
              <p className="text-sm font-bold text-slate-500 mt-1">From: {contact.name} ({contact.email})</p>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Received: {new Date(contact.createdAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6 text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100 max-h-[60vh] overflow-y-auto">
            {contact.message}
          </div>
        </div>
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminContacts() {
  const { hasPermission } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewMessageContact, setViewMessageContact] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/contacts");
      let filtered = data.data || [];
      if (filterStatus === "unread") filtered = filtered.filter(c => !c.isRead);
      if (filterStatus === "read") filtered = filtered.filter(c => c.isRead);
      setContacts(filtered);
    } catch (error) {
      console.error("Failed to fetch contacts", error);
      toast.error("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [filterStatus]);

  const handleMarkAsRead = async (contact) => {
    if (contact.isRead) return; // Already read
    try {
      await API.patch(`/contacts/${contact._id || contact.id}/read`);
      setContacts((prev) =>
        prev.map((c) =>
          (c._id || c.id) === (contact._id || contact.id)
            ? { ...c, isRead: true }
            : c
        )
      );
      toast.success(`Message marked as read`);
    } catch (error) {
      toast.error("Failed to mark message as read");
    }
  };

  const handleViewMessage = (contact) => {
    setViewMessageContact(contact);
    if (!contact.isRead && hasPermission("contact:view")) {
      handleMarkAsRead(contact);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await API.delete(`/contacts/${itemToDelete._id || itemToDelete.id}`);
      setContacts((prev) =>
        prev.filter((c) => (c._id || c.id) !== (itemToDelete._id || itemToDelete.id))
      );
      toast.success("Message deleted successfully");
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const totalCount = contacts.length;
  const unreadCount = contacts.filter((c) => !c.isRead).length;

  if (loading && contacts.length === 0) return <AdminTableSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Contact Messages
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            View and manage user inquiries
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <FaRegEnvelope className="text-blue-600 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{totalCount}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
            <HiOutlineMail className="text-amber-500 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{unreadCount}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse text-amber-500">Unread</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-4">
        {["all", "unread", "read"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              filterStatus === tab
                ? "bg-slate-900 text-white shadow-lg"
                : "bg-white text-slate-500 border border-slate-100 hover:border-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 font-bold">Loading...</div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-300">
            <FaRegEnvelope className="text-6xl mb-4" />
            <p className="font-black uppercase tracking-widest text-sm">No messages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sender</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  {(hasPermission("contact:view") || hasPermission("contact:delete")) && (
                    <th className="text-right px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact._id || contact.id}
                    className={`border-b border-slate-50 transition-colors ${!contact.isRead ? "bg-amber-50/30 hover:bg-amber-50/60" : "hover:bg-slate-50/50"}`}
                  >
                    <td className="px-8 py-4">
                      <div className="flex flex-col">
                        <span className={`text-sm ${!contact.isRead ? "font-black text-slate-900" : "font-bold text-slate-700"}`}>
                          {contact.name}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">{contact.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="max-w-[200px] lg:max-w-[300px] truncate">
                        <span className={`text-sm ${!contact.isRead ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
                          {contact.subject}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          contact.isRead
                            ? "bg-slate-100 text-slate-500"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            contact.isRead ? "bg-slate-400" : "bg-amber-500"
                          }`}
                        />
                        {contact.isRead ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                      {new Date(contact.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    {(hasPermission("contact:view") || hasPermission("contact:delete")) && (
                      <td className="px-8 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {hasPermission("contact:view") && (
                            <button
                              onClick={() => handleViewMessage(contact)}
                              title="View Message"
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-500 border border-blue-100 hover:bg-blue-500 hover:text-white transition-all text-sm"
                            >
                              <FaEye />
                            </button>
                          )}
                          {hasPermission("contact:view") && !contact.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(contact)}
                              title="Mark as Read"
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all text-sm"
                            >
                              <FaCheckDouble />
                            </button>
                          )}
                          {hasPermission("contact:delete") && (
                            <button
                              onClick={() => {
                                setItemToDelete(contact);
                                setDeleteModalOpen(true);
                              }}
                              title="Delete"
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all text-sm"
                            >
                              <FaRegTrashAlt />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ContactMessageModal
        isOpen={!!viewMessageContact}
        onClose={() => setViewMessageContact(null)}
        contact={viewMessageContact}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Message"
        message="Are you sure you want to permanently delete this message? This action cannot be undone."
      />
    </div>
  );
}

export default AdminContacts;
