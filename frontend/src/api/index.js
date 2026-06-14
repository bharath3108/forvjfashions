import client from './client.js';

export const getStoreInfo = () => client.get('/store');
export const getProducts = (params) => client.get('/products', { params });
export const getProduct = (id) => client.get(`/products/${id}`);
export const searchProducts = (q, params = {}) =>
  client.get('/products/search', { params: { q, ...params } });

export const userRegister = (data) => client.post('/auth/user/register', data);
export const userLogin = (data) => client.post('/auth/user/login', data);
export const verifyEmail = (token) => client.get('/auth/user/verify', { params: { token } });
export const resendVerification = (email) =>
  client.post('/auth/user/resend-verification', { email });
export const getUserProfile = () => client.get('/auth/user/me');

export const getComments = (productId) => client.get(`/comments/product/${productId}`);
export const getAllComments = () => client.get('/comments', { adminRequest: true });
export const addComment = (productId, text) =>
  client.post(`/comments/product/${productId}`, { text });
export const deleteComment = (id) =>
  client.delete(`/comments/${id}`, { adminRequest: true });

export const adminLogin = (data) => client.post('/auth/admin/login', data);
export const createAdmin = (data) =>
  client.post('/auth/admin/register', data, { adminRequest: true });
export const createProduct = (data) =>
  client.post('/products', data, { adminRequest: true });
export const updateProduct = (id, data) =>
  client.put(`/products/${id}`, data, { adminRequest: true });
export const deleteProduct = (id) =>
  client.delete(`/products/${id}`, { adminRequest: true });
export const uploadImage = (file) => {
  const form = new FormData();
  form.append('image', file);
  return client.post('/products/upload', form, {
    adminRequest: true,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
