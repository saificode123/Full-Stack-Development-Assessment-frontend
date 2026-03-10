// src/api/axios.js
import axios from 'axios';

// This configuration is crucial for Django Session Authentication
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  withCredentials: true, // This tells the browser to send the secure session cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;