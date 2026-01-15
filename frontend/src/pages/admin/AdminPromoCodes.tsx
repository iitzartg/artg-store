import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../../utils/api';
import { PromoCode } from '../../types';
import toast from 'react-hot-toast';

const AdminPromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    validUntil: '',
    usageLimit: '',
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const response = await api.get('/admin/promo-codes');
      setPromoCodes(response.data.data.promoCodes);
    } catch (error) {
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minPurchase: parseFloat(formData.minPurchase) || 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        validUntil: new Date(formData.validUntil).toISOString(),
      };

      await api.post('/admin/promo-codes', payload);
      toast.success('Promo code created');
      setShowForm(false);
      resetForm();
      fetchPromoCodes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create promo code');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchase: '',
      maxDiscount: '',
      validUntil: '',
      usageLimit: '',
    });
  };

  if (loading) {
    return <div className="card text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Promo Codes</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Create Promo Code
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">New Promo Code</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="input-field"
                  placeholder="WELCOME10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="input-field"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Discount Value</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Min Purchase</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  className="input-field"
                />
              </div>
              {formData.discountType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Max Discount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="input-field"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Valid Until</label>
                <input
                  type="date"
                  required
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Usage Limit (optional)</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="input-field"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={2}
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn-primary">
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4">Code</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Value</th>
                <th className="text-left p-4">Used</th>
                <th className="text-left p-4">Valid Until</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map((promo) => (
                <tr key={promo._id} className="border-b border-gray-700">
                  <td className="p-4 font-mono font-bold">{promo.code}</td>
                  <td className="p-4">{promo.discountType}</td>
                  <td className="p-4">
                    {promo.discountType === 'percentage'
                      ? `${promo.discountValue}%`
                      : `${promo.discountValue} TND`}
                  </td>
                  <td className="p-4">
                    {promo.usedCount} / {promo.usageLimit || '∞'}
                  </td>
                  <td className="p-4">
                    {new Date(promo.validUntil).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        promo.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPromoCodes;



