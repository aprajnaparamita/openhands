import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_SERVER_URL || 'http://localhost:3000'}${process.env.REACT_APP_API_PREFIX || '/api/v1'}`;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid infinite loop if refresh endpoint itself fails
      if (originalRequest.url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        console.log('[API] Token expired. Attempting refresh...');
        await api.post('/auth/refresh');
        console.log('[API] Refresh successful. Retrying original request...');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('[API] Refresh token failed', refreshError);
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`[API Response Error] ${error.response.status} ${error.config.url}`, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('[API No Response]', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('[API Setup Error]', error.message);
    }
    return Promise.reject(error);
  }
);
