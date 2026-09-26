import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiHome, FiMessageSquare, FiPlus } from 'react-icons/fi';
import { propertyService } from '../../services/property.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../services/api';
import { optimizeImage } from '../../utils/optimizeImage';

const SellerDashboard = () => {
  const [stats, setStats] = useState({ totalProperties: 0, totalViews: 0, totalInquiries: 0, activeListings: 0, statusBreakdown: {} });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    propertyService.getSellerDashboard()
      .then((response) => {
        if (!active) return;
        setStats(response.stats || response.data?.stats || { totalProperties: 0, totalViews: 0, totalInquiries: 0, activeListings: 0, statusBreakdown: {} });
        setProperties(response.properties || response.data?.properties || []);
      })
      .catch((error) => { if (active) toast.error(getErrorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const statCards = [
    { label: 'Properties', value: stats.totalProperties, icon: <FiHome /> },
    { label: 'Views', value: stats.totalViews, icon: <FiBarChart2 /> },
    { label: 'Inquiries', value: stats.totalInquiries, icon: <FiMessageSquare /> },
    { label: 'Active Listings', value: stats.activeListings, icon: <FiPlus /> },
  ];

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Seller overview</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <Link to="/seller/properties/add" className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white">
          + Add property
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-xl text-indigo-600">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Recent listings</h2>
          <Link to="/seller/properties" className="text-sm font-semibold text-indigo-600">Manage all</Link>
        </div>

        {properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
            You haven’t added any listings yet.
          </div>
        ) : (
          <div className="space-y-4">
            {properties.slice(0, 5).map((property) => (
              <div key={property._id || property.id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <img src={optimizeImage(property.images?.[0] || property.image, 320)} alt={property.title} loading="lazy" className="h-16 w-16 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{property.title}</h3>
                    <p className="text-sm text-gray-500">{property.address?.city || property.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {property.status || 'Available'}
                  </span>
                  <Link to={`/seller/properties/edit/${property._id || property.id}`} className="text-sm font-semibold text-indigo-600">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
