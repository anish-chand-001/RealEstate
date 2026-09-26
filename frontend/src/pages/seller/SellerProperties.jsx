import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { propertyService } from '../../services/property.service';
import PaginationControls from '../../components/molecules/PaginationControls';

const SellerProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    propertyService.getMyProperties({ page, limit: 20 })
      .then((response) => {
        if (active) {
          setProperties(response.properties || []);
          setPagination(response.pagination || null);
        }
      })
      .catch((error) => {
        if (active) toast.error(error.response?.data?.message || 'Could not load your properties.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [page]);

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading your properties...</div>;
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Seller tools</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">My properties</h1>
        </div>
        <Link to="/seller/properties/add" className="rounded-xl bg-indigo-600 px-4 py-3 text-center font-semibold text-white">
          Add property
        </Link>
      </header>

      {properties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-gray-600">You haven’t listed any properties yet.</p>
          <Link to="/seller/properties/add" className="mt-4 inline-block font-semibold text-indigo-600">Create your first listing</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="px-5 py-4">Property</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Review</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property._id} className="border-b border-gray-100 last:border-0">
                  <td className="px-5 py-4 font-medium text-gray-900">{property.title}</td>
                  <td className="px-5 py-4 text-gray-600">{property.address?.city || '—'}</td>
                  <td className="px-5 py-4 text-gray-700">₹{Number(property.price || 0).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4 text-gray-700">{property.status}</td>
                  <td className="px-5 py-4 text-gray-700">{property.isVerified ? 'Verified' : 'Awaiting review'}</td>
                  <td className="px-5 py-4">
                    <Link to={`/seller/properties/edit/${property._id}`} className="font-semibold text-indigo-600 hover:text-indigo-800">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PaginationControls pagination={pagination} onPageChange={setPage} />
    </section>
  );
};

export default SellerProperties;
