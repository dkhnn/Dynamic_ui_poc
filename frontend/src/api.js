import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const getTasks = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);

  const response = await api.get(`/tasks?${params.toString()}`);
  return response.data;
};
