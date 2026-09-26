import { BiBed } from 'react-icons/bi';
import { FiHome, FiMaximize } from 'react-icons/fi';

/**
 * PropertySpecs molecule — shared BHK/Baths/SqFt row.
 * Used in both PropertyCard and PropertyDetailsPage.
 */
const PropertySpecs = ({ bhk, bathrooms, area, className = '' }) => {
  return (
    <div className={`flex items-center justify-between text-gray-600 ${className}`}>
      {bhk !== undefined && (
        <div className="flex items-center gap-2" title="Bedrooms">
          <BiBed className="text-indigo-600 text-lg" />
          <span className="font-medium text-sm">{bhk} BHK</span>
        </div>
      )}
      {bathrooms !== undefined && (
        <div className="flex items-center gap-2" title="Bathrooms">
          <FiHome className="text-indigo-600" />
          <span className="font-medium text-sm">{bathrooms} Bath</span>
        </div>
      )}
      {area !== undefined && (
        <div className="flex items-center gap-2" title="Area">
          <FiMaximize className="text-indigo-600" />
          <span className="font-medium text-sm">{area} sqft</span>
        </div>
      )}
    </div>
  );
};

export default PropertySpecs;
