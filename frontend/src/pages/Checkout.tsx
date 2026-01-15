import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import api from '../utils/api';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    // Component is already wrapped in Elements, so we don't need to create payment intent here
    // The payment intent should be created when the component mounts
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // First create payment intent
      const cartItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const intentResponse = await api.post('/payments/create-intent', {
        items: cartItems,
        promoCode: promoCode || undefined,
      });

      const { clientSecret } = intentResponse.data.data;

      // Confirm payment with the client secret
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        clearCart();
        navigate('/dashboard');
      } else {
        setProcessing(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading checkout...</p>
      </div>
    );
  }

  const subtotal = getTotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
        <PaymentElement />
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-gray-400">
                {item.title} x{item.quantity}
              </span>
              <span>{(item.price * item.quantity).toFixed(2)} TND</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-700 pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal:</span>
            <span>{subtotal.toFixed(2)} TND</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tax:</span>
            <span>{tax.toFixed(2)} TND</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-700">
            <span>Total:</span>
            <span className="text-neon-green">{total.toFixed(2)} TND</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn-primary w-full"
      >
        {processing ? 'Processing...' : `Pay ${total.toFixed(2)} TND`}
      </button>
    </form>
  );
};

const Checkout = () => {
  const { items } = useCartStore();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    // Create payment intent when component mounts
    const createIntent = async () => {
      try {
        const cartItems = items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

        const response = await api.post('/payments/create-intent', {
          items: cartItems,
        });

        setClientSecret(response.data.data.clientSecret);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Error creating payment intent');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [items, navigate]);

  if (items.length === 0 || loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12">
          <p className="text-red-400">Failed to initialize payment</p>
        </div>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
    },
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default Checkout;

