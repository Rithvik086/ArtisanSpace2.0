import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1', // Backend URL
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // This is crucial for sending cookies
});

export default api;
