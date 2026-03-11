import axios from 'axios';

// Use the production backend URL for production, localhost for development
const getBaseURL = () => {
  // Production - use the Render backend URL (without /api prefix)
  if (import.meta.env.PROD) {
    return 'https://full-stack-development-assessment.onrender.com';
  }
  // Local development
  return 'http://localhost:8000';
};

const baseURL = getBaseURL();

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to manually search the browser for the cookie
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie?.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie?.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Interceptor: Runs before EVERY request
api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  
  // If the token exists, force it into the headers
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;