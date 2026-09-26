/**
 * Reusable Input atom with icon slot and error state.
 */
const Input = ({
  label,
  icon,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div
        className={`relative flex items-center bg-gray-50 rounded-xl border transition-all
          ${error ? 'border-red-400 focus-within:ring-red-500/10 focus-within:border-red-500' : 'border-gray-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10'}
        `}
      >
        {icon && (
          <span className="absolute left-4 text-gray-400 text-lg pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full bg-transparent border-none py-3 text-gray-900 focus:outline-none placeholder-gray-400 ${icon ? 'pl-11 pr-4' : 'px-4'}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};

export default Input;
