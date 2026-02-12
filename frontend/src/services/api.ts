import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // --- DÉBUT DU DÉBOGAGE ---
    console.log(`[API Interceptor] Requête sortante vers : ${config.url}`);
    
    if (token) {
      console.log('[API Interceptor] Token trouvé, ajout de l\'en-tête Authorization.');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('[API Interceptor] ATTENTION : Aucun token trouvé dans le localStorage.');
    }
    // --- FIN DU DÉBOGAGE ---

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
