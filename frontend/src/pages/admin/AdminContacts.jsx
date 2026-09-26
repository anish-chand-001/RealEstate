import { useEffect, useState } from 'react';
import { contactService } from '../../services/contact.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../services/api';
import PaginationControls from '../../components/molecules/PaginationControls';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    contactService.getAll({ page, limit: 20 })
      .then((response) => {
        if (!active) return;
        setContacts(response.data || response.contacts || []);
        setPagination(response.pagination || null);
      })
      .catch((error) => {
        if (active) toast.error(getErrorMessage(error));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading contact submissions...</div>;
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h1 className="mb-5 text-2xl font-bold text-gray-900">Lead submissions</h1>
      <div className="space-y-4">
        {contacts.length === 0 ? (
          <p className="text-gray-500">No contact submissions yet.</p>
        ) : (
          contacts.map((contact) => (
            <div key={contact._id} className="rounded-2xl border border-gray-200 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-500">{contact.email} • {contact.phone}</p>
                </div>
                <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 uppercase">
                  {contact.role || 'buyer'}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">{contact.message}</p>
            </div>
          ))
        )}
      </div>
      <PaginationControls pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default AdminContacts;
