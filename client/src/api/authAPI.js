import api from './axios';

export const loginAPI = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const registerAPI = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const logoutAPI = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

export const refreshTokenAPI = async (refreshToken) => {
  const { data } = await api.post('/auth/refresh-token', { refreshToken });
  return data;
};

export const forgotPasswordAPI = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPasswordAPI = async ({ token, password }) => {
  const { data } = await api.post(`/auth/reset-password/${token}`, { password });
  return data;
};

export const verifyEmailAPI = async (token) => {
  const { data } = await api.get(`/auth/verify-email/${token}`);
  return data;
};

export const getMeAPI = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};
