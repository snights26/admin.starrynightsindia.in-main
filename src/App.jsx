import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";

import ProtectedRoute from "./Components/ProtectedRoute";

import ShowCategory from "./Common/ShowCategory";
import TransportSlip from "./Common/TransportSlip";

import UsersList from "./Admin/Users/UsersList";
import EditUser from "./Admin/Users/EditUser";
import UserLikedPackages from "./Admin/UserLikedPackages/UserLikedPackages";
import PackageViewAnalytics from "./Admin/PackageViews/PackageViewAnalytics";

import EnquiryList from "./Admin/Enquiry/EnquiryList";


import PaymentsList from "./Admin/Payments/PaymentsList";
import AddPayment from "./Admin/Payments/AddPayment";
import Invoice from "./Admin/Payments/Invoice";

import ScheduledBookingsList from "./Admin/Bookings/ScheduledBookingsList";
import AddScheduledBookings from "./Admin/Bookings/AddScheduledBookings";
import EditScheduledBookings from "./Admin/Bookings/EditScheduledBookings";

import PackagesList from "./Admin/Packages/PackagesList";
import AddPackage from "./Admin/Packages/AddPackage";
import EditPackage from "./Admin/Packages/EditPackage";

import CategoryList from "./Admin/Category/CategoryList";
import AddCategory from "./Admin/Category/AddCategory";
import EditCategory from "./Admin/Category/EditCategory";



import FirstRowToursList from "./Admin/FirstRowTours/FirstRowToursList";

import GalleryList from "./Admin/Gallery/GalleryList";
import AddGallery from "./Admin/Gallery/AddGallery";
import EditGallery from "./Admin/Gallery/EditGallery";
import HeroSlidersList from "./Admin/HeroSliders/HeroSlidersList";
import HeroSliderForm from "./Admin/HeroSliders/HeroSliderForm";
import HomepageStatisticsList from "./Admin/HomepageStatistics/HomepageStatisticsList";
import HomepageStatisticForm from "./Admin/HomepageStatistics/HomepageStatisticForm";

import NotificationsList from "./Admin/Notifications/NotificationsList";
import AddNotification from "./Admin/Notifications/AddNotification";
import EditNotification from "./Admin/Notifications/EditNotification";

import KeywordsList from "./Admin/Keywords/KeywordsList";
import AddKeyword from "./Admin/Keywords/AddKeyword";
import EditKeyword from "./Admin/Keywords/EditKeyword";

import UnansweredQuestions from "./Admin/Unanswered/UnansweredQuestions";
import ChatbotAnalytics from "./Admin/ChatbotAnalytics/ChatbotAnalytics";

import Top10 from "./Admin/Top10/Top10";
import Quotation from "./Admin/GetQuotation/GetQuotation";

/* 🔥 FEATURED ROWS IMPORT */
import FeaturedRowsList from "./Admin/FeaturedRows/FeaturedRowsList";
import AddFeaturedRows from "./Admin/FeaturedRows/AddFeaturedRows";
import EditFeaturedRows from "./Admin/FeaturedRows/EditFeaturedRows";

import Footer from "./Components/Footer";

import Stats from "./Pages/AboutUs/Stats";
import AboutUs from "./Pages/AboutUs/AboutUs";
import Contact from "./Pages/Contact/Contact";
import Career from "./Pages/Career/Career";
import { createPortal } from "react-dom";
import ScrollToTop from "./Components/ScrollToTop";
import { clearSession } from "./Utils/auth";
import { CustomAlertProvider, ThemeProvider, ThemeToggle } from "./common";


import "./App.css";
import "./theme-overrides.css";

