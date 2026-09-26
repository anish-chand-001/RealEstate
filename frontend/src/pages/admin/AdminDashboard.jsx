import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../services/api';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({ kpis: {}, charts: {}, recentActivity: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    adminService.getAnalytics()
      .then((response) => {
        if (active) setAnalytics(response.data || response.analytics || { kpis: {}, charts: {}, recentActivity: [] });
      })
      .catch((error) => { if (active) toast.error(getErrorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading analytics...</div>;
  }

  const kpis = analytics.kpis || {};
  const activityData = analytics.recentActivity || {};
  const recentActivity = Array.isArray(activityData)
    ? activityData
    : [
        ...(activityData.latestInquiries || []).map((inquiry) => ({
          type: 'Inquiry',
          title: `Inquiry for ${inquiry.property?.title || 'a property'}`,
          subtitle: `From ${inquiry.buyer?.name || 'a buyer'}`,
          date: inquiry.createdAt,
        })),
        ...(activityData.latestProperties || []).map((property) => ({
          type: 'Property',
          title: property.title,
          subtitle: `${property.status} listing`,
          date: property.createdAt,
        })),
      ].sort((first, second) => new Date(second.date || 0) - new Date(first.date || 0));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Admin overview</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total users', value: kpis.totalUsers ?? 0 },
          { label: 'Properties', value: kpis.totalProperties ?? 0 },
          { label: 'Inquiries', value: kpis.totalInquiries ?? 0 },
          { label: 'Pending sellers', value: kpis.pendingSellers ?? 0 },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Recent activity</h2>
        <div className="mt-5 space-y-3">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500">No recent activity available.</p>
          ) : (
            recentActivity.slice(0, 6).map((item, index) => (
              <div key={`${item.type || 'activity'}-${index}`} className="flex items-center justify-between rounded-2xl border border-gray-200 p-3">
                <div>
                  <p className="font-medium text-gray-900">{item.title || item.message || 'Activity'}</p>
                  <p className="text-sm text-gray-500">{item.subtitle || (item.date ? new Date(item.date).toLocaleString() : 'Recently')}</p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {item.type || 'Info'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
