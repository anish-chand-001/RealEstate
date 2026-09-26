/**
 * Property type options matching the backend Mongoose enum.
 */
export const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Villa',
  'Commercial',
  'Land',
  'Office',
  'Shop',
  'Warehouse',
  'Other',
];

/**
 * Property status options matching the backend Mongoose enum.
 */
export const PROPERTY_STATUSES = ['Available', 'Sold', 'Rented', 'Pending'];

/**
 * Furnished options matching the backend Mongoose enum.
 */
export const FURNISHED_OPTIONS = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

/**
 * User roles matching the backend Mongoose enum.
 */
export const USER_ROLES = ['buyer', 'seller', 'admin'];

/**
 * Common amenities for property listing forms.
 */
export const COMMON_AMENITIES = [
  'Swimming Pool',
  'Gym',
  '24/7 Security',
  'Parking',
  'Garden',
  'Power Backup',
  'Lift',
  'CCTV',
  'Club House',
  'Children Play Area',
  'Intercom',
  'Rain Water Harvesting',
  'Fire Safety',
  'Wi-Fi',
  'Visitor Parking',
  'Jogging Track',
];

/**
 * Sort options for property listings.
 */
export const SORT_OPTIONS = [
  { label: 'Newest First', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Viewed', value: 'most_viewed' },
  { label: 'Oldest First', value: 'oldest' },
];

/**
 * BHK filter options.
 */
export const BHK_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '1+ BHK', value: '1' },
  { label: '2+ BHK', value: '2' },
  { label: '3+ BHK', value: '3' },
  { label: '4+ BHK', value: '4' },
  { label: '5+ BHK', value: '5' },
];
