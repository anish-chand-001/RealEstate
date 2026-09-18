import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/shared/LandingPage";
import Navbar from "./components/common/Navbar";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </div>
  );
};

export default App;
