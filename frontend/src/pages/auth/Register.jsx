import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { BsHouseDoor } from 'react-icons/bs';
import axios from 'axios';
import API_URL from '../../config';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer', // default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

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
    if (error) setError('');
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // BACKEND CONNECTION POINT
      const response = await axios.post(`${API_URL}/api/auth/register`, formData)
    navigate('/verify-email', { state: { email: formData.email } });

    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log("Initiating Google Signup...");
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* LEFT SIDE: Image Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <div ref={imageRef} className="absolute inset-0 w-full h-full">
          <img 
            // Using a different high-quality interior image for the register page
            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Luxury Interior" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-end p-16 text-white w-full">
          <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold text-sm mb-6 border border-white/30 w-max">
            Join the Network
          </span>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Discover a new way <br />to experience real estate.
          </h2>
          <p className="text-gray-300 text-lg max-w-md">
            Whether you are looking for your dream home or selling premium properties, EstatePrime connects you with the best.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 relative overflow-y-auto">
        
        {/* Back to Home Link */}
        <Link 
          to="/" 
          className="absolute top-8 left-8 sm:left-12 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium z-10"
        >
          <BsHouseDoor className="text-xl" />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>

        <div className="w-full max-w-md mt-10 lg:mt-0">
          <div ref={formRef} className="flex flex-col gap-6">
            
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h1>
              <p className="text-gray-600">Start your real estate journey with us today.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              
              {/* Role Selection */}
              <div className="flex flex-col gap-2 mb-2">
                <label className="text-sm font-semibold text-gray-700">I want to...</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('buyer')}
                    className={`flex-1 py-3 rounded-xl font-medium border transition-all ${
                      formData.role === 'buyer'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Buy / Rent
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('seller')}
                    className={`flex-1 py-3 rounded-xl font-medium border transition-all ${
                      formData.role === 'seller'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    List Properties
                  </button>
                </div>
              </div>

              {/* Full Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                  <FiUser className="absolute left-4 text-gray-400 text-lg" />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full bg-transparent border-none py-3.5 pl-11 pr-4 text-gray-900 focus:outline-none placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                  <FiMail className="absolute left-4 text-gray-400 text-lg" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-transparent border-none py-3.5 pl-11 pr-4 text-gray-900 focus:outline-none placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                  <FiLock className="absolute left-4 text-gray-400 text-lg" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    required
                    minLength="8"
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
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">Or sign up with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Google Signup Button */}
            <button 
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <FcGoogle className="text-2xl" />
              Sign up with Google
            </button>

            {/* Sign In Link */}
            <p className="text-center text-gray-600 mt-2">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                Sign in
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;