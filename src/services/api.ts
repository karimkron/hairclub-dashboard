import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // Añadir información de depuración en desarrollo
  if (process.env.NODE_ENV !== 'production') {

    if (config.params) {

    }
  }
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => {
    // Añadir información de depuración en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      
      // Log limitado para evitar datos sensibles
      if (Array.isArray(response.data)) {
      } else if (typeof response.data === 'object') {
      }
    }
    
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Error 401: Sesión expirada o token inválido');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response) {
      console.error(`Error ${error.response.status}: ${error.response.data?.message || 'Error desconocido'}`);
    } else if (error.request) {
      console.error('Error de red: No se recibió respuesta');
    } else {
      console.error('Error al configurar la petición:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;