import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-24 h-24 mx-auto text-gray-700 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Add some products to get started!</p>
        <Link to="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>

      <div className="card">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 pb-4 border-b border-gray-700 last:border-0"
            >
              <img
                src={item.image || '/placeholder-game.jpg'}
                alt={item.title}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.platform}</p>
                <p className="text-neon-green font-bold">{item.price.toFixed(2)} TND</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="bg-gray-700 hover:bg-gray-600 p-1 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="bg-gray-700 hover:bg-gray-600 p-1 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="text-right">
                <p className="font-bold">{(item.price * item.quantity).toFixed(2)} TND</p>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-red-400 hover:text-red-300 mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal:</span>
            <span className="font-semibold">{getTotal().toFixed(2)} TND</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tax (10%):</span>
            <span className="font-semibold">{(getTotal() * 0.1).toFixed(2)} TND</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-700">
            <span>Total:</span>
            <span className="text-neon-green">{(getTotal() * 1.1).toFixed(2)} TND</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/products" className="btn-secondary flex-1 text-center">
          Continue Shopping
        </Link>
        {isAuthenticated ? (
          <Link to="/checkout" className="btn-primary flex-1 text-center">
            Proceed to Checkout
          </Link>
        ) : (
          <Link to="/login" className="btn-primary flex-1 text-center">
            Login to Checkout
          </Link>
        )}
      </div>
    </div>
  );
};

export default Cart;



