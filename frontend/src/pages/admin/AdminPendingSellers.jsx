import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../services/api';
import PaginationControls from '../../components/molecules/PaginationControls';

const AdminPendingSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService.getPendingSellers({ page, limit: 25 })
      .then((response) => {
        if (!active) return;
        setSellers(response.data || response.pendingSellers || []);
        setPagination(response.pagination || null);
      })
      .catch((error) => { if (active) toast.error(getErrorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  const handleApprove = async (userId) => {
    try {
      await adminService.approveSeller(userId);
      setSellers((prev) => prev.filter((seller) => seller._id !== userId));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading pending sellers...</div>;
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h1 className="mb-5 text-2xl font-bold text-gray-900">Pending sellers</h1>
      <div className="space-y-4">
        {sellers.length === 0 ? (
          <p className="text-gray-500">No pending seller approvals.</p>
        ) : (
          sellers.map((seller) => (
            <div key={seller._id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-gray-900">{seller.name}</p>
                <p className="text-sm text-gray-500">{seller.email}</p>
              </div>
              <button
                onClick={() => handleApprove(seller._id)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
              >
                Approve
              </button>
            </div>
          ))
        )}
      </div>
      <PaginationControls pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default AdminPendingSellers;
