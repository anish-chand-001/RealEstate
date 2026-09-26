import { NavLink } from 'react-router-dom';
import { FiX, FiLogOut } from 'react-icons/fi';
import {
  FiGrid,
  FiHome,
  FiPlus,
  FiMessageSquare,
  FiUser,
  FiUsers,
  FiBarChart2,
  FiCheckCircle,
  FiMail,
  FiInbox,
} from 'react-icons/fi';
import { BsHouseDoor } from 'react-icons/bs';
import { useAuth } from '../../hooks/useAuth';

/**
 * Sidebar navigation for dashboards.
 * Renders different menu items based on role prop.
 */
const Sidebar = ({ role, isOpen, onToggle }) => {
  const { user, logout } = useAuth();

  const sellerLinks = [
    { name: 'Dashboard', to: '/seller/dashboard', icon: <FiGrid /> },
    { name: 'My Properties', to: '/seller/properties', icon: <FiHome /> },
    { name: 'Add Property', to: '/seller/properties/add', icon: <FiPlus /> },
    { name: 'Inquiries', to: '/seller/inquiries', icon: <FiMessageSquare /> },
    { name: 'Messages', to: '/chat', icon: <FiMail /> },
    { name: 'Profile', to: '/profile', icon: <FiUser /> },
  ];

  const adminLinks = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: <FiBarChart2 /> },
    { name: 'Users', to: '/admin/users', icon: <FiUsers /> },
    { name: 'Properties', to: '/admin/properties', icon: <FiHome /> },
    { name: 'Inquiries', to: '/admin/inquiries', icon: <FiInbox /> },
    { name: 'Contacts', to: '/admin/contacts', icon: <FiMail /> },
    { name: 'Pending Sellers', to: '/admin/pending-sellers', icon: <FiCheckCircle /> },
  ];

  const links = role === 'admin' ? adminLinks : sellerLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-50 transition-transform duration-300 ease-in-out flex flex-col
          w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BsHouseDoor className="text-2xl text-indigo-600" />
            <span className="font-bold text-lg text-gray-900">
              Estate<span className="text-indigo-600">Prime</span>
            </span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {user?.name || 'User'}
          </p>
          <p className="text-xs text-gray-500 capitalize">{role} Dashboard</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              onClick={onToggle}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <FiLogOut className="text-lg" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
