import api from './axios';

export const getWishlistAPI = async () => {
  const { data } = await api.get('/wishlist');
  return data;
};

export const addToWishlistAPI = async (productId) => {
  const { data } = await api.post('/wishlist', { productId });
  return data;
};

export const removeFromWishlistAPI = async (productId) => {
  const { data } = await api.delete(`/wishlist/${productId}`);
  return data;
};

export const clearWishlistAPI = async () => {
  const { data } = await api.delete('/wishlist');
  return data;
};
