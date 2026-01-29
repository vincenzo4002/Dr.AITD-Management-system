import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { immediate = true, method = 'GET', dependencies = [] } = options;

  const execute = async (customUrl = url, customOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      // api instance handles base URL and headers
      const config = {
        method: customOptions.method || method,
        url: customUrl,
        ...customOptions,
        headers: {
          ...customOptions.headers
        }
      };

      const response = await api(config);
      setData(response.data);
      return response.data;
    } catch (err) {
      console.error("API Error:", err);
      const message = err.response?.data?.msg || err.response?.data?.message || err.message || "An unexpected error occurred";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate && url) {
      execute();
    }
  }, dependencies);

  return { data, loading, error, execute };
};

export const usePost = (url) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const post = async (data, customUrl = url) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(customUrl, data);
      return response.data;
    } catch (err) {
      console.error("API Error (Post):", err);
      const message = err.response?.data?.msg || err.response?.data?.message || err.message || "An unexpected error occurred";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { post, loading, error };
};