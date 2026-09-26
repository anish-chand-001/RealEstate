import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { propertyService } from '../../services/property.service';
import { inquiryService } from '../../services/inquiry.service';
import { chatService } from '../../services/chat.service';
import { wishlistService } from '../../services/wishlist.service';
import { FiMapPin, FiHome, FiMaximize, FiHeart, FiShare2, FiCheckCircle, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import { BiBed } from 'react-icons/bi';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [message, setMessage] = useState('I am interested in learning more about this property.');
  const [sending, setSending] = useState(false);
  const [wishlistedOverride, setWishlistedOverride] = useState({ propertyId: null, value: null });
  const { data: propertyResponse, isLoading: loading, error: propertyError } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getById(id),
    enabled: Boolean(id),
  });
  const property = propertyResponse?.property || null;
  const { data: wishlistResponse } = useQuery({
    queryKey: ['wishlist', user?._id || user?.id],
    queryFn: wishlistService.getAll,
    enabled: user?.role === 'buyer',
  });
  const isWishlisted = wishlistedOverride.propertyId === id
    ? wishlistedOverride.value
    : (wishlistResponse?.wishlist || []).some((item) => (item.property?._id || item.property) === id);


  useEffect(() => {
    if (propertyError) {
      toast.error(propertyError.response?.data?.message || 'Could not load this property.');
    }
  }, [propertyError]);


  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    try {
      if (isWishlisted) {
        await wishlistService.remove(id);
        setWishlistedOverride({ propertyId: id, value: false });
        toast.success('Removed from your wishlist.');
      } else {
        await wishlistService.add(id);
        setWishlistedOverride({ propertyId: id, value: true });
        toast.success('Added to your wishlist.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update your wishlist.');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Property link copied.');
    } catch {
      toast.error('Could not copy the property link.');
    }
  };

  const handleInquiry = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    if (user.role !== 'buyer') {
      toast.error('Only buyers can contact a seller about a property.');
      return;
    }
    setSending(true);
    try {
      await inquiryService.send({ propertyId: id, message });
      toast.success('Your inquiry was sent to the seller.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send your inquiry. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleContactAgent = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    if (user.role !== 'buyer') {
      toast.error('Only buyers can start a conversation with a seller.');
      return;
    }
    if (!property?.seller?._id) {
      toast.error('Seller details are unavailable for this property.');
      return;
    }
    setSending(true);
    try {
      const chat = await chatService.startChat({ propertyId: id, sellerId: property.seller._id });
      navigate(`/chat/${chat._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Could not open a conversation.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="min-h-[50vh] p-8 text-center text-gray-600">Loading property...</div>;
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
        <Link to="/properties" className="text-indigo-600 hover:underline flex items-center gap-2">
          <FiArrowLeft /> Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Image Section */}
      <div className="w-full h-[50vh] md:h-[60vh] relative bg-gray-900">
        <img
          src={property.images?.[0] || ''}
          alt={property.title}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute top-4 left-4 md:top-8 md:left-8">
          <Link to="/properties" className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold text-gray-900 shadow-sm flex items-center gap-2 hover:bg-white transition-colors">
            <FiArrowLeft /> Back
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <div>
                  <div className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                    {property.propertyType}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-500 text-lg">
                    <FiMapPin className="mr-2 flex-shrink-0" />
                    <span>{[property.address?.area, property.address?.city, property.address?.state].filter(Boolean).join(', ')}</span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <h2 className="text-3xl font-extrabold text-indigo-600 mb-2">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(property.price || 0)}</h2>
                  <div className="flex items-center gap-3 md:justify-end">
                    <button
                      onClick={handleWishlistToggle}
                      className="p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <FiHeart className={`text-xl ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </button>
                    <button type="button" onClick={handleShare} aria-label="Copy property link" className="p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                      <FiShare2 className="text-xl text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100">
                <div className="flex flex-col items-center justify-center text-center">
                  <BiBed className="text-2xl text-indigo-600 mb-1" />
                  <span className="font-bold text-gray-900">{property.features?.bhk ?? 0}</span>
                  <span className="text-sm text-gray-500">Bedrooms</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center border-x border-gray-100">
                  <FiHome className="text-2xl text-indigo-600 mb-1" />
                  <span className="font-bold text-gray-900">{property.features?.bathrooms ?? 0}</span>
                  <span className="text-sm text-gray-500">Bathrooms</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <FiMaximize className="text-2xl text-indigo-600 mb-1" />
                  <span className="font-bold text-gray-900">{property.features?.area ?? 0}</span>
                  <span className="text-sm text-gray-500">Square Feet</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">About this property</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {property.description}
              </p>
            </div>

            {/* Features & Amenities */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Features & Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(property.amenities || []).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-700">
                    <FiCheckCircle className="text-indigo-600 flex-shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Interested in this property?</h3>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <img
                  src={property.seller?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(property.seller?.name || 'Seller')}`}
                  alt={property.seller?.name || 'Property seller'}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{property.seller?.name || 'Property seller'}</h4>
                  <p className="text-sm text-gray-500">Listed by seller</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleInquiry}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input type="text" value={user?.name || ''} readOnly className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none" placeholder="Sign in to send an inquiry" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" value={user?.email || ''} readOnly className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none" placeholder="Sign in to send an inquiry" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows="3" required maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none" />
                </div>
                <button type="submit" disabled={sending || !message.trim()} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
                  <FiCalendar /> {sending ? 'Sending...' : 'Send Inquiry'}
                </button>
                <button type="button" onClick={handleContactAgent} disabled={sending} className="w-full bg-white text-indigo-600 border-2 border-indigo-600 font-semibold py-3 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50">
                  Message Seller
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
