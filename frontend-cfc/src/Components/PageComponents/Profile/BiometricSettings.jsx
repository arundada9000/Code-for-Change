import React, { useState, useEffect, useCallback } from "react";
import { FaFingerprint, FaPlus, FaTrash, FaDesktop, FaMobileAlt } from "react-icons/fa";
import API from "../../../Services/api";

/**
 * BiometricSettings — Self-contained card component for managing
 * WebAuthn/Passkey credentials. Shows registered devices with
 * remove functionality and an "Add this device" registration flow.
 */
export default function BiometricSettings() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [deviceName, setDeviceName] = useState("");

  // Check browser support
  useEffect(() => {
    const check = async () => {
      try {
        const { browserSupportsWebAuthn } = await import("@simplewebauthn/browser");
        setSupported(browserSupportsWebAuthn());
      } catch {
        setSupported(false);
      }
    };
    check();
  }, []);

  // Fetch registered credentials
  const fetchCredentials = useCallback(async () => {
    try {
      const res = await API.get("/auth/webauthn/credentials");
      setCredentials(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch credentials:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  // Register a new credential
  const handleRegister = async () => {
    if (!deviceName.trim()) {
      setError("Please enter a device name.");
      return;
    }

    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      const { startRegistration } = await import("@simplewebauthn/browser");

      // 1. Get registration options
      const optionsRes = await API.post("/auth/webauthn/register-options");
      const { options, challengeId } = optionsRes.data.data;

      // 2. Trigger browser biometric prompt
      const regResponse = await startRegistration({ optionsJSON: options });

      // 3. Verify with server
      await API.post("/auth/webauthn/register-verify", {
        challengeId,
        response: regResponse,
        deviceName: deviceName.trim(),
      });

      setSuccess("Biometric credential registered successfully!");
      setShowNameInput(false);
      setDeviceName("");
      fetchCredentials();
    } catch (err) {
      if (err?.name === "NotAllowedError") {
        setError("Biometric registration was cancelled.");
      } else {
        setError(
          err.response?.data?.message || err.message || "Registration failed."
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Remove a credential
  const handleRemove = async (credentialId) => {
    if (!confirm("Remove this device? You won't be able to use biometrics from it anymore.")) return;

    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      await API.delete(`/auth/webauthn/credentials/${encodeURIComponent(credentialId)}`);
      setSuccess("Device removed.");
      fetchCredentials();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove credential.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!supported) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <FaFingerprint className="text-xl text-gray-300" />
          <h3 className="text-base font-semibold text-gray-800">Biometric Login</h3>
        </div>
        <p className="text-sm text-gray-400">
          Your browser does not support biometric authentication (WebAuthn).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <FaFingerprint className="text-lg text-secondary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">Biometric Login</h3>
            <p className="text-xs text-gray-400">
              Use fingerprint, Face ID, or Windows Hello to sign in
            </p>
          </div>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-2.5 rounded-xl text-sm mb-4">
          {success}
        </div>
      )}

      {/* Registered devices */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : credentials.length > 0 ? (
        <div className="space-y-2 mb-4">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary/50">
                  {cred.deviceName?.toLowerCase().includes("phone") ||
                  cred.deviceName?.toLowerCase().includes("mobile") ||
                  cred.deviceName?.toLowerCase().includes("iphone") ||
                  cred.deviceName?.toLowerCase().includes("android") ? (
                    <FaMobileAlt />
                  ) : (
                    <FaDesktop />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {cred.deviceName}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Added {new Date(cred.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(cred.id)}
                disabled={actionLoading}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer disabled:opacity-50"
                title="Remove device"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 mb-4">
          <FaFingerprint className="text-3xl text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No devices registered yet</p>
          <p className="text-xs text-gray-300 mt-1">
            Add this device to enable biometric sign-in
          </p>
        </div>
      )}

      {/* Add device flow */}
      {showNameInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder='e.g. "Work Laptop", "My iPhone"'
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/30"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          />
          <button
            onClick={handleRegister}
            disabled={actionLoading}
            className="px-4 py-2.5 bg-secondary text-white rounded-xl text-sm font-semibold hover:bg-primary transition-colors cursor-pointer disabled:opacity-50"
          >
            {actionLoading ? "..." : "Register"}
          </button>
          <button
            onClick={() => { setShowNameInput(false); setDeviceName(""); setError(""); }}
            className="px-3 py-2.5 text-gray-400 hover:text-gray-600 rounded-xl text-sm cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNameInput(true)}
          className="w-full py-3 border border-dashed border-secondary/30 text-secondary rounded-xl text-sm font-medium hover:bg-secondary/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FaPlus className="text-xs" />
          Add this device
        </button>
      )}
    </div>
  );
}
