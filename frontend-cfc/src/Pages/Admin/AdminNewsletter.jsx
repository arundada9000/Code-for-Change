import React, { useState, useEffect } from "react";
import { FaRegTrashAlt, FaFileDownload, FaFileCode } from "react-icons/fa";
import { MdMarkEmailRead, MdUnsubscribe } from "react-icons/md";
import { HiOutlineMail } from "react-icons/hi";
import API from "../../Services/api";
import { toast } from "react-hot-toast";
import DeleteModal from "../../Components/UI/Modal/DeleteModal";
import { useAuth } from "../../Context/AuthContext";
import { AdminTableSkeleton } from "../../Components/Loading/Skeleton";

function AdminNewsletter() {
  const { hasPermission } = useAuth();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== "all" ? { status: filterStatus } : {};
      const { data } = await API.get("/newsletter", { params });
      setSubscribers(data.data || []);
    } catch (error) {
      console.error("Failed to fetch subscribers", error);
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [filterStatus]);

  const handleStatusToggle = async (subscriber) => {
    const newStatus =
      subscriber.status === "active" ? "unsubscribed" : "active";
    try {
      await API.patch(`/newsletter/${subscriber._id || subscriber.id}`, {
        status: newStatus,
      });
      setSubscribers((prev) =>
        prev.map((s) =>
          (s._id || s.id) === (subscriber._id || subscriber.id)
            ? { ...s, status: newStatus }
            : s,
        ),
      );
      toast.success(
        `Subscriber ${newStatus === "active" ? "reactivated" : "unsubscribed"}`,
      );
    } catch (error) {
      toast.error("Failed to update subscriber status");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await API.delete(`/newsletter/${itemToDelete._id || itemToDelete.id}`);
      setSubscribers((prev) =>
        prev.filter(
          (s) => (s._id || s.id) !== (itemToDelete._id || itemToDelete.id),
        ),
      );
      toast.success("Subscriber deleted successfully");
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error("Failed to delete subscriber");
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const response = await API.get(`/newsletter/export`, {
        params: { format },
        responseType: "blob",
      });
      const mimeType = format === "json" ? "application/json" : "text/csv";
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `newsletter-subscribers-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const activeCount = subscribers.filter((s) => s.status === "active").length;
  const unsubscribedCount = subscribers.filter(
    (s) => s.status === "unsubscribed",
  ).length;

  if (loading && subscribers.length === 0) return <AdminTableSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Newsletter Subscribers
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            Manage and Export Email Subscribers
          </p>
        </div>
        {hasPermission("newsletter:view") && (
          <div className="flex gap-3">
            <button
              onClick={() => handleExport("csv")}
              disabled={exporting}
              className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 font-black text-[10px] uppercase tracking-widest disabled:opacity-60"
            >
              <FaFileDownload className="text-base" />
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
            <button
              onClick={() => handleExport("json")}
              disabled={exporting}
              className="flex items-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-2xl hover:bg-slate-900 transition-all shadow-lg font-black text-[10px] uppercase tracking-widest disabled:opacity-60"
            >
              <FaFileCode className="text-base" />
              Export JSON
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 px-4">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <HiOutlineMail className="text-blue-600 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {subscribers.length}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total
            </p>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <MdMarkEmailRead className="text-emerald-600 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{activeCount}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Active
            </p>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
            <MdUnsubscribe className="text-rose-500 text-xl" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {unsubscribedCount}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Unsubscribed
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-4">
        {["all", "active", "unsubscribed"].map((tab) => (
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
          <div className="p-10 text-center text-slate-400 font-bold">
            Loading...
          </div>
        ) : subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-300">
            <HiOutlineMail className="text-6xl mb-4" />
            <p className="font-black uppercase tracking-widest text-sm">
              No subscribers found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    #
                  </th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Email
                  </th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Subscribed At
                  </th>
                  {(hasPermission("newsletter:update") ||
                    hasPermission("newsletter:delete")) && (
                    <th className="text-right px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber, index) => (
                  <tr
                    key={subscriber._id || subscriber.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-4 text-sm font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                          <HiOutlineMail className="text-blue-500 text-sm" />
                        </div>
                        <span className="font-bold text-slate-800 text-sm">
                          {subscriber.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          subscriber.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            subscriber.status === "active"
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        />
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-500 font-medium">
                      {new Date(
                        subscriber.subscribedAt || subscriber.createdAt,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    {(hasPermission("newsletter:update") ||
                      hasPermission("newsletter:delete")) && (
                      <td className="px-8 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {hasPermission("newsletter:update") && (
                            <button
                              onClick={() => handleStatusToggle(subscriber)}
                              title={
                                subscriber.status === "active"
                                  ? "Unsubscribe"
                                  : "Reactivate"
                              }
                              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all border text-sm ${
                                subscriber.status === "active"
                                  ? "bg-orange-50 text-orange-500 border-orange-100 hover:bg-orange-500 hover:text-white"
                                  : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white"
                              }`}
                            >
                              {subscriber.status === "active" ? (
                                <MdUnsubscribe />
                              ) : (
                                <MdMarkEmailRead />
                              )}
                            </button>
                          )}
                          {hasPermission("newsletter:delete") && (
                            <button
                              onClick={() => {
                                setItemToDelete(subscriber);
                                setDeleteModalOpen(true);
                              }}
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

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Subscriber"
        message="Are you sure you want to permanently delete this subscriber? This action cannot be undone."
      />
    </div>
  );
}

export default AdminNewsletter;
