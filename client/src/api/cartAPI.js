import api from './axios';

export const getCartAPI = async () => {
  const { data } = await api.get('/cart');
  return data;
};

export const addToCartAPI = async ({ productId, quantity }) => {
  const { data } = await api.post('/cart', { productId, quantity });
  return data;
};

export const updateCartItemAPI = async ({ productId, quantity }) => {
  const { data } = await api.put(`/cart/${productId}`, { quantity });
  return data;
};

export const removeFromCartAPI = async (productId) => {
  const { data } = await api.delete(`/cart/${productId}`);
  return data;
};

export const clearCartAPI = async () => {
  const { data } = await api.delete('/cart');
  return data;
};

export const syncCartAPI = async (items) => {
  const { data } = await api.post('/cart/sync', { items });
  return data;
};
