/**
 * Reusable Select dropdown atom with icon slot.
 */
const Select = ({
  label,
  icon,
  options = [],
  placeholder = 'Select...',
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div
        className={`relative flex items-center bg-gray-50 rounded-xl border transition-all
          ${error ? 'border-red-400' : 'border-gray-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10'}
        `}
      >
        {icon && (
          <span className="absolute left-4 text-gray-400 text-lg pointer-events-none">
            {icon}
          </span>
        )}
        <select
          id={selectId}
          className={`w-full bg-transparent border-none py-3 text-gray-900 focus:outline-none cursor-pointer appearance-none ${icon ? 'pl-11 pr-10' : 'px-4 pr-10'}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) =>
            typeof opt === 'string' ? (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ) : (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ),
          )}
        </select>
        {/* Dropdown arrow */}
        <span className="absolute right-3 text-gray-400 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {error && <p className="text-sm text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};

export default Select;
