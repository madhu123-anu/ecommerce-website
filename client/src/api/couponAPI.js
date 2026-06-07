import api from './axios';

export const validateCouponAPI = async ({ code, cartTotal }) => {
  const { data } = await api.post('/coupons/validate', { code, cartTotal });
  return data;
};

// Admin
export const getAllCouponsAPI = async (params = {}) => {
  const { data } = await api.get('/coupons', { params });
  return data;
};

export const createCouponAPI = async (couponData) => {
  const { data } = await api.post('/coupons', couponData);
  return data;
};

export const updateCouponAPI = async ({ id, ...couponData }) => {
  const { data } = await api.put(`/coupons/${id}`, couponData);
  return data;
};

export const deleteCouponAPI = async (id) => {
  const { data } = await api.delete(`/coupons/${id}`);
  return data;
};

export const toggleCouponStatusAPI = async (id) => {
  const { data } = await api.put(`/coupons/${id}/toggle`);
  return data;
};
