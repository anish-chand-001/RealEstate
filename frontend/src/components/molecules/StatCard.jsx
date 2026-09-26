
/**
 * StatCard molecule — displays a KPI metric on dashboards.
 * @param {React.ReactNode} icon
 * @param {string} label
 * @param {string|number} value
 * @param {string} color - Tailwind color class prefix (e.g., 'indigo', 'green')
 * @param {string} trend - Optional trend text (e.g., "+12%")
 */
const StatCard = ({ icon, label, value, color = 'indigo', trend, className = '' }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.indigo}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-semibold ${trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-extrabold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  );
};

export default StatCard;
