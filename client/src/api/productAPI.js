import api from './axios';

export const getProductsAPI = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const getProductByIdAPI = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const getProductBySlugAPI = async (slug) => {
  const { data } = await api.get(`/products/slug/${slug}`);
  return data;
};

export const getFeaturedProductsAPI = async (limit = 8) => {
  const { data } = await api.get('/products', { params: { featured: true, limit } });
  return data;
};

export const getBestSellersAPI = async (limit = 8) => {
  const { data } = await api.get('/products', { params: { sort: '-numReviews', limit } });
  return data;
};

export const getNewArrivalsAPI = async (limit = 8) => {
  const { data } = await api.get('/products', { params: { sort: '-createdAt', limit } });
  return data;
};

export const getSaleProductsAPI = async (limit = 8) => {
  const { data } = await api.get('/products', { params: { onSale: true, limit } });
  return data;
};

export const getRelatedProductsAPI = async (productId, limit = 4) => {
  const { data } = await api.get(`/products/${productId}/related`, { params: { limit } });
  return data;
};

export const searchProductsAPI = async (query, limit = 5) => {
  const { data } = await api.get('/products/search', { params: { q: query, limit } });
  return data;
};

export const getProductsByCategory = async (category, params = {}) => {
  const { data } = await api.get('/products', { params: { category, ...params } });
  return data;
};

export const getCategoriesAPI = async () => {
  const { data } = await api.get('/categories');
  return data;
};

export const getBrandsAPI = async () => {
  const { data } = await api.get('/products/brands');
  return data;
};

// Admin product API
export const createProductAPI = async (productData) => {
  const { data } = await api.post('/products', productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateProductAPI = async (id, productData) => {
  const { data } = await api.put(`/products/${id}`, productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteProductAPI = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};
