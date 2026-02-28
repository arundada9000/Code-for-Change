import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Events from "./Pages/Events";
import { OurImpact } from "./Pages/OurImpact";
import CertificateVerification from "./Pages/CertificateVerification";
import { Provinces } from "./Pages/Provinces";
import InternshipApplication from "./Pages/InternshipApplication";
import Internships from "./Pages/Internships";
import DonateUs from "./Pages/DonateUs";
import DonationSuccess from "./Pages/DonationSuccess";
import DonationFailure from "./Pages/DonationFailure";
import Register from "./Pages/Auth/Register";
import JoinUs from "./Pages/JoinUs";
import EventDetails from "./Pages/EventDetails";
import Blog from "./Pages/Blog";
import BlogDetail from "./Pages/BlogDetail";
import ProvinceDetails from "./Pages/ProvinceDetails";
import ImpactDetail from "./Pages/ImpactDetail";
import Gallery from "./Pages/Gallery";
import Contact from "./Pages/Contact";
import FAQ from "./Pages/FAQ";
import MainLayout from "./Layout/MainLayout";
import useScrollToTop from "./Hooks/useScrollToTop";
import { lazy, Suspense } from "react";

// Admin
import AdminLayout from "./Layout/AdminLayout";
const Dashboard = lazy(() => import("./Pages/Admin/Dashboard"));
import AdminEvents from "./Pages/Admin/AdminEvents";
import AdminBlogs from "./Pages/Admin/AdminBlogs";
import AdminDonations from "./Pages/Admin/AdminDonations";
import AdminUsers from "./Pages/Admin/AdminUsers";
import AdminInternships from "./Pages/Admin/AdminInternships";
const Member = lazy(() => import("./Pages/Admin/Member"));
import Certificate from "./Pages/Admin/Certificate";
import Internship from "./Pages/Admin/Internship";
import Profile from "./Pages/Admin/Profile";
import UserDetail from "./Pages/Admin/UserDetail";
import AdminEventDetail from "./Pages/Admin/AdminEventDetail";
import AdminBlogDetail from "./Pages/Admin/AdminBlogDetail";
import AdminGallery from "./Pages/Admin/AdminGallery";
import AdminImpacts from "./Pages/Admin/AdminImpacts";
import AdminResources from "./Pages/Admin/AdminResources";
import SajiloDigital from "./Pages/Admin/SajiloDigital";
import AuthLayout from "./Layout/AuthLayout";
import Login from "./Pages/Auth/Login";
import ForgetPassword from "./Pages/Auth/ForgetPassword";
import OTPVerify from "./Pages/Auth/OTPVerify";
import ResetPassword from "./Pages/Auth/ResetPassword";
import PrivateRoute from "./Components/Common/PrivateRoute";
import { Toaster } from "react-hot-toast";

function App() {
  useScrollToTop();
  return (
    <>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          {/* Public routes for normal user*/}
          <Route element={<MainLayout />}>
            {/* ... existing routes ... */}
            <Route path="/" element={<Home />}></Route>
            <Route path="/about" element={<About />}></Route>
            <Route path="/events" element={<Events />}></Route>
            <Route path="/our-impact" element={<OurImpact />}></Route>
            <Route path="/blog" element={<Blog />}></Route>
            <Route
              path="/certificate-verification/:token?"
              element={<CertificateVerification />}
            ></Route>
            <Route
              path="/verify-certificate/:token"
              element={<CertificateVerification />}
            ></Route>
            <Route path="/provinces" element={<Provinces />}></Route>
            <Route
              path="/internship-application"
              element={<InternshipApplication />}
            ></Route>
            <Route path="/internships" element={<Internships />}></Route>
            <Route path="donate-us" element={<DonateUs />}></Route>
            <Route path="gallery" element={<Gallery />}></Route>
            <Route path="contact-us" element={<Contact />}></Route>
            <Route path="faq" element={<FAQ />}></Route>
            <Route path="/donation-success" element={<DonationSuccess />} />
            <Route path="/donation-failure" element={<DonationFailure />} />
            <Route path="/register" element={<Register />} />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/events/:eventSlug" element={<EventDetails />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route
              path="/provinces/:provinceName"
              element={<ProvinceDetails />}
            />
            <Route path="/our-impact/:id" element={<ImpactDetail />} />
            <Route path="*" element={<Home />} />
          </Route>

          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/verify-otp" element={<OTPVerify />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Admin Dashboard routes - Protected */}
          <Route element={<PrivateRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="event" element={<AdminEvents />} />
              <Route path="event/:id" element={<AdminEventDetail />} />
              <Route path="blog" element={<AdminBlogs />} />
              <Route path="blog/:id" element={<AdminBlogDetail />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="donation" element={<AdminDonations />} />
              <Route path="impacts" element={<AdminImpacts />} />
              <Route path="user" element={<AdminUsers />} />
              <Route path="user/:id" element={<UserDetail />} />
              <Route path="member" element={<Member />} />
              <Route path="certificate" element={<Certificate />} />
              <Route path="internships" element={<AdminInternships />} />
              <Route path="internship" element={<Internship />} />
              <Route path="profile" element={<Profile />} />
              <Route path="sajilo-digital" element={<SajiloDigital />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
