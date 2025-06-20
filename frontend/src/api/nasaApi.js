import axios from 'axios';


const BASE_URL = import.meta.env.VITE_BACKEND_URL;
console.log("Backend URL loaded:", BASE_URL);
const api = axios.create({ baseURL: `${BASE_URL}/api` });

export const fetchDashboardSummary = () => api.get('/dashboard/summary');
export const fetchNEOFeed = () => api.get('/neo/feed');
export const fetchNEOStats = () => api.get('/neo/stats');
export const fetchMarsRovers = () => api.get('/mars/rovers');
export const fetchRoverPhotos = (rover, params) => api.get(`/mars/rovers/${rover}/photos`, { params });
export const fetchLatestRoverPhotos = (rover) => api.get(`/mars/rovers/${rover}/latest_photos`);
export const fetchAPOD = (params) => {
  if (params?.random) return api.get('/apod/random?count=1');
  return api.get('/apod', { params });
};

export const fetchRandomAPOD = () => api.get('/apod/random?count=1');
