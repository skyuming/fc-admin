/* Axios network request wrapper */
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

/** Create axios instance */
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 120000
});

/** Request interceptor — attach Authorization header */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

/** Response interceptor — unwrap envelope + handle 401 */
service.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: any) => {
    if (error?.response?.status === 401) {
      // Token expired — clear local state and bounce to login
      localStorage.clear();
      sessionStorage.clear();
      const current = router.currentRoute.value.fullPath;
      if (current !== '/login') {
        router.push({ path: '/login' });
      }
    } else {
      ElMessage.error(error?.response?.data?.msg || error?.response?.data?.error_description || '系统出错');
    }
    return Promise.reject(error);
  }
);

export default service;
