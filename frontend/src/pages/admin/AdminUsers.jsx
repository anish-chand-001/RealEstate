import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../services/api';
import PaginationControls from '../../components/molecules/PaginationControls';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminService.getUsers({ page, limit: 25 })
      .then((response) => {
        if (!active) return;
        setUsers(response.data || []);
        setPagination(response.pagination || null);
      })
      .catch((error) => { if (active) toast.error(getErrorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  const toggleBlock = async (userId) => {
    try {
      await adminService.toggleBlockUser(userId);
      setUsers((prev) => prev.map((user) => user._id === userId ? { ...user, isBlocked: !user.isBlocked } : user));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading users...</div>;
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h1 className="mb-5 text-2xl font-bold text-gray-900">Users</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 text-sm text-gray-500">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Role</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium text-gray-900">{user.name}</td>
                <td className="py-3 pr-4 text-gray-600">{user.email}</td>
                <td className="py-3 pr-4 capitalize text-gray-700">{user.role}</td>
                <td className="py-3 pr-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <button onClick={() => toggleBlock(user._id)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                    {user.isBlocked ? 'Unblock' : 'Block'}
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

export default AdminUsers;
