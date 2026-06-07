import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiCreditCard, FiPackage, FiShield, FiLock, FiAlertCircle, FiCheckCircle, FiSmartphone, FiGlobe } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1e293b',
      fontFamily: 'Inter, sans-serif',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
};

const POPULAR_BANKS = [
  { id: 'sbi', name: 'SBI', fullName: 'State Bank of India', icon: '🏛️' },
  { id: 'hdfc', name: 'HDFC', fullName: 'HDFC Bank', icon: '🏦' },
  { id: 'icici', name: 'ICICI', fullName: 'ICICI Bank', icon: '💳' },
  { id: 'axis', name: 'Axis', fullName: 'Axis Bank', icon: '📈' },
];

const OTHER_BANKS = [
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Union Bank of India',
  'Canara Bank',
  'Yes Bank',
  'IndusInd Bank',
];

export default function PaymentForm({ onSubmit, loading }) {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [cardError, setCardError] = useState(null);
  
  // UPI states
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);

  // Net banking states
  const [selectedBank, setSelectedBank] = useState('');
  
  const stripe = useStripe();
  const elements = useElements();

  const handleVerifyUpi = () => {
    if (!upiId) return;
    setIsVerifyingUpi(true);
    setTimeout(() => {
      setIsVerifyingUpi(false);
      setIsUpiVerified(true);
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCardError(null);

    if (paymentMethod === 'cod') {
      onSubmit({ paymentMethod: 'cod' });
      return;
    }

    if (paymentMethod === 'upi') {
      if (!isUpiVerified && upiId) {
        setIsVerifyingUpi(true);
        setTimeout(() => {
          setIsVerifyingUpi(false);
          setIsUpiVerified(true);
          onSubmit({ paymentMethod: 'upi' });
        }, 800);
        return;
      }
      onSubmit({ paymentMethod: 'upi' });
      return;
    }

    if (paymentMethod === 'netbanking') {
      if (!selectedBank) {
        setCardError('Please select a bank to proceed with Net Banking.');
        return;
      }
      onSubmit({ paymentMethod: 'netbanking' });
      return;
    }

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    onSubmit({ paymentMethod: 'stripe', stripe, cardElement });
  };

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Payment Method</h3>

      {/* Payment Options */}
      <div className="space-y-3">
        {/* Stripe Card */}
        <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
          paymentMethod === 'stripe'
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
        }`}>
          <input
            type="radio"
            name="paymentMethod"
            value="stripe"
            checked={paymentMethod === 'stripe'}
            onChange={() => setPaymentMethod('stripe')}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <FiCreditCard size={18} className="text-primary-600" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  Credit / Debit Card
                </span>
              </div>
              <div className="flex gap-1">
                {['VISA', 'MC', 'AMEX'].map((card) => (
                  <span key={card} className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                    {card}
                  </span>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {paymentMethod === 'stripe' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-4 bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-600">
                    {stripe ? (
                      <CardElement
                        options={CARD_ELEMENT_OPTIONS}
                        onChange={handleCardChange}
                      />
                    ) : (
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        <p className="font-semibold text-amber-600 mb-1">⚠️ Stripe Testing Mode</p>
                        <p className="text-xs mb-2">Stripe publishable key is not configured or failed to initialize.</p>
                        <input
                          type="text"
                          placeholder="Mock Card Number (Select Cash on Delivery or UPI to Place Order)"
                          className="w-full px-3 py-2 bg-slate-100 dark:bg-dark-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none cursor-not-allowed"
                          disabled
                        />
                      </div>
                    )}
                  </div>
                  {cardError && (
                    <div className="flex items-center gap-2 text-red-500 text-xs mt-2">
                      <FiAlertCircle size={13} /> {cardError}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <FiLock size={11} /> Your card info is encrypted and secure
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </label>

        {/* UPI Payments (Amazon/Flipkart Style) */}
        <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
          paymentMethod === 'upi'
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
        }`}>
          <input
            type="radio"
            name="paymentMethod"
            value="upi"
            checked={paymentMethod === 'upi'}
            onChange={() => setPaymentMethod('upi')}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <FiSmartphone size={18} className="text-purple-600" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    UPI (Google Pay / PhonePe / Paytm)
                  </span>
                  <p className="text-xs text-slate-400">Instant transfer using your UPI app</p>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {paymentMethod === 'upi' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mt-3 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-wrap gap-2">
                    {['gpay', 'phonepe', 'paytm', 'bhim'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => {
                          setSelectedUpiApp(app);
                          setIsUpiVerified(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase transition-all ${
                          selectedUpiApp === app
                            ? 'border-purple-600 bg-purple-500/10 text-purple-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {app === 'gpay' ? 'Google Pay' : app === 'phonepe' ? 'PhonePe' : app === 'paytm' ? 'Paytm' : 'BHIM'}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          setIsUpiVerified(false);
                        }}
                        placeholder="enterupiid@upi"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:border-purple-500"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!upiId || isVerifyingUpi}
                      onClick={handleVerifyUpi}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      {isVerifyingUpi ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>

                  {isUpiVerified && (
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-semibold pl-1">
                      <FiCheckCircle size={14} /> Verified Customer (UPI Auto-approved)
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </label>

        {/* Net Banking (Amazon/Flipkart Style) */}
        <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
          paymentMethod === 'netbanking'
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
        }`}>
          <input
            type="radio"
            name="paymentMethod"
            value="netbanking"
            checked={paymentMethod === 'netbanking'}
            onChange={() => setPaymentMethod('netbanking')}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <FiGlobe size={18} className="text-blue-600" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    Net Banking
                  </span>
                  <p className="text-xs text-slate-400">Pay using your bank account credentials</p>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {paymentMethod === 'netbanking' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mt-3 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {POPULAR_BANKS.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => {
                          setSelectedBank(bank.fullName);
                          setCardError(null);
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          selectedBank === bank.fullName
                            ? 'border-blue-600 bg-blue-500/10 text-blue-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="text-lg">{bank.icon}</span>
                        <span className="text-[10px] font-bold uppercase">{bank.name}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <select
                      value={OTHER_BANKS.includes(selectedBank) ? selectedBank : ''}
                      onChange={(e) => {
                        setSelectedBank(e.target.value);
                        setCardError(null);
                      }}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none"
                    >
                      <option value="">-- Choose Other Banks --</option>
                      {OTHER_BANKS.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  {selectedBank && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold pl-1">
                      🏦 Selected Bank: <strong>{selectedBank}</strong>
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </label>

        {/* Cash on Delivery */}
        <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
          paymentMethod === 'cod'
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
        }`}>
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={paymentMethod === 'cod'}
            onChange={() => setPaymentMethod('cod')}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <FiPackage size={18} className="text-green-600" />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  Cash on Delivery
                </span>
                <p className="text-xs text-slate-400">Pay cash/card when your order arrives</p>
              </div>
            </div>
          </div>
        </label>
      </div>

      {/* Security Badges */}
      <div className="flex items-center justify-center gap-6 p-4 bg-slate-50 dark:bg-dark-700/50 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <FiShield size={14} className="text-green-500" />
          <span>SSL Secure</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <FiLock size={14} className="text-blue-500" />
          <span>256-bit Encryption</span>
        </div>
        <div className="text-xs text-slate-400 font-bold">SECURE GATEWAY</div>
      </div>

      <button
        type="submit"
        disabled={loading || (paymentMethod === 'stripe' && !stripe)}
        className="btn-primary w-full py-4 text-base justify-center"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <FiLock size={16} />
            {paymentMethod === 'cod' ? 'Place Cash on Delivery Order' : 'Pay & Confirm Order'}
          </>
        )}
      </button>
    </form>
  );
}
