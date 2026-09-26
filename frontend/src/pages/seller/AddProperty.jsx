import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/property.service';

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);

    try {
      await propertyService.create(formData);
      navigate('/seller/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to add property.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Seller tools</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Add property</h1>
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Title</label>
            <input name="title" required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Property type</label>
            <select name="propertyType" required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white">
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
              <option value="Commercial">Commercial</option>
              <option value="Land">Land</option>
              <option value="Office">Office</option>
              <option value="Shop">Shop</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Price</label>
            <input type="number" name="price" required min="0" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Area (sq ft)</label>
            <input type="number" name="features[area]" required min="0" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">City</label>
            <input name="address[city]" required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">State</label>
            <input name="address[state]" required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Area / locality</label>
            <input name="address[area]" required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Pin code</label>
            <input name="address[pinCode]" required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">BHK</label>
            <input type="number" name="features[bhk]" required min="1" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Bathrooms</label>
            <input type="number" name="features[bathrooms]" required min="1" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white" />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" required rows="5" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Amenities</label>
          <input name="amenities" placeholder="Gym, Parking, Pool" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Furnishing</label>
          <select name="features[furnished]" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white">
            <option value="Unfurnished">Unfurnished</option>
            <option value="Semi-Furnished">Semi-Furnished</option>
            <option value="Furnished">Furnished</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Property images</label>
          <input type="file" name="images" accept="image/*" multiple required className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3" />
        </div>

        <button type="submit" disabled={loading} className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60">
          {loading ? 'Saving...' : 'Add property'}
        </button>
      </form>
    </div>
  );
};

export default AddProperty;
