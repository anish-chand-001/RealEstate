import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../hooks/useDebounce';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../../components/cards/PropertyCard'; // Adjust this import path if needed
import PropertyCardSkeleton from '../../components/cards/PropertyCardSkeleton';
import { propertyService } from '../../services/property.service';
import toast from 'react-hot-toast';
const PropertiesPage = () => {
  const [searchParams] = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);


  // 1. Initialize filter state based on your Mongoose Schema
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    propertyType: searchParams.get('propertyType') || '',
    minPrice: '',
    maxPrice: '',
    bhk: '',
    furnished: '',
  }));

  // 2. Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1);
  };

  const debouncedSearch = useDebounce(filters.search, 350);
  const queryFilters = { ...filters, search: debouncedSearch };
  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', queryFilters, page],
    queryFn: () => propertyService.getAll({ ...queryFilters, page, limit: 9 }),
    placeholderData: keepPreviousData,
  });
  const properties = data?.properties || [];
  const pagination = data?.pagination;

  useEffect(() => {
    if (error) toast.error(error.response?.data?.message || 'Could not load properties.');
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
              Discover Properties
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              Find your next dream home or investment opportunity.
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {showFilters ? <FiX /> : <FiFilter />}
            {showFilters ? 'Hide Filters' : 'Filter Results'}
          </button>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Search Title/City */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by title, city, or area..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              {/* Property Type (Mapped from your Schema enum) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                >
                  <option value="">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Villa">Villa</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Land">Land</option>
                  <option value="Office">Office</option>
                  <option value="Shop">Shop</option>
                  <option value="Warehouse">Warehouse</option>
                </select>
              </div>

              {/* Furnished Status (Mapped from your Schema enum) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
                <select
                  name="furnished"
                  value={filters.furnished}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                >
                  <option value="">Any</option>
                  <option value="Furnished">Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min ($)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max ($)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              {/* BHK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. Bedrooms (BHK)</label>
                <select
                  name="bhk"
                  value={filters.bhk}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                >
                  <option value="">Any</option>
                  <option value="1">1+ BHK</option>
                  <option value="2">2+ BHK</option>
                  <option value="3">3+ BHK</option>
                  <option value="4">4+ BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              </div>

              {/* Reset Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={() => { setFilters({ search: '', propertyType: '', minPrice: '', maxPrice: '', bhk: '', furnished: '' }); setPage(1); }}
                  className="w-full py-2.5 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Properties Grid Container */}
        {isLoading ? (
          // Render 6 skeleton cards while loading
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.length > 0 ? (
              properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col justify-center items-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-900 font-bold text-xl mb-2">No properties match your search.</p>
                <p className="text-gray-500">Try adjusting your filters or clearing them to see more results.</p>
              </div>
            )}
          </div>
        )}

        {!isLoading && pagination?.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button type="button" disabled={!pagination.hasPrevPage} onClick={() => setPage((current) => current - 1)} className="rounded-lg border px-4 py-2 disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-600">Page {pagination.currentPage} of {pagination.totalPages}</span>
            <button type="button" disabled={!pagination.hasNextPage} onClick={() => setPage((current) => current + 1)} className="rounded-lg border px-4 py-2 disabled:opacity-50">Next</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PropertiesPage;
