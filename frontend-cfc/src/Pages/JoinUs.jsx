import React, { useState } from "react";
import Banner from "../Components/UI/Banner";
import Breadcrumbs from "../Components/UI/Breadcrumbs";
import SEO from "../Components/Common/SEO";
import RegisterImg from "../assets/RegisterIllustration.jpg";
import API from "../Services/api";

const roleFields = {
  "general-member": [
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "code", label: "Code", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    {
      name: "contact",
      label: "Contact",
      type: "text",
      required: true,
      validation: "phone",
    },
    {
      name: "collegeName",
      label: "College Name",
      type: "text",
      required: false,
    },
    { name: "ebBody", label: "EB Body", type: "text", required: false },
    { name: "faculty", label: "Faculty", type: "text", required: false },
    {
      name: "collegeSemester",
      label: "College Semester",
      type: "text",
      required: false,
    },
    {
      name: "profilePicture",
      label: "Profile Picture",
      type: "file",
      required: false,
    },
    {
      name: "province",
      label: "Province",
      type: "select",
      required: true,
      options: ['Kathmandu', 'Pokhara', 'Rupandehi', 'Dang', 'Birgunj', 'Farwest', 'Koshi', 'Chitwan', 'LB Karnali']
    },
    { name: "password", label: "Password", type: "password", required: true },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      required: true,
    },
  ],
  "cr-eb": [
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "code", label: "Code", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    {
      name: "contact",
      label: "Contact",
      type: "text",
      required: true,
      validation: "phone",
    },
    {
      name: "executiveDesignation",
      label: "Executive Designation",
      type: "text",
      required: true,
    },
    {
      name: "collegeName",
      label: "College Name",
      type: "text",
      required: false,
    },
    { name: "ebBody", label: "EB Body", type: "text", required: false },
    { name: "faculty", label: "Faculty", type: "text", required: false },
    {
      name: "collegeSemester",
      label: "College Semester",
      type: "text",
      required: false,
    },
    {
      name: "profilePicture",
      label: "Profile Picture",
      type: "file",
      required: false,
    },
    {
      name: "about",
      label: "Say Something About You",
      type: "textarea",
      required: false,
    },
    {
      name: "province",
      label: "Province",
      type: "select",
      required: true,
      options: ['Kathmandu', 'Pokhara', 'Rupandehi', 'Dang', 'Birgunj', 'Farwest', 'Koshi', 'Chitwan', 'LB Karnali']
    },
    { name: "password", label: "Password", type: "password", required: true },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      required: true,
    },
  ],
  "tech-lead": [
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "code", label: "Code", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    {
      name: "contact",
      label: "Contact",
      type: "text",
      required: true,
      validation: "phone",
    },
    {
      name: "executiveDesignation",
      label: "Executive Designation",
      type: "text",
      required: true,
    },
    {
      name: "collegeName",
      label: "College Name",
      type: "text",
      required: false,
    },
    { name: "ebBody", label: "EB Body", type: "text", required: false },
    { name: "faculty", label: "Faculty", type: "text", required: false },
    {
      name: "collegeSemester",
      label: "College Semester",
      type: "text",
      required: false,
    },
    {
      name: "profilePicture",
      label: "Profile Picture",
      type: "file",
      required: false,
    },
    {
      name: "about",
      label: "Say Something About You",
      type: "textarea",
      required: false,
    },
    {
      name: "province",
      label: "Province",
      type: "select",
      required: true,
      options: ['Kathmandu', 'Pokhara', 'Rupandehi', 'Dang', 'Birgunj', 'Farwest', 'Koshi', 'Chitwan', 'LB Karnali']
    },
    { name: "password", label: "Password", type: "password", required: true },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      required: true,
    },
  ],
  "cr": [
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "code", label: "Code", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    {
      name: "contact",
      label: "Contact",
      type: "text",
      required: true,
      validation: "phone",
    },
    {
      name: "collegeName",
      label: "College Name",
      type: "text",
      required: false,
    },
    { name: "ebBody", label: "EB Body", type: "text", required: false },
    { name: "faculty", label: "Faculty", type: "text", required: false },
    {
      name: "collegeSemester",
      label: "College Semester",
      type: "text",
      required: false,
    },
    {
      name: "profilePicture",
      label: "Profile Picture",
      type: "file",
      required: false,
    },
    {
      name: "province",
      label: "Province",
      type: "select",
      required: true,
      options: ['Kathmandu', 'Pokhara', 'Rupandehi', 'Dang', 'Birgunj', 'Farwest', 'Koshi', 'Chitwan', 'LB Karnali']
    },
    { name: "password", label: "Password", type: "password", required: true },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      required: true,
    },
  ],
  "guest": [
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    {
      name: "organization",
      label: "Organization",
      type: "text",
      required: false,
    },
    { name: "sponsor", label: "Sponsor", type: "text", required: false },
    { name: "ebBody", label: "Executive Body Role", type: "text", required: false },
    {
      name: "province",
      label: "Province",
      type: "select",
      required: true,
      options: ['Kathmandu', 'Pokhara', 'Rupandehi', 'Dang', 'Birgunj', 'Farwest', 'Koshi', 'Chitwan', 'LB Karnali']
    },
    { name: "password", label: "Password", type: "password", required: true },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      required: true,
    },
  ],
};

