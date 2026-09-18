import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiMapPin, 
  FiHome, 
  FiBriefcase, 
  FiLayout, 
  FiStar 
} from 'react-icons/fi';
import FeaturedProperties from '../../components/cards/FeaturedProperties';

const LandingPage = () => {
  // --- STATE FOR SEARCH API ---
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // --- GSAP REFS ---
  const leftContentRef = useRef(null);
  const rightImageRef = useRef(null);
  const categoryHeaderRef = useRef(null);
  const categoriesRef = useRef(null);

  // --- API SEARCH HANDLER ---
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!location && !propertyType) return; // Prevent empty searches
    
    setIsSearching(true);

    try {
      // OPTION 1: Redirect to a properties page with query parameters (Standard Practice)
      // navigate(`/properties?location=${location}&type=${propertyType}`);

      // OPTION 2: Directly calling your backend API here
      const response = await fetch(`/api/properties/search?location=${location}&type=${propertyType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      console.log("Search Results:", data);
      
      // Do something with the data (e.g., pass to context, local state, or navigate with state)
      // navigate('/properties', { state: { searchResults: data } });

    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // --- ANIMATIONS ---
  useEffect(() => {
    // 1. Left Content Slide & Fade
    gsap.fromTo(
      leftContentRef.current.children,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
    );

    // 2. Right Image Float In
    gsap.fromTo(
      rightImageRef.current,
      { x: 50, opacity: 0, scale: 0.95 },
      { x: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out', delay: 0.4 }
    );

    // 3. Category Header
    gsap.fromTo(
      categoryHeaderRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.8 }
    );

    // 4. Category Cards Stagger
    gsap.fromTo(
      categoriesRef.current.children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 1 }
    );
  }, []);

  // --- CATEGORY DATA ---
  const categories = [
    { name: 'Modern Flats', icon: <FiLayout className="text-4xl" />, color: 'bg-blue-50 text-blue-600' },
    { name: 'Luxury Villas', icon: <FiStar className="text-4xl" />, color: 'bg-amber-50 text-amber-600' },
    { name: 'Penthouses', icon: <FiHome className="text-4xl" />, color: 'bg-purple-50 text-purple-600' },
    { name: 'Commercials', icon: <FiBriefcase className="text-4xl" />, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden">
    

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Tagline, Desc, & Search */}
          <div ref={leftContentRef} className="max-w-2xl">
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-sm mb-6 border border-indigo-100">
              Premium Real Estate Network
            </span>
            
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
              Discover Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Perfect Space
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Whether you are looking for a cozy modern flat or a sprawling luxury villa, our curated listings bring the best properties directly to you.
            </p>

            {/* Search Box */}
            <form 
              onSubmit={handleSearch}
              className="bg-white p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <FiMapPin className="text-gray-400 text-xl mr-3 flex-shrink-0" />
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location or Zip Code" 
                  className="w-full bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400"
                />
              </div>

              <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <FiHome className="text-gray-400 text-xl mr-3 flex-shrink-0" />
                <select 
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none text-gray-700 cursor-pointer"
                >
                  <option value="">Property Type</option>
                  <option value="flat">Modern Flat</option>
                  <option value="villa">Luxury Villa</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={isSearching}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
              >
                {isSearching ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSearch className="text-lg" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Side: Framed Image */}
          <div ref={rightImageRef} className="relative hidden lg:block">
            {/* Decorative background blur element */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-200 to-purple-200 rounded-[2.5rem] blur-2xl opacity-60 z-0"></div>
            
            {/* The "Frame" */}
            <div className="relative z-10 bg-white p-4 rounded-[2rem] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Luxury Property" 
                className="rounded-2xl w-full h-[550px] object-cover"
              />
              
              {/* Floating Badge on the image */}
              <div className="absolute bottom-10 -left-8 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-gray-100">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl">
                  <FiStar />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Top Rated</p>
                  <p className="text-lg font-bold text-gray-900">Premium Villas</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div ref={categoryHeaderRef} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse by Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of property types tailored to fit your specific lifestyle and business needs.
            </p>
          </div>

          <div ref={categoriesRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="group cursor-pointer bg-white aspect-square rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 flex flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:-translate-y-2"
                onClick={() => navigate(`/properties?category=${category.name.toLowerCase()}`)}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${category.color}`}>
                  {category.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore Listings &rarr;
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>
      
      <FeaturedProperties />
    </div>
  );
};

export default LandingPage; 