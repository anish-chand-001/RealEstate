import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { wishlistService } from '../../services/wishlist.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../services/api';
import PaginationControls from '../../components/molecules/PaginationControls';
import { optimizeImage } from '../../utils/optimizeImage';

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    wishlistService.getAll({ page, limit: 20 })
      .then((res) => {
        if (!active) return;
        setItems(res.wishlist || res.data || []);
        setPagination(res.pagination || null);
      })
      .catch((error) => { if (active) toast.error(getErrorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  const removeItem = async (propertyId) => {
    try {
      await wishlistService.remove(propertyId);
      setItems((prev) => prev.filter((item) => (item.property?._id || item.property) !== propertyId));
      setPagination((current) => current ? { ...current, total: Math.max(0, current.total - 1) } : current);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-8 text-center text-gray-600">Loading wishlist...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Saved homes</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Your wishlist</h1>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm border border-gray-200">
            {pagination?.total ?? items.length} item{(pagination?.total ?? items.length) === 1 ? '' : 's'}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <FiHeart className="mx-auto text-4xl text-gray-300" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Your wishlist is empty</h2>
            <p className="mt-2 text-gray-600">Start saving properties you like and compare them later.</p>
            <Link to="/properties" className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white">
              Explore properties
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const property = item.property || item;
              const id = property._id || property.id;
              return (
                <div key={id} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                  <img src={optimizeImage(property.images?.[0] || property.image, 800)} alt={property.title} loading="lazy" className="h-56 w-full object-cover" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500">{property.propertyType || property.type}</p>
                        <h2 className="mt-1 text-xl font-bold text-gray-900">{property.title}</h2>
                      </div>
                      <button onClick={() => removeItem(id)} className="rounded-full bg-red-50 p-2 text-red-600">
                        <FiHeart className="fill-current" />
                      </button>
                    </div>

                    <p className="mt-3 text-lg font-bold text-indigo-600">
                      ₹{Number(property.price || 0).toLocaleString('en-IN')}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <Link to={`/properties/${id}`} className="flex-1 rounded-xl bg-indigo-50 px-4 py-2.5 text-center font-semibold text-indigo-700">
                        View details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <PaginationControls pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default WishlistPage;
