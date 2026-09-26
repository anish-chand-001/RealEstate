import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';
import PaginationControls from '../../components/molecules/PaginationControls';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService.getProperties({ isVerified: false, page, limit: 25 })
      .then((response) => {
        if (!active) return;
        setProperties(response.data || []);
        setPagination(response.pagination || null);
      })
      .catch((error) => { if (active) toast.error(error.response?.data?.message || 'Failed to load properties.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  const handleVerify = async (propertyId) => {
    setVerifyingId(propertyId);
    try {
      await adminService.verifyProperty(propertyId);
      setProperties((current) => current.filter((property) => property._id !== propertyId));
      toast.success('Property verified and published.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not verify property.');
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading properties...</div>;
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h1 className="mb-5 text-2xl font-bold text-gray-900">Properties</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 text-sm text-gray-500">
              <th className="py-3 pr-4">Title</th>
              <th className="py-3 pr-4">Seller</th>
              <th className="py-3 pr-4">Type</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Review</th>
            </tr>
          </thead>
          <tbody>
            {properties.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-gray-500">No listings need review.</td></tr>
            ) : properties.map((property) => (
              <tr key={property._id} className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium text-gray-900">{property.title}</td>
                <td className="py-3 pr-4 text-gray-600">{property.seller?.name || 'Unknown'}</td>
                <td className="py-3 pr-4 text-gray-700">{property.propertyType}</td>
                <td className="py-3 pr-4">
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                    {property.status}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <button type="button" onClick={() => handleVerify(property._id)} disabled={verifyingId === property._id} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    {verifyingId === property._id ? 'Verifying…' : 'Verify listing'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationControls pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default AdminProperties;
