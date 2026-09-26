import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/user.service';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    userService.getProfile()
      .then((response) => {
        if (active) setProfile(response.user || response.data || user);
      })
      .catch(() => {
        if (active) {
          setProfile(user || {});
          setMessage('Unable to load your latest profile details.');
        }
      });
    return () => { active = false; };
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData(event.currentTarget);
      const response = await userService.updateProfile(formData);
      const nextProfile = response.user || response.data || profile;
      setProfile(nextProfile);
      await refreshUser();
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to update your profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <div className="p-8 text-center text-gray-600">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Account</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Profile</h1>
          </div>
          <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
            {profile.role || user?.role}
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Full name</label>
              <input
                name="name"
                defaultValue={profile.name || ''}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Phone</label>
              <input
                name="phone"
                defaultValue={profile.phone || ''}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <input
              value={profile.email || ''}
              disabled
              className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              defaultValue={profile.address || ''}
              rows="4"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Profile image</label>
            <input type="file" name="profileImage" accept="image/*" className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
