import React, { useState, useEffect } from "react";
import { useAuth } from "../../../Context/AuthContext";
import API from "../../../Services/api";
import { FaBell, FaBellSlash, FaSpinner, FaGlobe, FaMapMarkerAlt } from "react-icons/fa";
import { subscribeUserToPush, unsubscribeUserFromPush, isPushSubscribed } from "../../../utils/pushNotification";
import toast from "react-hot-toast";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "BAwqVpdnWrDfqwBb6uzVg7njMJwL5O4ej5EoyFY7-PTtVmnv9A-oyZ99RrwP30hpXB_6i04UuxKKuZEECMg9Ui0"; // Replace with your actual public key

const NotificationSettings = () => {
  const { user, updateUserData } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prefLoading, setPrefLoading] = useState(false);

  const regionColor = user?.province ? "#00A155" : "#0076B4"; // default to secondary or handle dynamically

  // Default preferences
  const defaultPrefs = {
    events: true,
    eventsAllProvinces: true,
    internships: true,
    applications: true,
    certificates: true,
    account: true,
    resources: true,
    content: true,
  };

  const preferences = user?.notificationPreferences || defaultPrefs;

  useEffect(() => {
    // Check if the browser is currently subscribed to push
    const checkSubscription = async () => {
      const subscribed = await isPushSubscribed();
      setIsSubscribed(subscribed);
    };
    checkSubscription();
  }, []);

  const handleToggleSubscription = async () => {
    setLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribeUserFromPush();
        setIsSubscribed(false);
        toast.success("Notifications disabled for this device");
      } else {
        await subscribeUserToPush(VAPID_PUBLIC_KEY);
        setIsSubscribed(true);
        toast.success("Notifications enabled for this device!");
      }
    } catch (error) {
      console.error("Push subscription error:", error);
      if (error.message.includes("permission denied")) {
        toast.error("Please allow notification permissions in your browser settings.");
      } else {
        toast.error("Failed to update notification settings. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    setPrefLoading(true);
    try {
      const newPrefs = { ...preferences, [key]: value };
      const res = await API.put("/notifications/preferences", { preferences: newPrefs });
      
      if (res.data.success) {
        // Update local user context
        updateUserData({ ...user, notificationPreferences: newPrefs });
        toast.success("Preferences updated");
      }
    } catch (error) {
      console.error("Failed to update preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setPrefLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-7 mt-5">
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="p-1.5 rounded-md"
          style={{ backgroundColor: `${regionColor}15`, color: regionColor }}
        >
          <FaBell size={14} />
        </div>
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Push Notifications
        </h2>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Enable Push Notifications
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Receive important alerts on this device even when the app is closed.
          </p>
        </div>
        <button
          onClick={handleToggleSubscription}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            isSubscribed ? "bg-emerald-500" : "bg-slate-300"
          } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isSubscribed ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className={`transition-opacity duration-300 ${!isSubscribed ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Notification Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PreferenceToggle 
            label="Events & Workshops" 
            description="When new events are announced"
            checked={preferences.events}
            onChange={(val) => handlePreferenceChange("events", val)}
            disabled={prefLoading}
          />
          
          <PreferenceToggle 
            label="Internship Opportunities" 
            description="When new jobs or internships are posted"
            checked={preferences.internships}
            onChange={(val) => handlePreferenceChange("internships", val)}
            disabled={prefLoading}
          />

          <PreferenceToggle 
            label="Application Updates" 
            description="Status changes on your internship applications"
            checked={preferences.applications}
            onChange={(val) => handlePreferenceChange("applications", val)}
            disabled={prefLoading}
          />

          <PreferenceToggle 
            label="Certificates" 
            description="When a new certificate is issued to you"
            checked={preferences.certificates}
            onChange={(val) => handlePreferenceChange("certificates", val)}
            disabled={prefLoading}
          />

          <PreferenceToggle 
            label="Resources & Content" 
            description="New walkthroughs, periodicals or resources"
            checked={preferences.content}
            onChange={(val) => handlePreferenceChange("content", val)}
            disabled={prefLoading}
          />

          <PreferenceToggle 
            label="Account Security" 
            description="Important alerts regarding your account"
            checked={preferences.account}
            onChange={(val) => handlePreferenceChange("account", val)}
            disabled={prefLoading}
          />
        </div>

        {preferences.events && (
          <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <h4 className="text-xs font-bold text-slate-700 mb-3">Event Location Settings</h4>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="eventLocation" 
                  checked={preferences.eventsAllProvinces}
                  onChange={() => handlePreferenceChange("eventsAllProvinces", true)}
                  disabled={prefLoading}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <FaGlobe className="text-slate-400" size={14} />
                  <span className="text-sm text-slate-700">All Provinces (National Events)</span>
                </div>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="eventLocation" 
                  checked={!preferences.eventsAllProvinces}
                  onChange={() => handlePreferenceChange("eventsAllProvinces", false)}
                  disabled={prefLoading || !user?.province}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-slate-400" size={14} />
                    <span className={`text-sm ${!user?.province ? 'text-slate-400' : 'text-slate-700'}`}>
                      My Province Only {user?.province ? `(${user.province})` : ""}
                    </span>
                  </div>
                  {!user?.province && (
                    <span className="text-[10px] text-rose-500 mt-0.5 ml-6">Please update your province in profile first</span>
                  )}
                </div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PreferenceToggle = ({ label, description, checked, onChange, disabled }) => {
  return (
    <div className="flex items-start justify-between p-3 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
      <div className="pr-4">
        <h4 className="text-sm font-semibold text-slate-800">{label}</h4>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none mt-1 ${
          checked ? "bg-blue-500" : "bg-slate-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-4.5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

export default NotificationSettings;
