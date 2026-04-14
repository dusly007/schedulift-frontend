import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3005',
    withCredentials: true, //envoyer cookies de session
});

export default api;