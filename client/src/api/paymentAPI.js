import api from './axios';

export const createPaymentIntentAPI = async ({ amount, currency = 'usd', orderId }) => {
  const { data } = await api.post('/payments/create-intent', {
    amount,
    currency,
    orderId,
  });
  return data;
};

export const confirmPaymentAPI = async ({ orderId, paymentIntentId }) => {
  const { data } = await api.post('/payments/confirm', {
    orderId,
    paymentIntentId,
  });
  return data;
};

export const getPaymentStatusAPI = async (paymentIntentId) => {
  const { data } = await api.get(`/payments/status/${paymentIntentId}`);
  return data;
};

export const refundPaymentAPI = async ({ orderId, amount, reason }) => {
  const { data } = await api.post('/payments/refund', { orderId, amount, reason });
  return data;
};
