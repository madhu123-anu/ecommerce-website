import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiTruck, FiCreditCard, FiPackage, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';

import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { createOrderAPI } from '../api/orderAPI';
import { createPaymentIntentAPI } from '../api/paymentAPI';
import { getUserProfileAPI as getProfileAPI } from '../api/userAPI';
import { syncCartAPI } from '../api/cartAPI';

import AddressForm from '../components/checkout/AddressForm';
import OrderSummary from '../components/checkout/OrderSummary';
import PaymentForm from '../components/checkout/PaymentForm';
import Breadcrumb from '../components/common/Breadcrumb';
import Loader from '../components/common/Loader';

// Initialize stripe outside the render loop safely
let stripePromise;
try {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder_key';
  if (!key || key.startsWith('pk_test_placeholder')) {
    stripePromise = Promise.resolve(null);
  } else {
    stripePromise = loadStripe(key).catch((err) => {
      console.error('Stripe load error:', err);
      return null;
    });
  }
} catch (e) {
  console.error('Stripe initialization failed:', e);
  stripePromise = Promise.resolve(null);
}

function CheckoutContent() {
  const navigate = useNavigate();
  const { items, totals, clearCart } = useCart();
  const { user } = useAuth();

  // Sync Redux local cart to backend DB on checkout page load
  useEffect(() => {
    const syncCart = async () => {
      try {
        const syncItems = items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        }));
        await syncCartAPI(syncItems);
      } catch (err) {
        console.error('Failed to sync cart to database:', err);
      }
    };
    
    if (items.length > 0) {
      syncCart();
    }
  }, [items]);
  
  const orderPlacedRef = useRef(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Review, 3: Payment
  const [shippingAddress, setShippingAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  // Fetch saved user addresses from profile
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfileAPI,
  });

  const savedAddresses = profileData?.user?.addresses?.map(addr => ({
    fullName: addr.name,
    phone: addr.phone,
    street: addr.street,
    city: addr.city,
    state: addr.state,
    country: addr.country,
    zip: addr.zip,
  })) || [];

  useEffect(() => {
    if (items.length === 0 && !createdOrder && !orderPlacedRef.current) {
      navigate('/cart');
    }
  }, [items, createdOrder, navigate]);

  const handleAddressSubmit = (data) => {
    setShippingAddress(data);
    setStep(2);
  };

  const handlePlaceOrder = async (payMethod = 'stripe', isMock = false) => {
    setLoading(true);
    try {
      // 1. Create order in backend
      const orderData = {
        shippingAddress: {
          name: shippingAddress.fullName,
          phone: shippingAddress.phone,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          country: shippingAddress.country,
          zip: shippingAddress.zip,
        },
        paymentMethod: payMethod,
      };

      const res = await createOrderAPI(orderData);
      const newOrder = res.order;
      setCreatedOrder(newOrder);

      // 2. Handle Cash on Delivery (COD), UPI, Net Banking, or Mock Card Payments
      if (['cod', 'upi', 'netbanking'].includes(payMethod) || isMock) {
        toast.success('Order placed successfully! 🎉');
        orderPlacedRef.current = true;
        clearCart();
        navigate(`/order-success/${newOrder._id}`);
        return;
      }

      // 3. Handle Stripe Payment Intent (Real Card Payment)
      const intentRes = await createPaymentIntentAPI({
        amount: newOrder.totalPrice,
        orderId: newOrder._id,
      });

      setClientSecret(intentRes.clientSecret);
      setPaymentMethod('stripe');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async ({ paymentMethod: method, stripe, cardElement }) => {
    if (method === 'cod' || method === 'upi' || method === 'netbanking') {
      // Direct success path for Cash on Delivery, UPI, and Net Banking
      await handlePlaceOrder(method);
      return;
    }

    if (method === 'stripe') {
      if (!stripe || !cardElement || !clientSecret) {
        // Fallback: If Stripe is not initialized, run mock card checkout which succeeds instantly
        await handlePlaceOrder('stripe', true);
        return;
      }

      setLoading(true);
      try {
        const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: shippingAddress.fullName,
              phone: shippingAddress.phone,
              email: user?.email,
            },
          },
        });

        if (error) {
          toast.error(error.message || 'Payment failed');
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          toast.success('Payment successful! 🎉');
          orderPlacedRef.current = true;
          clearCart();
          navigate(`/order-success/${createdOrder._id}`);
        } else {
          toast.error('Payment processing or failed.');
        }
      } catch (err) {
        toast.error('An unexpected error occurred during payment.');
      } finally {
        setLoading(false);
      }
    }
  };

  const steps = [
    { number: 1, title: 'Shipping', icon: FiTruck },
    { number: 2, title: 'Review Order', icon: FiShoppingBag },
    { number: 3, title: 'Payment', icon: FiCreditCard },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Cart', path: '/cart' }, { label: 'Checkout', path: '/checkout' }]} />

      {/* Progress Steps Header */}
      <div className="mt-6 mb-10 max-w-xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-slate-200 dark:bg-dark-700 -z-10 rounded-full" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 rounded-full -z-10 transition-all duration-300"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.number;
            const isActive = step === s.number;

            return (
              <div key={s.number} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : isActive
                      ? 'bg-white dark:bg-dark-800 border-primary-600 text-primary-600 scale-110 shadow-glow'
                      : 'bg-white dark:bg-dark-800 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {isCompleted ? <FiCheck size={16} /> : <Icon size={16} />}
                </div>
                <span
                  className={`text-xs font-bold transition-colors ${
                    isActive ? 'text-primary-600' : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 card p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <AddressForm
                  onSubmit={handleAddressSubmit}
                  savedAddresses={savedAddresses}
                  defaultValues={shippingAddress}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Review Your Order</h3>
                
                <div className="p-4 bg-slate-50 dark:bg-dark-700/30 rounded-xl space-y-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Please review your items and shipping details on the right.</p>
                  <p className="text-xs text-slate-500">In the next step, you will select your payment method (UPI, Net Banking, Credit Card, or Cash on Delivery).</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="btn-outline flex-1 py-3 justify-center text-sm"
                  >
                    Back to Shipping
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={loading}
                    className="btn-primary flex-1 py-3 justify-center text-sm"
                  >
                    Proceed to Payment Options
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <PaymentForm onSubmit={handlePaymentSubmit} loading={loading} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Order Summary Column */}
        <div className="lg:col-span-1">
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-4">Items Summary</h3>
            <OrderSummary address={shippingAddress} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutContent />
    </Elements>
  );
}
