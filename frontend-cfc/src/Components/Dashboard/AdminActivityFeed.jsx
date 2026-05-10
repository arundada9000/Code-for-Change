import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEllipsisV, FaSyncAlt } from 'react-icons/fa';
import API from '../../Services/api';
import toast from 'react-hot-toast';

const AdminActivityFeed = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async (pageNumber) => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/activities?page=${pageNumber}&limit=20`);
      if (res.data?.success) {
        if (pageNumber === 1) {
          setActivities(res.data.data.activities);
        } else {
          setActivities(prev => [...prev, ...res.data.data.activities]);
        }
        setHasMore(res.data.data.hasMore);
      }
    } catch (error) {
      toast.error('Failed to load activity logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchActivities(nextPage);
    }
  };

  const getActionColor = (action) => {
    switch (action?.toUpperCase()) {
      case 'CREATE': return 'bg-secondary shadow-emerald-200 border-emerald-100';
      case 'UPDATE': return 'bg-blue-500 shadow-blue-200 border-blue-100';
      case 'DELETE': return 'bg-rose-500 shadow-rose-200 border-rose-100';
      case 'LOGIN': return 'bg-indigo-500 shadow-indigo-200 border-indigo-100';
      default: return 'bg-slate-400 shadow-slate-200 border-slate-100';
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">System Logs</h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Recent Administrator Actions</p>
        </div>
        <button 
          onClick={() => { setPage(1); fetchActivities(1); }} 
          className="p-2.5 bg-slate-50 hover:bg-slate-100 cursor-pointer rounded-xl text-slate-400 hover:text-secondary transition-all shadow-sm active:scale-95"
          title="Refresh Feed"
        >
          <FaSyncAlt size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-0 before:w-[1px] before:bg-slate-100 pl-1">
        {activities.map((log, index) => (
          <div
            key={log._id || index}
            className="relative flex gap-6 z-10 group/log cursor-pointer hover:bg-slate-50/50 p-2 -ml-2 rounded-xl transition-colors"
            onClick={() => {
              if (log.userId) navigate(`/admin/user/${log.userId}`);
              else if (log.resourceId) {
                const path = log.resource?.toLowerCase().includes('event') ? 'event' :
                  log.resource?.toLowerCase().includes('blog') ? 'blog' : null;
                if (path) navigate(`/admin/${path}/${log.resourceId}`);
              }
            }}
          >
            {/* Timeline Dot */}
            <div className={`w-4 h-4 rounded-full mt-1.5 shrink-0 border-[3px] border-white shadow-sm ${getActionColor(log.action)} group-hover/log:scale-125 transition-transform duration-300`}></div>
            
            {/* Log Content */}
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between">
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  <span className="text-secondary group-hover/log:text-emerald-700 transition-colors">{log.userName || 'System'}</span> 
                  <span className="text-slate-400 font-medium px-1.5">{log.action?.toLowerCase()}d</span>
                  {log.resource}
                </p>
                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-full ml-2">
                  {new Date(log.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-2">{log.details}</p>
            </div>
          </div>
        ))}

        {activities.length === 0 && !loading && (
          <div className="text-center py-10 text-slate-400 text-sm font-medium italic">
            No recent activities found
          </div>
        )}
      </div>

      {hasMore && (
        <div className="pt-6 mt-auto border-t border-slate-50">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-secondary hover:text-secondary hover:bg-secondary/5 font-bold text-sm text-slate-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? <FaSyncAlt className="animate-spin" /> : null}
            {loading ? 'Loading older logs...' : 'Load More History'}
          </button>
        </div>
      )}
    </section>
  );
};

export default AdminActivityFeed;
