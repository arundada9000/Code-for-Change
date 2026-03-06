import React from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaArrowLeft, FaEnvelope } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import Banner from "../Components/UI/Banner";

const DonationFailure = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Helmet>
        <title>Payment Cancelled | Code for Change</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Banner />

      <div className="max-w-2xl mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-red-900/5 border border-red-50 overflow-hidden">
          <div className="p-12 text-center space-y-8">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-5xl animate-pulse">
              <FaExclamationTriangle />
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Payment Cancelled</h2>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                The transaction was either cancelled or encountered an error during processing.
                Don't worry, no funds were deducted from your account.
              </p>
            </div>

            <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 text-left">
              <h4 className="font-bold text-red-900 text-sm mb-3">Common reasons for failure:</h4>
              <ul className="text-xs text-red-700 space-y-2 list-disc ml-4 font-medium">
                <li>Transaction cancelled by user</li>
                <li>Insufficient balance in eSewa wallet</li>
                <li>Session expired or network timeout</li>
                <li>Invalid eSewa credentials entered</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-sm">
              <p className="text-gray-500 italic">
                No funds were deducted. If you believe this is an error, please try again or contact support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/donate" className="flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20">
                <FaArrowLeft /> Try Again
              </Link>
              <a href="mailto:support@codeforchangenepal.com" className="flex items-center justify-center gap-3 bg-white border-2 border-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                <FaEnvelope /> Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationFailure;
