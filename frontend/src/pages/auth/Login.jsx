import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { BsHouseDoor } from 'react-icons/bs';
import axios from 'axios';
import API_URL from '../../config';
import { useAuth } from '../../context/AuthContext'; // Import the Auth Context

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Extract the login function from your context

  // Check if there's a success message passed from the VerifyEmail page
  const successMessage = location.state?.message;

  // GSAP Refs
  const formRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    // Animate form elements staggering in
    gsap.fromTo(
      formRef.current.children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
    );

    // Animate the side image floating in
    if (imageRef.current) {
      gsap.fromTo(
        imageRef.current,
        { scale: 1.05, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5, ease: 'power3.out' }
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // Clear error when typing
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log("REACT IS SENDING THIS:", { email: formData.email, password: formData.password });
    try {
      const result = await login(formData.email, formData.password);
    if (result.success) {
      // If it worked, navigate to the Home page!
      navigate('/');
    } else {
      // If it failed, show the error message returned from the context
      setError(result.message);
      setIsLoading(false); // Stop the loading spinner
    }
      
      
    } catch (err) {
      console.error("Login Error:", err);
      // Display the exact error from the backend, or a fallback message
      const errorMessage = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Trigger Google Identity Services / OAuth flow here
    console.log("Initiating Google Login...");
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* LEFT SIDE: Image Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <div ref={imageRef} className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Luxury Home" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-end p-16 text-white w-full">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Welcome back to <br />Premium Real Estate
          </h2>
          <p className="text-gray-300 text-lg max-w-md">
            Access your saved properties, communicate with sellers, and continue your journey to finding the perfect space.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 relative">
        
        {/* Back to Home Link */}
        <Link 
          to="/" 
          className="absolute top-8 left-8 sm:left-12 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <BsHouseDoor className="text-xl" />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>

        <div className="w-full max-w-md">
          <div ref={formRef} className="flex flex-col gap-6">
            
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in to your account</h1>
              <p className="text-gray-600">Enter your details to proceed further.</p>
            </div>

            {/* Success Message (from Verify Email) */}
            {successMessage && !error && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl font-medium">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              
              {/* Email Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                  <FiMail className="absolute left-4 text-gray-400 text-lg" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-transparent border-none py-3.5 pl-11 pr-4 text-gray-900 focus:outline-none placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                  <FiLock className="absolute left-4 text-gray-400 text-lg" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-transparent border-none py-3.5 pl-11 pr-12 text-gray-900 focus:outline-none placeholder-gray-400"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">Or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Google Login Button */}
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <FcGoogle className="text-2xl" />
              Sign in with Google
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600 mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                Sign up
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;