import React, { useState } from "react";
import DonationImg from "../../../assets/Donate.png";
import API from "../../../Services/api";
import { FadeIn, SlideUp } from "../../Common/Animations";
import { FaUnlockAlt } from "react-icons/fa";

function DonateSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    amount: "",
    paymentMethod: "esewa",
  });

  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  //HandleChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const selectPreset = (amt) => {
    setIsCustomAmount(false);
    setFormData({ ...formData, amount: amt });
  };

  //Form validation
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Phone number is required";
    } else if (!/^\+?\d{10,15}$/.test(formData.contactNumber)) {
      newErrors.contactNumber =
        "Enter a valid contact number (10-15 digits, optional +)";
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = "Enter a valid donation amount";
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [submitSuccess, setSubmitSuccess] = useState(false);

  //Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // Map frontend IDs to backend Enum values exactly
      const methodMapping = {
        esewa: "eSewa",
        khalti: "Khalti",
        bank: "Bank Transfer",
      };

      // Direct post to backend for all payment methods as requested
      // The backend will generate a pending/unverified donation record
      await API.post("/donations", {
        donorName: formData.name,
        email: formData.email,
        phone: formData.contactNumber,
        amount: Number(formData.amount),
        paymentMethod: methodMapping[formData.paymentMethod] || "Other",
        receiverAccount: "Manual/Direct Submission",
        remarks: "Direct donation via website form",
      });

      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        contactNumber: "",
        amount: "",
        paymentMethod: "esewa",
      });
      setIsCustomAmount(false);
    } catch (error) {
      console.error("Donation submission failed:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Failed to submit donation. Please try again.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-28 bg-linear-to-b from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* LEFT CONTENT */}
        <SlideUp>
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-0.5 w-12 bg-primary"></span>
              <h4 className="uppercase tracking-widest text-sm font-semibold text-primary">
                Support Our Mission
              </h4>
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold text-primary leading-tight">
              Make a difference with your donation
            </h2>

            <p className="mt-6 text-gray-600 max-w-lg leading-relaxed">
              Your contribution empowers students, fuels innovation, and
              supports nationwide programs creating real-world impact through
              technology.
            </p>
          </div>

          <FadeIn delay={0.3}>
            <img
              src={DonationImg}
              alt="Donate"
              className="w-full max-w-md rounded-2xl"
            />
          </FadeIn>
        </SlideUp>

        {/* RIGHT FORM */}
        <FadeIn
          delay={0.2}
          className="relative bg-white/80 backdrop-blur-xl border border-gray-200 rounded-lg shadow-sm p-10 h-full"
        >
          {submitSuccess ? (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Thank You for Your Support!
              </h3>
              <p className="text-gray-600 mb-8">
                Your donation request has been recorded. Our team will verify
                the contribution soon. If you chose Bank Transfer, please ensure
                you've completed the transfer.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all"
              >
                Make Another Donation
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Donation Details
              </h3>

              <form onSubmit={handleSubmit} className="space-y-7">
                {/* NAME */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm text-gray-600 capitalize tracking-widest placeholder:text-slate-400 font-medium mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Code for Change"
                    className="w-full rounded-full bg-slate-50 px-4 py-3 border border-gray-200 
               focus:ring-1 focus:ring-secondary focus:border-transparent placeholder:text-sm
              outline-none transition"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-gray-600 capitalize tracking-widest placeholder:text-slate-400 font-medium mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="codeforchange@example.com"
                    className="w-full rounded-full bg-slate-50 px-4 py-3 border border-gray-200 
               focus:ring-1 focus:ring-secondary focus:border-transparent placeholder:text-sm
              outline-none transition"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label
                    htmlFor="contactNumber"
                    className="block text-sm text-gray-600 capitalize tracking-widest placeholder:text-slate-400 font-medium mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    id="contactNumber"
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="+9779812345678"
                    className="w-full rounded-full bg-slate-50 px-4 py-3 border border-gray-200 
               focus:ring-1 focus:ring-secondary focus:border-transparent placeholder:text-sm
              outline-none transition"
                  />
                  {errors.contactNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>

                {/* AMOUNT */}
                <div className="space-y-4">
                  <label className="block text-sm text-gray-600 capitalize tracking-widest placeholder:text-slate-400 font-medium mb-2">
                    Select Amount (NPR)
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    {[500, 1000, 2500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => selectPreset(amt)}
                        className={`py-3 rounded-full border-2 transition-all duration-300 font-bold text-xs ${
                          !isCustomAmount && formData.amount == amt
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                            : "bg-slate-50 border-gray-100 text-gray-500 hover:border-primary/30"
                        }`}
                      >
                        Rs. {amt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomAmount(true);
                        setFormData({ ...formData, amount: "" });
                      }}
                      className={`py-3 rounded-full border-2 transition-all duration-300 font-bold text-xs ${
                        isCustomAmount
                          ? "bg-secondary border-secondary text-white shadow-lg shadow-secondary/20 scale-105"
                          : "bg-slate-50 border-gray-100 text-gray-500 hover:border-secondary/30"
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {isCustomAmount && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                          Rs.
                        </span>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          placeholder="Enter custom amount"
                          className="w-full rounded-full bg-white pl-12 pr-6 py-4 border-2 border-secondary/20 
                      focus:border-secondary focus:ring-4 focus:ring-secondary/5 
                      outline-none transition-all font-bold text-primary shadow-inner"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}

                  {errors.amount && (
                    <p className="text-red-500 text-xs font-bold mt-1 ml-2">
                      {errors.amount}
                    </p>
                  )}
                </div>

                {/* PAYMENT METHOD */}
                <div className="space-y-4">
                  <label className="block text-sm text-gray-600 capitalize tracking-widest placeholder:text-slate-400 font-medium mb-2">
                    Payment Method
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: "esewa", label: "eSewa" },
                      { id: "khalti", label: "Khalti" },
                      { id: "bank", label: "Bank Transfer" },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, paymentMethod: method.id })
                        }
                        className={`py-3 px-6 rounded-full cursor-pointer border font-medium text-xs uppercase tracking-wide transition-all duration-300 ${
                          formData.paymentMethod === method.id
                            ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105"
                            : "bg-slate-50 border border-slate-300 text-slate-400 hover:border-primary/20 hover:bg-white"
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>

                  {errors.paymentMethod && (
                    <p className="text-red-500 text-xs font-bold mt-2 ml-2">
                      {errors.paymentMethod}
                    </p>
                  )}
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-8 bg-secondary cursor-pointer
            text-white py-3 border-2 border-secondary rounded-full font-semibold shadow-lg 
            hover:bg-secondary/70 transition disabled:opacity-60"
                >
                  {loading ? "Processing..." : "Donate Now"}
                </button>

                <p className="text-center text-sm flex gap-3 justify-center text-gray-500 mt-4">
                  <FaUnlockAlt className="text-secondary" />{" "}
                  <span>Secure & trusted donation</span>
                </p>
              </form>
            </>
          )}
        </FadeIn>
      </div>
    </section>
  );
}

export default DonateSection;
