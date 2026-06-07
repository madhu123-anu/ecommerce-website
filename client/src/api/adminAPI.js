import api from './axios';

export const getDashboardStatsAPI = async () => {
  const { data } = await api.get('/admin/dashboard');
  return data;
};

export const getSalesDataAPI = async (period = '12months') => {
  const { data } = await api.get('/admin/analytics/sales', { params: { period } });
  return data;
};

// Users
export const getAllUsersAPI = async (params = {}) => {
  const { data } = await api.get('/admin/users', { params });
  return data;
};

export const getUserByIdAPI = async (userId) => {
  const { data } = await api.get(`/admin/users/${userId}`);
  return data;
};

export const updateUserRoleAPI = async ({ userId, role }) => {
  const { data } = await api.put(`/admin/users/${userId}/role`, { role });
  return data;
};

export const deactivateUserAPI = async (userId) => {
  const { data } = await api.put(`/admin/users/${userId}/deactivate`);
  return data;
};

export const deleteUserAPI = async (userId) => {
  const { data } = await api.delete(`/admin/users/${userId}`);
  return data;
};

// Categories
export const getAllCategoriesAPI = async () => {
  const { data } = await api.get('/categories');
  return data;
};

export const createCategoryAPI = async (categoryData) => {
  const { data } = await api.post('/categories', categoryData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateCategoryAPI = async ({ id, ...categoryData }) => {
  const { data } = await api.put(`/categories/${id}`, categoryData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteCategoryAPI = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};

// Low stock
export const getLowStockProductsAPI = async (threshold = 10) => {
  const { data } = await api.get('/admin/products/low-stock', { params: { threshold } });
  return data;
};
