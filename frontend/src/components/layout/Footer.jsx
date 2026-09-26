import { Link } from 'react-router-dom';
import { BsHouseDoor } from 'react-icons/bs';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

/**
 * Footer — shared across all public pages.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <BsHouseDoor className="text-2xl text-indigo-400" />
              <span className="font-bold text-xl text-white">
                Estate<span className="text-indigo-400">Prime</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your trusted partner for premium real estate. Whether buying, selling, or renting, we connect you with the best properties.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: 'Properties', to: '/properties' },
                { name: 'Contact Us', to: '/contact' },
                { name: 'Login', to: '/login' },
                { name: 'Register', to: '/register' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-white font-semibold mb-4">Property Types</h4>
            <ul className="space-y-3">
              {['Apartments', 'Villas', 'Houses', 'Commercial', 'Land'].map((type) => (
                <li key={type}>
                  <Link
                    to={`/properties?propertyType=${type === 'Apartments' ? 'Apartment' : type}`}
                    className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    {type}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <FiMapPin className="flex-shrink-0 text-indigo-400" />
                <span>123 Business Avenue, New Delhi, India</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <FiPhone className="flex-shrink-0 text-indigo-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <FiMail className="flex-shrink-0 text-indigo-400" />
                <span>info@estateprime.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} EstatePrime. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
