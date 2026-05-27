import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ipt-pitbackend.onrender.com/api/', // Change to Render URL later
});

export default api;