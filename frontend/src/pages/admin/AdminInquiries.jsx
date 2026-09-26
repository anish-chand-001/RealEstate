import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../services/api';
import PaginationControls from '../../components/molecules/PaginationControls';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService.getInquiries({ page, limit: 25 })
      .then((response) => {
        if (!active) return;
        setInquiries(response.data || []);
        setPagination(response.pagination || null);
      })
      .catch((error) => { if (active) toast.error(getErrorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading inquiries...</div>;
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h1 className="mb-5 text-2xl font-bold text-gray-900">Inquiries</h1>
      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <p className="text-gray-500">No inquiries found.</p>
        ) : (
          inquiries.map((inquiry) => (
            <div key={inquiry._id} className="rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{inquiry.buyer?.name || 'Buyer'}</p>
                  <p className="text-sm text-gray-500">{inquiry.property?.title || 'Property'}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${inquiry.isRead ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {inquiry.isRead ? 'Read' : 'Unread'}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">{inquiry.message}</p>
            </div>
          ))
        )}
      </div>
      <PaginationControls pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default AdminInquiries;
