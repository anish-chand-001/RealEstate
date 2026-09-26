/**
 * Generic Skeleton atom for loading states.
 * @param {'line'|'circle'|'card'|'block'} variant
 */
const Skeleton = ({ variant = 'line', className = '', width, height }) => {
  const base = 'bg-gray-200 animate-pulse rounded-lg';

  const variants = {
    line: `${base} h-4 w-full`,
    circle: `${base} rounded-full`,
    block: `${base} w-full`,
    card: `${base} w-full h-64 rounded-2xl`,
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return <div className={`${variants[variant]} ${className}`} style={style} />;
};

export default Skeleton;
