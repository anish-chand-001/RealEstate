import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { PageSpinner } from "./components/atoms/Spinner";

// ─── Layout Components (loaded eagerly) ──────────────────────
import PublicLayout from "./components/layout/PublicLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// ─── Auth Pages (loaded eagerly — small, critical path) ──────
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";

// ─── Lazy-loaded Pages (code splitting) ──────────────────────
// Shared / Public
const LandingPage = lazy(() => import("./pages/shared/LandingPage"));
const PropertiesPage = lazy(() => import("./pages/shared/PropertiesPage"));
const PropertyDetailsPage = lazy(() => import("./pages/shared/PropertyDetailsPage"));
const ContactPage = lazy(() => import("./pages/shared/ContactPage"));
const NotFoundPage = lazy(() => import("./pages/shared/NotFoundPage"));

// Auth (less critical)
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

// Buyer
const WishlistPage = lazy(() => import("./pages/buyer/WishlistPage"));

// Seller
const SellerDashboard = lazy(() => import("./pages/seller/SellerDashboard"));
const AddProperty = lazy(() => import("./pages/seller/AddProperty"));
const SellerProperties = lazy(() => import("./pages/seller/SellerProperties"));
const EditProperty = lazy(() => import("./pages/seller/EditProperty"));
const SellerInquiries = lazy(() => import("./pages/seller/SellerInquiries"));

// Admin
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties"));
const AdminInquiries = lazy(() => import("./pages/admin/AdminInquiries"));
const AdminContacts = lazy(() => import("./pages/admin/AdminContacts"));
const AdminPendingSellers = lazy(() => import("./pages/admin/AdminPendingSellers"));

// Chat
const ChatPage = lazy(() => import("./pages/chat/ChatPage"));

// Profile (shared between buyer/seller)
const ProfilePage = lazy(() => import("./pages/shared/ProfilePage"));

const App = () => {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* ═══════════════════════════════════════ */}
        {/* PUBLIC ROUTES (Navbar + Footer)         */}
        {/* ═══════════════════════════════════════ */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Buyer routes that use public layout */}
          <Route element={<ProtectedRoute allowedRoles={["buyer"]} />}>
            <Route path="/wishlist" element={<WishlistPage />} />
          </Route>

          {/* Profile for any logged-in user */}
          <Route element={<ProtectedRoute allowedRoles={["buyer", "seller", "admin"]} />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ═══════════════════════════════════════ */}
        {/* AUTH ROUTES (No layout wrapper)         */}
        {/* ═══════════════════════════════════════ */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ═══════════════════════════════════════ */}
        {/* SELLER ROUTES (Dashboard Layout)        */}
        {/* ═══════════════════════════════════════ */}
        <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>
          <Route element={<DashboardLayout role="seller" />}>
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/properties" element={<SellerProperties />} />
            <Route path="/seller/properties/add" element={<AddProperty />} />
            <Route path="/seller/properties/edit/:id" element={<EditProperty />} />
            <Route path="/seller/inquiries" element={<SellerInquiries />} />
          </Route>
        </Route>

        {/* ═══════════════════════════════════════ */}
        {/* ADMIN ROUTES (Dashboard Layout)         */}
        {/* ═══════════════════════════════════════ */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<DashboardLayout role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/inquiries" element={<AdminInquiries />} />
            <Route path="/admin/contacts" element={<AdminContacts />} />
            <Route path="/admin/pending-sellers" element={<AdminPendingSellers />} />
          </Route>
        </Route>

        {/* ═══════════════════════════════════════ */}
        {/* CHAT ROUTES (Any authenticated user)    */}
        {/* ═══════════════════════════════════════ */}
        <Route element={<ProtectedRoute allowedRoles={["buyer", "seller"]} />}>
          <Route element={<PublicLayout />}>
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:chatId" element={<ChatPage />} />
          </Route>
        </Route>

        {/* ═══════════════════════════════════════ */}
        {/* 404 CATCH-ALL                           */}
        {/* ═══════════════════════════════════════ */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
