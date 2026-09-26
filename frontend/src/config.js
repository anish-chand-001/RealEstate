const configuredApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const API_URL = configuredApiUrl.replace(/\/$/, '');

export default API_URL;
