import { FiInbox } from 'react-icons/fi';

/**
 * EmptyState atom — displayed when a list has no items.
 */
const EmptyState = ({
  icon: Icon = FiInbox,
  title = 'Nothing here yet',
  message = '',
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
        <Icon className="text-3xl" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      {message && <p className="text-gray-500 max-w-md mb-6">{message}</p>}
      {action && action}
    </div>
  );
};

export default EmptyState;
