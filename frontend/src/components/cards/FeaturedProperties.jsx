import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import PropertyCardSkeleton from './PropertyCardSkeleton';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../services/api';
import { propertyService } from '../../services/property.service';

const FeaturedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const gridRef = useRef(null);

  // 1. FETCH DATA
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setIsLoading(true);

        const response = await propertyService.getAll({ limit: 3, sort: 'most_viewed' });
        setProperties(response.properties || []);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  // 2. ANIMATE CARDS WHEN LOADED
  useEffect(() => {
    if (!isLoading && gridRef.current) {
      const animation = gsap.fromTo(
        gridRef.current.children,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
      return () => animation.kill();
    }
  }, [isLoading]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Properties</h2>
            <p className="text-gray-600">Hand-picked selections of our most exclusive listings.</p>
          </div>
          <Link
            to="/properties"
            className="hidden md:block text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
          >
            View All &rarr;
          </Link>
        </div>

        {/* LOADING SKELETON OR PROPERTY GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Generate 3 skeletons */}
            {[1, 2, 3].map((item) => (
              <PropertyCardSkeleton key={item} />
            ))}
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Render actual PropertyCards */}
            {properties.map((property) => (
              <div key={property._id || property.id} className="opacity-0"> {/* Initial opacity 0 for GSAP */}
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}

        {/* Mobile View All Button */}
        <Link
          to="/properties"
          className="md:hidden block w-full mt-8 bg-indigo-50 text-indigo-600 font-semibold py-3 rounded-xl hover:bg-indigo-100 transition-colors text-center"
        >
          View All Properties
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProperties;
