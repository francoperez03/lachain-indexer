import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

// Puedes agregar interceptores aquí si es necesario

export default apiClient;
