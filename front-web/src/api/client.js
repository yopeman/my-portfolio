import axios from 'axios';
import { BASE_URL } from '../data/constants.js';
import { clearStoredAuth, getStoredToken } from '../contexts/authStorage.js';

export const client = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      clearStoredAuth();
      window.dispatchEvent(new CustomEvent('portfolio:unauthorized'));
    }
    return Promise.reject(error);
  }
);

const get = (url, config) => client.get(url, config).then((r) => r.data);
const post = (url, data, config) => client.post(url, data, config).then((r) => r.data);
const put = (url, data, config) => client.put(url, data, config).then((r) => r.data);
const patch = (url, data, config) => client.patch(url, data, config).then((r) => r.data);
const del = (url, config) => client.delete(url, config).then((r) => r.data);

export const http = { get, post, put, patch, delete: del };