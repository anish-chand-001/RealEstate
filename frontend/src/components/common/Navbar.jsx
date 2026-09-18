import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FiMenu, FiX } from "react-icons/fi";
import { BsHouseDoor } from "react-icons/bs";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';


  const getNavLinks = () => {
    // Links everyone can see
    const links = [
      { name: "Home", href: "/" },
      { name: "Properties", href: "/properties" },
    ];

    // Links only logged-in buyers can see
    if (user && user?.role == "buyer") {
      links.push(
        { name: "Wishlist", href: "/wishlist" },
        { name: "Messages", href: "/chat-messages" },
      );
    }

    if (user && user?.role === "seller") {
      links.push(
        { name: "My Listings", href: "/my-listings" },
        { name: "Messages", href: "/chat-messages" },
      );
    }

    if (user && user?.role === "admin") {
      links.push({ name: "Admin Dashboard", href: "/admin-dashboard" });
    }

    // Contact is always visible at the end
    links.push({ name: "Contact Us", href: "/contact" });

    return links;
  };

  const currentNavLinks = getNavLinks();

  // Refs for GSAP targeting
  const navRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    // INITIAL LOAD ANIMATION
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power4.out" },
    );

    // MOBILE MENU TIMELINE SETUP
    timelineRef.current = gsap
      .timeline({ paused: true })
      .to(mobileMenuRef.current, {
        x: "0%",
        duration: 0.6,
        ease: "power3.inOut",
      })
      .fromTo(
        ".mobile-link",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" },
        "-=0.3",
      );

    return () => {
      if (timelineRef.current) timelineRef.current.kill();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      timelineRef.current.play();
    } else {
      timelineRef.current.reverse();
    }
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 ">
          {/* LOGO SECTION */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <BsHouseDoor className="text-3xl text-indigo-600" />
            <span className="font-bold text-2xl tracking-tight text-gray-900">
              Estate<span className="text-indigo-600">Prime</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex space-x-15">
            {currentNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-gray-600 font-medium hover:text-indigo-600 transition-colors duration-300 relative group"
              >
                {link.name}
                <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* DESKTOP ACTION BUTTONS (Dynamic Auth) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700 font-medium truncate max-w-[120px]">
                  Hi, {user.name?.split(" ")[0] || "User"}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-600 font-medium hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : !isAuthPage && (
              <>
                <Link
                  to="/login"
                  className="text-gray-900 font-medium hover:text-indigo-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU TOGGLE BUTTON */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-900 focus:outline-none z-50 relative"
            >
              {isOpen ? (
                <FiX className="text-3xl" />
              ) : (
                <FiMenu className="text-3xl" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div
        ref={mobileMenuRef}
        className="fixed top-0 right-0 w-[70%] max-w-sm h-screen bg-white shadow-2xl z-40 transform translate-x-full md:hidden flex flex-col justify-center px-8"
      >
        <nav className="flex flex-col space-y-6">
          {currentNavLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="mobile-link text-2xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          <div className="mobile-link pt-8 flex flex-col gap-4 border-t border-gray-100">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-600 px-5 py-3 rounded-md font-medium text-center hover:bg-red-100 transition"
              >
                Logout
              </button>
            ) : !isAuthPage && (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-indigo-50 text-indigo-600 px-5 py-3.5 rounded-xl font-medium text-center hover:bg-indigo-100 transition-colors duration-300"
                >
                  Login 
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-indigo-600 text-white px-5 py-3.5 rounded-xl font-medium text-center shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* BACKGROUND DIMMER */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
