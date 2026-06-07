import api from './axios';

export const createOrderAPI = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

export const getMyOrdersAPI = async (params = {}) => {
  const { data } = await api.get('/orders/my-orders', { params });
  return data;
};

export const getOrderByIdAPI = async (orderId) => {
  const { data } = await api.get(`/orders/${orderId}`);
  return data;
};

export const cancelOrderAPI = async (orderId) => {
  const { data } = await api.put(`/orders/${orderId}/cancel`);
  return data;
};

// Admin
export const getAllOrdersAPI = async (params = {}) => {
  const { data } = await api.get('/orders', { params });
  return data;
};

export const updateOrderStatusAPI = async ({ orderId, status }) => {
  const { data } = await api.put(`/orders/${orderId}/status`, { status });
  return data;
};

export const deleteOrderAPI = async (orderId) => {
  const { data } = await api.delete(`/orders/${orderId}`);
  return data;
};
