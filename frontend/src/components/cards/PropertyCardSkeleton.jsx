import React from 'react';

const PropertyCardSkeleton = () => {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 animate-pulse w-full">
      {/* Image Skeleton */}
      <div className="bg-gray-200 rounded-xl h-64 w-full mb-4"></div>
      
      {/* Title & Location Skeleton */}
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
      
      {/* Specs Skeleton */}
      <div className="flex justify-between border-t border-gray-200 pt-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
};

export default PropertyCardSkeleton;