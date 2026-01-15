import { useEffect, useState } from 'react';
import { Key, Package, Calendar } from 'lucide-react';
import api from '../utils/api';
import { Order, DigitalKey } from '../types';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [keys, setKeys] = useState<DigitalKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchKeys = async (orderId: string) => {
    if (selectedOrder === orderId && keys.length > 0) {
      setSelectedOrder(null);
      setKeys([]);
      return;
    }

    setKeysLoading(true);
    try {
      const response = await api.get(`/orders/${orderId}/keys`);
      setKeys(response.data.data.keys);
      setSelectedOrder(orderId);
      toast.success('Keys loaded. Please save them securely!', { duration: 5000 });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load keys');
    } finally {
      setKeysLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Dashboard</h1>

      {orders.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-24 h-24 mx-auto text-gray-700 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-gray-400">Start shopping to see your orders here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order._id.slice(-8)}</h3>
                  <p className="text-sm text-gray-400 flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-neon-green">
                    {order.total.toFixed(2)} TND
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      order.status === 'completed'
                        ? 'text-neon-green'
                        : order.status === 'pending'
                        ? 'text-yellow-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {order.status.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-2">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      {item.product.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.product.title}</p>
                        <p className="text-gray-400 text-xs">
                          {item.product.platform} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} TND</p>
                  </div>
                ))}
              </div>

              {order.status === 'completed' && order.paymentStatus === 'succeeded' && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => fetchKeys(order._id)}
                    disabled={keysLoading}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    <Key className="w-5 h-5 mr-2" />
                    {selectedOrder === order._id && keys.length > 0
                      ? 'Hide Keys'
                      : keysLoading
                      ? 'Loading...'
                      : 'View Digital Keys'}
                  </button>

                  {selectedOrder === order._id && keys.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                        <p className="text-yellow-400 text-sm font-semibold mb-2">
                          ⚠️ Important: Save these keys now!
                        </p>
                        <p className="text-yellow-300 text-xs">
                          These keys are shown only once for security. Please copy and save them
                          securely.
                        </p>
                      </div>
                      {keys.map((key, idx) => (
                        <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <p className="font-semibold mb-2">{key.productName}</p>
                          <div className="bg-gray-950 p-3 rounded border border-gray-800">
                            <code className="text-neon-green font-mono text-sm break-all">
                              {key.key}
                            </code>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Region: {key.region}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;



