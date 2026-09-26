import { useEffect, useState } from 'react';
import { inquiryService } from '../../services/inquiry.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../services/api';
import PaginationControls from '../../components/molecules/PaginationControls';

const SellerInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    inquiryService.getSellerInquiries({ page, limit: 20 })
      .then((response) => {
        if (!active) return;
        setInquiries(response.inquiries || response.data || []);
        setPagination(response.pagination || null);
      })
      .catch((error) => { if (active) toast.error(getErrorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  const handleMarkRead = async (id) => {
    try {
      await inquiryService.markAsRead(id);
      setInquiries((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)),
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading inquiries...</div>;
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Seller inbox</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Property inquiries</h1>
        </div>
      </div>

      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
            No inquiries for your properties yet.
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <div key={inquiry._id} className="rounded-2xl border border-gray-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{inquiry.buyer?.name || 'Buyer'}</p>
                  <p className="text-sm text-gray-500">{inquiry.property?.title || 'Property inquiry'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${inquiry.isRead ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {inquiry.isRead ? 'Read' : 'Unread'}
                  </span>
                  {!inquiry.isRead && (
                    <button
                      onClick={() => handleMarkRead(inquiry._id)}
                      className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">{inquiry.message}</p>
            </div>
          ))
        )}
      </div>
      <PaginationControls pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default SellerInquiries;
