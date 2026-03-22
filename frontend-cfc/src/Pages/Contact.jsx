import React, { useState } from "react";
import Banner from "../Components/UI/Banner";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import SEO from "../Components/Common/SEO";
import { IoLocationOutline } from "react-icons/io5";
import { IoMailUnreadOutline } from "react-icons/io5";
import { IoCallOutline } from "react-icons/io5";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "../Components/Common/Animations";

import API from "../Services/api";

function ContactUs() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
    address: "",
    phone: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Sending message..." });

    try {
      const response = await API.post("/contact", {
        name: formData.fullName,
        email: formData.email,
        subject: formData.subject,
        message: `${formData.message}\n\nPhone: ${formData.phone}\nAddress: ${formData.address}`,
      });

      if (response.data.status === "success" || response.status === 200) {
        setStatus({
          type: "success",
          message: "Thank you! Your message has been sent.",
        });
        setFormData({ fullName: "", email: "", subject: "", message: "", address: "", phone: "" });
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to send message. Please try again.",
      });
    }

    // Clear message after 5 seconds
    setTimeout(() => {
      if (status.type !== "loading") setStatus({ type: "", message: "" });
    }, 5000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEO 
        title="Contact Us"
        description="Get in touch with Code for Change Nepal for inquiries about workshops, partnerships, or volunteering."
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact-us" }]}
      />
      <Banner />
      {/* <div className="max-w-7xl mx-auto px-6 mt-8">
        <Breadcrumbs crumbs={[{ name: "Contact", path: "/contact-us" }]} />
      </div> */}

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Side: Contact Information */}
          <section className="space-y-12">
            <SlideUp>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-6">
                Let's start a <br />
                <span className="text-blue-600">Conversation.</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed max-w-md">
                Have questions about our workshops, events, or how you can get
                involved? We're here to help.
              </p>
            </SlideUp>

            <StaggerContainer className="space-y-8">
              <StaggerItem>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-xl">
                    <IoLocationOutline className="text-2xl font-black" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-1">
                      Our Location
                    </h4>
                    <p className="text-slate-600 font-medium">Kathmandu, Nepal</p>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-xl">
                    <IoMailUnreadOutline className="text-2xl font-black" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-1">
                      Email Us
                    </h4>
                    <p className="text-slate-600 font-medium">
                      codeforchange2019@gmail.com
                    </p>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-xl">
                    <IoCallOutline className="text-2xl font-black" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-1">
                      Call Us
                    </h4>
                    <p className="text-slate-600 font-medium">+977-1234567890</p>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </section>

          {/* Right Side: Controlled Form */}
          <SlideUp delay={0.2}>
            <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/60 border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {status.message && (
                <div
                  className={`p-4 rounded-xl text-sm font-bold ${
                    status.type === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName} // Controlled Value
                    onChange={handleChange} // Event Handler
                    placeholder="Enter name"
                    required
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                    Phone number
                  </label>
                  <input
                    type="number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    required
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Inquiry about Internships"
                  required
                  className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  Your Message
                </label>
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  required
                  className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 active:scale-[0.98] transition-all"
              >
                Send Message
              </button>
            </form>
          </section>
          </SlideUp>
        </div>
      </main>
    </div>
  );
}

export default ContactUs;
