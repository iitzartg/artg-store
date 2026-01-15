import { useEffect, useState } from 'react';
import { Users, Package, ShoppingBag, DollarSign } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const AdminStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data.stats);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card text-center py-12">Loading...</div>;
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-600 to-blue-800' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'from-purple-600 to-purple-800' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'from-green-600 to-green-800' },
    { label: 'Total Revenue', value: `${stats.totalRevenue.toFixed(2)} TND`, icon: DollarSign, color: 'from-yellow-600 to-yellow-800' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Statistics</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminStats;



