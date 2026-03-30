import React, { useState, useEffect } from "react";
import Banner from "../Components/UI/Banner";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import SEO from "../Components/Common/SEO";
import { IoLocationOutline } from "react-icons/io5";
import { IoMailUnreadOutline } from "react-icons/io5";
import { IoCallOutline } from "react-icons/io5";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "../Components/Common/Animations";

import API from "../Services/api";
import { toast } from "react-hot-toast";

function ContactUs() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
    address: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 10000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

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
    if (cooldown > 0) return;
    setLoading(true);

    try {
      const response = await API.post("/contacts", {
        name: formData.fullName,
        email: formData.email,
        subject: formData.subject,
        message: `${formData.message}\n\nPhone: ${formData.phone}\nAddress: ${formData.address}`,
      });

      // Backend returns { success: true } and status 201 for creation
      if (
        response.data.success ||
        response.status === 201 ||
        response.status === 200
      ) {
        toast.success("Thank you! Your message has been sent.");
        setFormData({
          fullName: "",
          email: "",
          subject: "",
          message: "",
          address: "",
          phone: "",
        });
        setCooldown(600);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to send message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEO
        title="Contact Us"
        description="Get in touch with Code for Change Nepal for inquiries about workshops, partnerships, or volunteering."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact-us" },
        ]}
      />
      <Banner />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Side: Contact Information */}
          <section className="space-y-12">
            <SlideUp>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-6">
                Let's start a <br />
                <span className="text-secondary">Conversation.</span>
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
                    <p className="text-slate-600 font-medium">
                      Kathmandu, Nepal
                    </p>
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
                    <a href="mailto:codeforchangeofficial@gmail.com">
                      <p className="text-slate-600 font-medium cursor-pointer hover:underline">
                        codeforchangeofficial@gmail.com
                      </p>
                    </a>
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

                    <a href="tel:  +9779867712888">
                      <p className="text-slate-600 font-medium">
                        +977- 9867712888
                      </p>
                    </a>
                    <a href="tel: +9779847527533">
                      <p className="text-slate-600 font-medium">
                        +977-9847527533
                      </p>
                    </a>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </section>

          {/* Right Side: Controlled Form */}
          <SlideUp delay={0.2}>
            <section className="bg-white rounded-xl p-8 md:p-12 shadow-xl shadow-slate-200/60 border border-slate-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium tracking-widest text-primary/70 ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName} // Controlled Value
                      onChange={handleChange} // Event Handler
                      placeholder="Enter name"
                      required
                      className="w-full rounded-full bg-slate-50 px-4 py-3 border border-gray-200 
               focus:ring-1 focus:ring-secondary focus:border-transparent placeholder:text-sm
              outline-none transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium tracking-widest text-primary/70 ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      required
                      className="w-full rounded-full bg-slate-50 px-4 py-3 border border-gray-200 
                      focus:ring-1 focus:ring-secondary focus:border-transparent placeholder:text-sm
                      outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium tracking-widest text-primary/70 ml-1">
                      Phone number
                    </label>
                    <input
                      type="number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                      className="w-full rounded-full bg-slate-50 px-4 py-3 border border-gray-200 
               focus:ring-1 focus:ring-secondary focus:border-transparent placeholder:text-sm
              outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium tracking-widest text-primary/70 ml-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter address"
                      required
                      className="w-full rounded-full bg-slate-50 px-4 py-3 border border-gray-200 
               focus:ring-1 focus:ring-secondary focus:border-transparent placeholder:text-sm
              outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-widest text-primary/70 ml-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Inquiry about Internships"
                    required
                    className="w-full rounded-full bg-slate-50 px-4 py-3 border border-gray-200 
               focus:ring-1 focus:ring-secondary focus:border-transparent placeholder:text-sm
              outline-none transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-widest text-primary/70 ml-1">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    required
                    className="w-full rounded-xl bg-slate-50 px-4 py-3 border border-gray-200 
               focus:ring-1 focus:ring-secondary focus:border-transparent placeholder:text-sm
              outline-none transition"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading || cooldown > 0}
                  className="w-full py-5 bg-secondary text-white rounded-full cursor-pointer font-black text-lg shadow-lg shadow-blue-200 hover:bg-secondary/90 hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-secondary"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : cooldown > 0 ? (
                    `Please wait ${cooldown}s`
                  ) : (
                    "Send Message"
                  )}
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
