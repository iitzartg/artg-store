import { useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminKeys = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    keys: '',
    region: 'Global',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const keysArray = formData.keys
        .split('\n')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      if (keysArray.length === 0) {
        toast.error('Please enter at least one key');
        return;
      }

      await api.post('/admin/keys', {
        productId: formData.productId,
        keys: keysArray,
        region: formData.region,
      });

      toast.success(`${keysArray.length} keys added successfully`);
      setShowForm(false);
      setFormData({ productId: '', keys: '', region: 'Global' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add keys');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Digital Keys</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Keys
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Add Digital Keys</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product ID</label>
              <input
                type="text"
                required
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="input-field"
                placeholder="Enter product MongoDB ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Region</label>
              <input
                type="text"
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="input-field"
                placeholder="Global, US, EU, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Keys (one per line)
              </label>
              <textarea
                required
                value={formData.keys}
                onChange={(e) => setFormData({ ...formData, keys: e.target.value })}
                className="input-field font-mono"
                rows={10}
                placeholder="KEY1-XXXX-XXXX-XXXX&#10;KEY2-XXXX-XXXX-XXXX&#10;KEY3-XXXX-XXXX-XXXX"
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn-primary">
                Add Keys
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ productId: '', keys: '', region: 'Global' });
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
        <p className="text-gray-400">
          Use the form above to add digital keys in bulk. Keys will be encrypted and stored
          securely.
        </p>
      </div>
    </div>
  );
};

export default AdminKeys;