function AppWrapper() {
  

  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {

    const interval = setInterval(() => {

      const token = localStorage.getItem("adminToken");
      const expiry = localStorage.getItem("tokenExpiry");

      if (token && expiry && Date.now() > Number(expiry)) {

        setShowModal(true);

        clearSession();

      }

    }, 3000);

    return () => clearInterval(interval);

  }, []);

  const handleLoginRedirect = () => {
    setShowModal(false);
    navigate("/");
  };

  return (
    <>
<CustomAlertProvider />
<ScrollToTop />
      {/* SESSION MODAL */}
      {showModal &&
  createPortal(
    <div className="session-modal">
      <div className="session-box">
        <h2>Session Expired</h2>
        <button onClick={handleLoginRedirect}>
          Login Again
        </button>
      </div>
    </div>,
    document.body
  )
}

      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* CATEGORY */}
        <Route
          path="/admin/category/:code"
          element={<ProtectedRoute><ShowCategory /></ProtectedRoute>}
        />

        {/* TRANSPORT */}
        <Route
          path="/transport-slip/:tourId"
          element={<ProtectedRoute><TransportSlip /></ProtectedRoute>}
        />

        {/* USERS */}
        <Route
          path="/admin/users"
          element={<ProtectedRoute><UsersList /></ProtectedRoute>}
        />
        <Route
          path="/admin/users/edit/:id"
          element={<ProtectedRoute><EditUser /></ProtectedRoute>}
        />
        <Route
          path="/admin/user-liked-packages"
          element={<ProtectedRoute><UserLikedPackages /></ProtectedRoute>}
        />
        <Route
          path="/admin/package-views"
          element={<ProtectedRoute><PackageViewAnalytics /></ProtectedRoute>}
        />

        {/* ENQUIRY */}
        <Route
          path="/admin/enquiry"
          element={<ProtectedRoute><EnquiryList /></ProtectedRoute>}
        />

        <Route
          path="/admin/GetQuotation"
          element={<ProtectedRoute><Quotation /></ProtectedRoute>}
        />
       

        {/* PAYMENTS */}
        <Route
          path="/admin/payments"
          element={<ProtectedRoute><PaymentsList /></ProtectedRoute>}
        />
        <Route
          path="/admin/payments/new"
          element={<ProtectedRoute><AddPayment /></ProtectedRoute>}
        />
        <Route
          path="/admin/payments/invoice/:bookingId"
          element={<ProtectedRoute><Invoice /></ProtectedRoute>}
        />

        {/* BOOKINGS */}
        <Route
          path="/admin/bookings"
          element={<ProtectedRoute><ScheduledBookingsList /></ProtectedRoute>}
        />
        <Route
          path="/admin/bookings/new"
          element={<ProtectedRoute><AddScheduledBookings /></ProtectedRoute>}
        />
        <Route
          path="/admin/bookings/edit/:id"
          element={<ProtectedRoute><EditScheduledBookings /></ProtectedRoute>}
        />

        {/* PACKAGES */}
        <Route
          path="/admin/packages"
          element={<ProtectedRoute><PackagesList /></ProtectedRoute>}
        />
        <Route
          path="/admin/packages/new"
          element={<ProtectedRoute><AddPackage /></ProtectedRoute>}
        />
        <Route
          path="/admin/packages/edit/:id"
          element={<ProtectedRoute><EditPackage /></ProtectedRoute>}
        />

        {/* CATEGORY */}
        <Route
          path="/admin/categories"
          element={<ProtectedRoute><CategoryList /></ProtectedRoute>}
        />
        <Route
          path="/admin/categories/add"
          element={<ProtectedRoute><AddCategory /></ProtectedRoute>}
        />
        <Route
          path="/admin/categories/edit/:code"
          element={<ProtectedRoute><EditCategory /></ProtectedRoute>}
        />

       

        {/* FIRST ROW */}
        <Route
          path="/admin/first-row-tours"
          element={<ProtectedRoute><FirstRowToursList /></ProtectedRoute>}
        />

        {/* GALLERY */}
        <Route
          path="/admin/gallery"
          element={<ProtectedRoute><GalleryList /></ProtectedRoute>}
        />
        <Route
          path="/admin/gallery/add"
          element={<ProtectedRoute><AddGallery /></ProtectedRoute>}
        />
        <Route
          path="/admin/gallery/edit/:id"
          element={<ProtectedRoute><EditGallery /></ProtectedRoute>}
        />

        {/* HERO SLIDERS */}
        <Route
          path="/admin/hero-sliders"
          element={<ProtectedRoute><HeroSlidersList /></ProtectedRoute>}
        />
        <Route
          path="/admin/hero-sliders/add"
          element={<ProtectedRoute><HeroSliderForm mode="add" /></ProtectedRoute>}
        />
        <Route
          path="/admin/hero-sliders/edit/:id"
          element={<ProtectedRoute><HeroSliderForm mode="edit" /></ProtectedRoute>}
        />

        {/* HOMEPAGE STATISTICS */}
        <Route
          path="/admin/homepage-statistics"
          element={<ProtectedRoute><HomepageStatisticsList /></ProtectedRoute>}
        />
        <Route
          path="/admin/homepage-statistics/add"
          element={<ProtectedRoute><HomepageStatisticForm mode="add" /></ProtectedRoute>}
        />
        <Route
          path="/admin/homepage-statistics/edit/:id"
          element={<ProtectedRoute><HomepageStatisticForm mode="edit" /></ProtectedRoute>}
        />

        {/* NOTIFICATIONS */}
        <Route
          path="/admin/notifications"
          element={<ProtectedRoute><NotificationsList /></ProtectedRoute>}
        />
        <Route
          path="/admin/notifications/add"
          element={<ProtectedRoute><AddNotification /></ProtectedRoute>}
        />
        <Route
          path="/admin/notifications/edit/:id"
          element={<ProtectedRoute><EditNotification /></ProtectedRoute>}
        />

        {/* KEYWORDS */}
        <Route
          path="/admin/keywords"
          element={<ProtectedRoute><KeywordsList /></ProtectedRoute>}
        />
        <Route
          path="/admin/keywords/add"
          element={<ProtectedRoute><AddKeyword /></ProtectedRoute>}
        />
        <Route
          path="/admin/keywords/edit/:id"
          element={<ProtectedRoute><EditKeyword /></ProtectedRoute>}
        />

        {/* UNANSWERED */}
        <Route
          path="/admin/unanswered"
          element={<ProtectedRoute><UnansweredQuestions /></ProtectedRoute>}
        />

        <Route
          path="/admin/chat-analytics"
          element={<ProtectedRoute><ChatbotAnalytics /></ProtectedRoute>}
        />

        {/* TOP10 */}
        <Route
          path="/admin/top10"
          element={<ProtectedRoute><Top10 /></ProtectedRoute>}
        />

        {/* 🔥 FEATURED ROWS */}
        <Route
          path="/admin/featured-rows"
          element={<ProtectedRoute><FeaturedRowsList /></ProtectedRoute>}
        />
        <Route
          path="/admin/featured-rows/add"
          element={<ProtectedRoute><AddFeaturedRows /></ProtectedRoute>}
        />
        <Route
          path="/admin/featured-rows/edit/:id"
          element={<ProtectedRoute><EditFeaturedRows /></ProtectedRoute>}
        />
        <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/careers" element={<Career />} />
      <Route path="/Stats" element={<Stats />} />

      </Routes>
      
       <Footer />
       <ThemeToggle />

    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
