import { optimizeImage } from '../../utils/optimizeImage';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { wishlistService } from '../../services/wishlist.service';
import { Link } from 'react-router-dom';
import { FiMapPin, FiHome, FiMaximize, FiHeart } from 'react-icons/fi';
import { BiBed } from 'react-icons/bi';
// import { useAuth } from '../../hooks/useAuth'; // Import if you need to pass a token

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const propertyId = property._id || property.id;
  // 1. Initialize state based on whether the backend says it's already in the wishlist
  const [isWishlisted, setIsWishlisted] = useState(Boolean(property.isWishlisted));
  const [isUpdating, setIsUpdating] = useState(false);

  // const { user } = useAuth(); // Get user token if needed for the API headers

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent spam-clicking the heart button while an API call is in progress
    if (isUpdating) return;

    // Optimistic UI update: instantly change the UI before the server responds
    const previousState = isWishlisted;
    setIsWishlisted(!isWishlisted);
    setIsUpdating(true);

    if (!user) {
      setIsWishlisted(previousState);
      setIsUpdating(false);
      navigate('/login');
      return;
    }

    try {
      if (previousState) {
        await wishlistService.remove(propertyId);
      } else {
        await wishlistService.add(propertyId);
      }
    } catch (error) {
      setIsWishlisted(previousState);
      toast.error(error.response?.data?.message || 'Could not update your wishlist.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Link
      to={`/properties/${propertyId}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1 relative"
    >
      {/* Image Wrapper */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.images?.[0] || property.image || 'https://placehold.co/800x600?text=Property'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Left Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900 shadow-sm w-max">
            {typeof property.price === 'number' ? `₹${property.price.toLocaleString('en-IN')}` : property.price}
          </div>
          <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm w-max">
            {property.propertyType || property.type}
          </div>
        </div>

        {/* Wishlist Toggle Button */}
        <button
          type="button"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleWishlistClick}
          disabled={isUpdating}
          className={`absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition-transform duration-200 ${isUpdating ? 'opacity-75 cursor-wait' : 'hover:scale-110 cursor-pointer'}`}
        >
          <FiHeart
            className={`text-xl transition-colors duration-300 ${
              isWishlisted
                ? 'fill-red-500 text-red-500'
                : 'text-gray-400 hover:text-red-500'
            }`}
          />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
          {property.title}
        </h3>
        <div className="flex items-center text-gray-500 mb-5">
          <FiMapPin className="mr-2 flex-shrink-0" />
          <span className="text-sm truncate">{property.location || [property.address?.area, property.address?.city, property.address?.state].filter(Boolean).join(', ')}</span>
        </div>

        {/* Property Specs */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-gray-600 mb-5">
          <div className="flex items-center gap-2" title="Bedrooms">
            <BiBed className="text-indigo-600 text-lg" />
            <span className="font-medium text-sm">{property.beds ?? property.features?.bhk ?? 0}</span>
          </div>
          <div className="flex items-center gap-2" title="Bathrooms">
            <FiHome className="text-indigo-600" />
            <span className="font-medium text-sm">{property.baths ?? property.features?.bathrooms ?? 0}</span>
          </div>
          <div className="flex items-center gap-2" title="Square Feet">
            <FiMaximize className="text-indigo-600" />
            <span className="font-medium text-sm">{property.sqft ?? property.features?.area ?? 0} sqft</span>
          </div>
        </div>

        {/* View Details Button */}
        <div className="w-full bg-indigo-50 text-indigo-600 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
          <span>View Details</span>
          <span className="group-hover:translate-x-1 transition-transform duration-300">
            &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
