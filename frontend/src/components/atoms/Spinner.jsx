/**
 * Spinner atom — shows a loading indicator.
 * @param {'sm'|'md'|'lg'} size
 */
const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
      />
    </div>
  );
};

/**
 * Full page loading spinner.
 */
export const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spinner size="lg" />
  </div>
);

export default Spinner;
