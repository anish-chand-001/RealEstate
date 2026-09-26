import { getInitials } from '../../utils/formatters';

/**
 * Avatar atom — shows profile image or fallback initials.
 * @param {'sm'|'md'|'lg'|'xl'} size
 */
const Avatar = ({ src, name = '', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white shadow-sm ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center ring-2 ring-white shadow-sm ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
