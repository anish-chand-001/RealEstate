import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { BsHouseDoor } from 'react-icons/bs';
import axios from 'axios';
import API_URL from '../../config';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const emailToVerify = location.state?.email;

  // Refs for auto-focusing inputs and GSAP animations
  const inputRefs = useRef([]);
  const formRef = useRef(null);

  useEffect(() => {
    // If someone visits this page directly without an email, send them back to register
    if (!emailToVerify) {
      navigate('/register');
      return;
    }

    // GSAP Animation
    gsap.fromTo(
      formRef.current.children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
    );
    
    // Auto-focus the first input on load
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [emailToVerify, navigate]);

  // Handle typing in the OTP boxes
  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return; // Only allow numbers

    const newOtp = [...otp];
    // Take only the last character in case they type fast
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError('');

    // Move to next input automatically
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace to move to previous box
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle pasting a 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pasteData.some(char => isNaN(char))) return; // Ensure it's all numbers

    const newOtp = [...otp];
    pasteData.forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    
    // Focus the last filled input
    const focusIndex = pasteData.length < 6 ? pasteData.length : 5;
    inputRefs.current[focusIndex].focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const verificationCode = otp.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {

      await axios.post(`${API_URL}/api/auth/verify-email`, { 
        email: emailToVerify, 
        code : verificationCode 
      });
      
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Redirect to login after a short delay so they see the success message
      setTimeout(() => {
        navigate('/login', { state: { message: 'Email verified successfully. Please log in.' } });
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
      setOtp(['', '', '', '', '', '']); // Clear OTP on error
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    // Logic to call your resend OTP endpoint
    console.log("Resending OTP to:", emailToVerify);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4 relative">
      
      {/* Back to Home */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium"
      >
        <BsHouseDoor className="text-xl" />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-100">
        <div ref={formRef} className="flex flex-col items-center text-center gap-6">
          
          {/* Icon */}
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-2">
            <FiCheckCircle className="text-3xl" />
          </div>

          {/* Headers */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              We sent a verification code to <br/>
              <span className="font-semibold text-gray-900">{emailToVerify || 'your email'}</span>
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="w-full p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-medium mt-4">
              Email verified successfully! Redirecting to login...
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="w-full p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-left">
                  {error}
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleVerify} className="w-full flex flex-col gap-8 mt-2">
                
                {/* 6-Digit Grid */}
                <div className="flex justify-between gap-2 sm:gap-4" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-gray-900"
                    />
                  ))}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify Account
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </form>

              {/* Resend Link */}
              <p className="text-gray-600 text-sm">
                Didn't receive the email?{' '}
                <button 
                  onClick={handleResend}
                  type="button" 
                  className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Click to resend
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;