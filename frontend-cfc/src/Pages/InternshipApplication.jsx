import React, { useState } from "react";
import Banner from "../Components/UI/Banner";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import SEO from "../Components/Common/SEO";
import {
  FaCode,
  FaRocket,
  FaUserGraduate,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaPhoneAlt,
} from "react-icons/fa";

import { useLocation } from "react-router-dom";
import API from "../Services/api";
import { toast } from "react-hot-toast";
import { SlideUp } from "../Components/Common/Animations";

const TRACKS = [
  "Frontend",
  "Backend",
  "UI/UX Design",
  "Fullstack",
  "Mobile App",
  "Digital Marketing",
  "Content Writing",
  "Project Management",
  "Others",
];

function InternshipApplication() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const internshipId = queryParams.get("id") || "";
  const initialTrack = queryParams.get("track") || TRACKS[0];

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Unified Controlled State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    skills: "",
    college: "",
    track: TRACKS.includes(initialTrack) ? initialTrack : TRACKS[0],
    coverLetter: "",
    internshipId: internshipId,
    resume: null, // For file objects
  });

  // 2. Generic Change Handler for text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. File Change Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      resume: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.resume) {
      toast.error("Please upload your resume");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("contactNumber", formData.contactNumber);
    data.append("skills", formData.skills);
    data.append("college", formData.college);
    data.append("track", formData.track);
    data.append("coverLetter", formData.coverLetter);
    data.append("resume", formData.resume);
    if (formData.internshipId) {
      data.append("internshipId", formData.internshipId);
    }

    try {
      await API.post("/internships/applications", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Form Submission Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit application",
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl text-center border border-slate-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Application Sent!
          </h2>
          <p className="text-slate-600 mb-8">
            Thank you,{" "}
            <span className="font-bold text-slate-800">
              {formData.fullName}
            </span>
            . Our committee will review your submission for the{" "}
            <span className="italic">{formData.track}</span> track.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                fullName: "",
                email: "",
                contactNumber: "",
                skills: "",
                college: "",
                track: TRACKS[0],
                coverLetter: "",
                resume: null,
              });
            }}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            Apply for another role
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEO
        title="Internship Application"
        description="Apply for specialized IT internship tracks and accelerate your digital career with Code for Change Nepal."
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Internships", path: "/internships" },
          { name: "Application", path: "/internship-application" },
        ]}
      />
      <Banner />
      {/* <div className="max-w-6xl mx-auto px-6 mt-8">
        <Breadcrumbs crumbs={[
          { name: "Internships", path: "/internships" },
          { name: "Application", path: "/internship-application" }
        ]} />
      </div> */}

      <div className="max-w-6xl mx-auto px-6 pt-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Sidebar: Info */}
          <SlideUp className="lg:col-span-1 space-y-6">
            <div className="bg-secondary text-white p-8 rounded-lg shadow-xl">
              <h3 className="text-2xl font-bold mb-6">Student-Led Growth</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-2 bg-white/20 rounded-lg h-fit">
                    <FaUserGraduate />
                  </div>
                  <p className="text-sm leading-relaxed text-blue-50">
                    Designed specifically for IT students looking for real-world
                    exposure.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 bg-white/20 rounded-lg h-fit">
                    <FaCode />
                  </div>
                  <p className="text-sm leading-relaxed text-blue-50">
                    Skill-based matching ensures you work on projects that
                    actually interest you.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-2">Quick Tip:</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Make sure your Resume includes links to your GitHub or live
                projects. This helps us match you faster!
              </p>
            </div>
          </SlideUp>

          {/* Right Column: The Controlled Form */}
          <SlideUp delay={0.2} className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 md:p-12"
            >
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900">
                  Apply for Internship
                </h2>
                <p className="text-slate-500 mt-2">
                  Fill in your details and let us find the best fit for you.
                </p>
              </div>

              <div className="space-y-8">
                {/* Name & Contact Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 rounded-full bg-slate-50 border border-slate-300  focus:bg-white focus:ring focus:ring-secondary foucs:border-transparent focus:outline-none transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 rounded-full bg-slate-50 border border-slate-300  focus:bg-white focus:ring focus:ring-secondary foucs:border-transparent focus:outline-none transition-all"
                      placeholder="example@gmail.com"
                    />
                  </div>
                </div>

                {/* Contact & College Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Contact Number
                    </label>
                    <div className="relative">
                      <FaPhoneAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-5 py-4 rounded-full bg-slate-50 border border-slate-300  focus:bg-white focus:ring focus:ring-secondary foucs:border-transparent focus:outline-none transition-all"
                        placeholder="+977 00000 00000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      College / Institution
                    </label>
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 rounded-full bg-slate-50 border border-slate-300  focus:bg-white focus:ring focus:ring-secondary foucs:border-transparent focus:outline-none transition-all"
                      placeholder="Name of your college"
                    />
                  </div>
                </div>

                {/* Track Preference */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Application Track
                  </label>
                  <select
                    name="track"
                    value={formData.track}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 rounded-full bg-slate-50 border border-slate-300  focus:bg-white focus:ring focus:ring-secondary foucs:border-transparent focus:outline-none transition-all cursor-pointer"
                  >
                    {TRACKS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skills Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Technical Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 rounded-full bg-slate-50 border border-slate-300  focus:bg-white focus:ring focus:ring-secondary foucs:border-transparent focus:outline-none transition-all"
                    placeholder="e.g. React, Python, UI Design"
                  />
                  <p className="text-xs text-slate-400 ml-1">
                    List your key skills separated by commas.
                  </p>
                </div>

                {/* Cover Letter / Statement */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Statement of Interest
                  </label>
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-6 py-4 rounded-3xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring focus:ring-secondary foucs:border-transparent focus:outline-none transition-all resize-none"
                    placeholder="Tell us why you want to join Code for Change..."
                  />
                </div>

                {/* File Upload (CV/Resume) */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Upload Resume / CV
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 transition-all text-center group ${
                      formData.resume
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="file"
                      onChange={handleFileChange}
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    />
                    <FaCloudUploadAlt
                      className={`text-4xl mx-auto mb-3 transition-colors ${
                        formData.resume
                          ? "text-primary"
                          : "text-slate-300 group-hover:text-primary"
                      }`}
                    />
                    <p className="text-slate-600 font-medium">
                      {formData.resume
                        ? formData.resume.name
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PDF, DOCX (Max 5MB)
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 border-2 cursor-pointer bg-secondary hover:bg-secondary/70 border-secondary text-white font-medium text-lg rounded-full shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending Application..." : "Send Application"}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-5 uppercase tracking-widest font-bold">
                    Safe & Secure Application Process
                  </p>
                </div>
              </div>
            </form>
          </SlideUp>
        </div>
      </div>
    </div>
  );
}

export default InternshipApplication;
