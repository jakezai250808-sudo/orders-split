import axios from 'axios';
import { ElMessage } from 'element-plus';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    ElMessage.error(err?.response?.data?.message || '请求失败');
    return Promise.reject(err);
  }
);

export default client;