export default function RegistrationForm() {
  const [role, setRole] = useState("general-member");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
    // Clear status when user starts typing again
    if (submitStatus.message) setSubmitStatus({ type: "", message: "" });
  };

  // Phone validation for international numbers
  const isValidPhone = (phone) => /^\+?\d{10,15}$/.test(phone);

  // Form validation
  const validate = () => {
    const newErrors = {};
    const fields = roleFields[role];

    fields.forEach((field) => {
      const value = formData[field.name];

      if (field.required && !value) {
        newErrors[field.name] = `${field.label} is required`;
      }

      if (field.validation === "phone" && value && !isValidPhone(value)) {
        newErrors[field.name] = "Enter a valid contact number";
      }

      if (field.name === "confirmPassword" && value !== formData["password"]) {
        newErrors[field.name] = "Passwords do not match";
      }

      if (field.type === "email" && value) {
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(value))
          newErrors[field.name] = "Enter a valid email";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const formDataToSend = new FormData();
      
      // Map frontend fields to backend expectations (flat structure as expected by auth.service.ts)
      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.contact,
        role: role,
        collegeName: formData.collegeName,
        faculty: formData.faculty,
        semester: formData.collegeSemester,
        code: formData.code,
        ebBody: formData.ebBody || formData.executiveDesignation,
        province: formData.province,
        bio: formData.about || formData.description,
      };

      // Append all payload fields
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined) formDataToSend.append(key, value);
      });

      // Handle file uploads
      if (formData.profilePicture) {
        formDataToSend.append("profileImage", formData.profilePicture);
      }
      if (formData.logo) {
        formDataToSend.append("profileImage", formData.logo); // Map logo to profileImage for simplicity or handle specifically
      }
      
      const { data } = await API.post("/auth/register", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setSubmitStatus({ 
        type: "success", 
        message: "Registration successful! Your account is now pending verification. Please wait for administrator approval or check your email for verification steps." 
      });
      
      // Clear form on success
      setFormData({});
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed. Please try again.";
      setSubmitStatus({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Join the Movement"
        description="Become a part of Nepal's largest student-led IT community. Register as a member, executive, or mentor today."
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Join Us", path: "/join-us" }]}
      />
      <Banner />
      {/* <div className="max-w-7xl mx-auto px-4 mt-8">
        <Breadcrumbs crumbs={[{ name: "Join Us", path: "/join-us" }]} />
      </div> */}
      <div>
        <div className="max-w-7xl mx-auto px-4 py-16 lg:px-8 flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2 w-full">
            {/* Section Header */}
            <div className="mb-10 max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-0.5 w-10 bg-primary"></span>
                <h4 className="uppercase tracking-wider text-base font-semibold text-primary">
                  Registration
                </h4>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Join us and be part of our community
              </h2>

              <p className="mt-4 text-gray-600">
                Register as a member, executive, CR, supporter, or mentor and
                gain access to events, projects, and opportunities to make a
                real impact.
              </p>
            </div>
          </div>
          <div className="lg:w-1/2 w-full flex justify-center">
            <img
              src={RegisterImg}
              alt="Register Illustration"
              className="w-full max-w-md rounded-lg"
            />
          </div>
        </div>
        <div className="bg-secondary/5 mb-16">
          <div className="max-w-7xl mx-auto py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-center">
                Registration Form
              </h2>
              <p className="text-center text-gray-600 mb-10">
                Choose your role and complete the registration to get started.
              </p>

              <div className="">
                <div className=" px-4">
                  <div className="grid md:grid-cols-[1fr_4fr] gap-8">
                    {/* LEFT: Role Filter */}
                    <div className="">
                      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <h3 className="px-6 py-4 font-semibold text-lg text-gray-800 border-b">
                          Register As
                        </h3>

                        {Object.keys(roleFields).map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setRole(r);
                              // setFormData({});
                              setErrors({});
                            }}
                            className={`w-full text-left px-6 py-4 flex items-center gap-3 transition
                            ${
                              role === r
                                ? "bg-primary text-white"
                                : "hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            <span className="h-2 w-2 rounded-full bg-current"></span>
                            {r.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT: Dynamic Form */}
                    <div className="">
                      <form
                        onSubmit={handleSubmit}
                        className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-100 p-8 md:p-12 space-y-10"
                      >
                        {/* Header Section */}
                        <div className="relative">
                          <div className="absolute -left-12 top-0 w-1 h-full bg-secondary rounded-full hidden md:block" />
                          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {role.replace('-', ' ').toUpperCase()}{" "}
                            Registration
                          </h2>
                          <p className="text-slate-500 mt-2 font-medium">
                            Complete the form below to join our student-led IT
                            community.
                          </p>
                        </div>

                        {/* Submit Status Alert */}
                        {submitStatus.message && (
                          <div className={`p-4 rounded-2xl border ${
                            submitStatus.type === "success" 
                              ? "bg-green-50 border-green-100 text-green-700" 
                              : "bg-red-50 border-red-100 text-red-700"
                          } animate-in fade-in slide-in-from-top-4 duration-500`}>
                            <p className="text-sm font-semibold flex items-center gap-2">
                              {submitStatus.type === "success" ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              {submitStatus.message}
                            </p>
                          </div>
                        )}

                        {/* Dynamic Fields Grid */}
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                          {roleFields[role].map((field) => (
                            <div
                              key={field.name}
                              className={`${
                                field.type === "textarea"
                                  ? "md:col-span-2"
                                  : "md:col-span-1"
                              } group`}
                            >
                              <label className="block text-xs uppercase tracking-widest font-bold text-slate-400 mb-2 ml-1 transition-colors group-focus-within:text-secondary">
                                {field.label}
                              </label>

                              <div className="relative">
                                {field.type === "textarea" ? (
                                  <textarea
                                    name={field.name}
                                    rows={4}
                                    value={formData[field.name] || ""}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border bg-slate-50 border-gray-200 px-5 py-3 focus:bg-white focus:ring focus:ring-secondary/5 outline-none transition-all duration-300 resize-none text-slate-700 placeholder:text-slate-300 placeholder:text-sm"
                                    placeholder={`Tell us about your ${field.label.toLowerCase()}...`}
                                  />
                                ) : field.type === "select" ? (
                                  <select
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 rounded-full bg-slate-50 border border-gray-200 focus:border-primary/20 focus:bg-white focus:ring focus:ring-primary/5 outline-none transition-all appearance-none cursor-pointer text-slate-700 text-sm"
                                  >
                                    <option value="">Select {field.label}</option>
                                    {field.options?.map(opt => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type={field.type}
                                    name={field.name}
                                    value={
                                      field.type !== "file"
                                        ? formData[field.name] || ""
                                        : undefined
                                    }
                                    onChange={handleChange}
                                    className={`w-full px-5 py-3 rounded-full bg-slate-50 border border-gray-200 focus:border-primary/20 focus:bg-white focus:ring focus:ring-primary/5 outline-none transition-all placeholder:text-slate-400 placeholder:text-sm ${
                                      field.type === "file"
                                        ? "file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font file:bg-secondary file:text-white hover:file:bg-secondary/80 cursor-pointer"
                                        : ""
                                    }`}
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                  />
                                )}
                              </div>

                              {/* Error Message with Icon */}
                              {errors[field.name] && (
                                <div className="flex items-center gap-1.5 mt-2 ml-1 text-red-500 animate-in fade-in slide-in-from-top-1">
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <p className="text-xs font-bold uppercase tracking-wide">
                                    {errors[field.name]}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Submit Button Section */}
                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full py-3 text-lg font-bold bg-secondary text-white rounded-full shadow-xl shadow-secondary/20 transition-all duration-300 overflow-hidden ${
                              loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-secondary/40 hover:-translate-y-1 active:translate-y-0"
                            }`}
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {loading ? (
                                <>
                                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Registering...
                                </>
                              ) : (
                                <>
                                  Complete Registration
                                  <svg
                                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2.5"
                                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                  </svg>
                                </>
                              )}
                            </span>
                            {!loading && (
                              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            )}
                          </button>

                          <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-[0.2em] font-black">
                            Verified Student Opportunity
                          </p>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
