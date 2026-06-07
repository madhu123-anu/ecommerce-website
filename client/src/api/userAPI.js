import api from './axios';

export const getUserProfileAPI = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};

export const updateUserProfileAPI = async (userData) => {
  const { data } = await api.put('/users/profile', userData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const changePasswordAPI = async ({ currentPassword, newPassword }) => {
  const { data } = await api.put('/users/change-password', {
    currentPassword,
    newPassword,
  });
  return data;
};

export const getUserAddressesAPI = async () => {
  const { data } = await api.get('/users/addresses');
  return data;
};

export const addAddressAPI = async (addressData) => {
  const { data } = await api.post('/users/addresses', addressData);
  return data;
};

export const updateAddressAPI = async ({ addressId, ...addressData }) => {
  const { data } = await api.put(`/users/addresses/${addressId}`, addressData);
  return data;
};

export const deleteAddressAPI = async (addressId) => {
  const { data } = await api.delete(`/users/addresses/${addressId}`);
  return data;
};

export const setDefaultAddressAPI = async (addressId) => {
  const { data } = await api.put(`/users/addresses/${addressId}/default`);
  return data;
};

// Aliases for Profile.jsx compatibility
export const getProfileAPI = getUserProfileAPI;
export const updateProfileAPI = updateUserProfileAPI;
