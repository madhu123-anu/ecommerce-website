import api from './axios';

export const getProductReviewsAPI = async (productId, params = {}) => {
  const { data } = await api.get(`/products/${productId}/reviews`, { params });
  return data;
};

export const createReviewAPI = async ({ productId, rating, comment, title }) => {
  const { data } = await api.post(`/products/${productId}/reviews`, {
    rating,
    comment,
    title,
  });
  return data;
};

export const updateReviewAPI = async ({ reviewId, rating, comment, title }) => {
  const { data } = await api.put(`/reviews/${reviewId}`, { rating, comment, title });
  return data;
};

export const deleteReviewAPI = async (reviewId) => {
  const { data } = await api.delete(`/reviews/${reviewId}`);
  return data;
};

// Admin
export const getAllReviewsAPI = async (params = {}) => {
  const { data } = await api.get('/reviews', { params });
  return data;
};

export const updateReviewStatusAPI = async ({ reviewId, status }) => {
  const { data } = await api.put(`/reviews/${reviewId}/status`, { status });
  return data;
};
