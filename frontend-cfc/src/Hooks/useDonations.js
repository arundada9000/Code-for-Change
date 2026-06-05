import { useState, useEffect } from "react";
import API from "../Services/api";
import { toast } from "react-hot-toast";

export const PROVINCES = [
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

export const INITIAL_FORM_DATA = {
  donorName: "",
  amount: "",
  paymentMethod: "eSewa",
  category: "General",
  transactionId: "",
  receiverAccount: "",
  remarks: "",
  isAnonymous: false,
  province: "",
  email: "",
  phone: "",
};

export const useDonations = () => {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    pendingCount: 0,
    verifiedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("All");
  const [filterProvince, setFilterProvince] = useState("All");

  useEffect(() => {
    fetchDonations();
    fetchStats();
  }, [filterMethod, filterProvince]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterMethod !== "All") params.append("paymentMethod", filterMethod);
      if (filterProvince !== "All") params.append("province", filterProvince);

      const res = await API.get(`/admin/donations?${params.toString()}`);
      setDonations(res.data.data);
    } catch (error) {
      toast.error(
        "Failed to fetch donations: " +
          (error?.response?.data?.message || error?.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/donations/stats");
      setStats(res.data.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/admin/donations/${id}/status`, { status });
      toast.success(`Donation marked as ${status}`);
      await fetchDonations();
      await fetchStats();
      return true; // Indicate success
    } catch (error) {
      toast.error(
        "Failed to update status: " +
          (error?.response?.data?.message || error?.message || "Unknown error")
      );
      return false; // Indicate failure
    }
  };

  const submitDonation = async (formData, receiptFile, isEditing, selectedId) => {
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      
      if (receiptFile) {
        data.append("receipt", receiptFile);
      }

      if (isEditing && selectedId) {
        await API.put(`/admin/donations/${selectedId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Record updated successfully");
      } else {
        await API.post("/donations", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Manual record added");
      }
      
      await fetchDonations();
      await fetchStats();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
      return false;
    }
  };

  const importDonationsFromCSV = async (parsedData) => {
    try {
      let count = 0;
      for (const row of parsedData) {
        const payload = {
          donorName: row.Donor || row.donorName || "Imported Record",
          amount: Number(row.Amount || row.amount || 0),
          paymentMethod: row.Method || row.paymentMethod || "Other",
          category: row.Category || row.category || "General",
          transactionId:
            row["Transaction ID"] ||
            row.transactionId ||
            `IMP-${Date.now()}-${Math.random()}`,
          receiverAccount: row.Receiver || row.receiverAccount || "CFC Main",
          province: row.Province || row.province || "",
          isAnonymous: row.isAnonymous === "true" || row.isAnonymous === true,
        };
        
        if (payload.amount > 0) {
          await API.post("/donations", payload);
          count++;
        }
      }
      toast.success(`Successfully imported ${count} records`);
      fetchDonations();
      fetchStats();
      return true;
    } catch (error) {
      toast.error(
        "Import failed: Some records may have duplicate Transaction IDs",
      );
      return false;
    }
  };

  const filteredDonations = donations.filter((d) => {
    const searchLow = (searchTerm || "").toLowerCase();
    const matchesSearch =
      d.donorName?.toLowerCase().includes(searchLow) ||
      d.transactionId?.toLowerCase().includes(searchLow) ||
      (d.category && d.category.toLowerCase().includes(searchLow));
    const matchesMethod =
      filterMethod === "All" || d.paymentMethod === filterMethod;
    return matchesSearch && matchesMethod;
  });

  return {
    donations,
    filteredDonations,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filterMethod,
    setFilterMethod,
    filterProvince,
    setFilterProvince,
    fetchDonations,
    fetchStats,
    updateStatus,
    submitDonation,
    importDonationsFromCSV
  };
};
