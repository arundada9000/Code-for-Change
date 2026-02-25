import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FaCheckCircle, FaDownload, FaHome } from "react-icons/fa";
import API from "../Services/api";
import Banner from "../Components/UI/Banner";

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const data = searchParams.get("data");
      if (!data) {
        setError("No payment data found.");
        setLoading(false);
        return;
      }

      try {
        const response = await API.get(`/donations/verify-esewa?data=${data}`);
        setDonation(response.data.data);
      } catch (err) {
        console.error("Verification failed:", err);
        setError("Payment verification failed. Please contact support if your amount was deducted.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 font-medium">Verifying your donation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Banner />
      
      <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-gray-100 overflow-hidden">
          {error ? (
            <div className="p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-4xl">
                ✕
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Verification Error</h2>
              <p className="text-gray-600 max-w-md mx-auto">{error}</p>
              <Link to="/donate" className="inline-block px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-lg transition-all">
                Retry Donation
              </Link>
            </div>
          ) : (
            <>
              {/* Receipt Header */}
              <div className="bg-primary p-12 text-center text-white space-y-4">
                <FaCheckCircle className="text-6xl mx-auto text-green-400 animate-bounce" />
                <h2 className="text-4xl font-extrabold tracking-tight">Donation Confirmation Report</h2>
                <p className="text-blue-100 text-lg">Official transaction receipt for your contribution.</p>
              </div>

              {/* Receipt Body */}
              <div className="p-12 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Donor Name</p>
                    <p className="text-lg font-bold text-gray-900">{donation?.donorName}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Amount Paid</p>
                    <p className="text-lg font-bold text-secondary font-mono">Rs. {donation?.amount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Transaction ID</p>
                    <p className="text-sm font-medium text-gray-600 truncate">{donation?.transactionId}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Date</p>
                    <p className="text-sm font-medium text-gray-600">{new Date(donation?.verifiedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full"></div>

                <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/10 flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <FaCheckCircle className="text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-sm">Official Confirmation</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      A confirmation email has been sent to <strong>{donation?.email}</strong>. 
                      This record is stored in our secure impact database.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-3 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg">
                    <FaDownload /> Download Receipt
                  </button>
                  <Link to="/" className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                    <FaHome /> Back to Home
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationSuccess;
