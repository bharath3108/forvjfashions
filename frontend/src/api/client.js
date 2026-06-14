import axios from 'axios';
import { API_URL } from '../config/constants.js';

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const userToken = localStorage.getItem('userToken');
  const adminToken = localStorage.getItem('adminToken');
  const token = config.adminRequest ? adminToken : userToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
