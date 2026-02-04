import axios from 'axios';
import type { User, Product } from '@/store/useStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
export const userAPI = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data.data;
  },

  getById: async (id: number): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data.data;
  },

  create: async (user: Omit<User, 'id'>): Promise<User> => {
    const { data } = await api.post('/users', user);
    return data.data;
  },

  update: async (id: number, user: Partial<User>): Promise<User> => {
    const { data } = await api.put(`/users/${id}`, user);
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// Product API
export const productAPI = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get('/products');
    return data.data;
  },

  getById: async (id: number): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  },

  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const { data } = await api.post('/products', product);
    return data.data;
  },

  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    const { data } = await api.put(`/products/${id}`, product);
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
