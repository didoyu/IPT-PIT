import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ipt-pit-lgr4.onrender.com/api/', // Change to Render URL later
});

export default api;