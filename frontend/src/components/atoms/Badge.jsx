/**
 * Badge atom for status/type indicators.
 * @param {'indigo'|'green'|'red'|'amber'|'gray'|'blue'|'purple'} color
 * @param {'sm'|'md'} size
 */
const Badge = ({ children, color = 'indigo', size = 'sm', className = '' }) => {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${colors[color]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
