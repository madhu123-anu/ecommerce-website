const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    automatic_payment_methods: { enabled: true },
    metadata,
  });
};

const retrievePaymentIntent = async (paymentIntentId) => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

const createRefund = async (paymentIntentId, amount = null) => {
  const params = { payment_intent: paymentIntentId };
  if (amount) params.amount = Math.round(amount * 100);
  return await stripe.refunds.create(params);
};

const constructWebhookEvent = (payload, signature) => {
  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
};

module.exports = {
  stripe,
  createPaymentIntent,
  retrievePaymentIntent,
  createRefund,
  constructWebhookEvent,
};
