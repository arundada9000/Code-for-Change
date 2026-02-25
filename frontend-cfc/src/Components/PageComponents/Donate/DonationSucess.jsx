import React from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

function DonationSuccess() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-linear-to-b from-gray-50 to-white px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />

        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Donation Successful 🎉
        </h2>

        <p className="text-gray-600 mb-6">
          Thank you for your generous contribution. Your support helps us
          empower students, organize nationwide events, and create meaningful
          social impact through technology.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            to="/"
            className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/80 transition"
          >
            Back to Home
          </Link>

          <Link
            to="/events"
            className="px-6 py-3 border-2 border-secondary text-secondary rounded-full hover:bg-secondary hover:text-white transition"
          >
            Explore Events
          </Link>
        </div>
      </div>
    </section>
  );
}

export default DonationSuccess;
