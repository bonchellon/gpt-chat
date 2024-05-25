import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

export const getBots = () => API.get('/bots');
export const getChatHistory = () => API.get('/history');
export const clearChatHistory = () => API.post('/clear');
export const sendMessage = (data) => API.post('/chat', data);
export const uploadFile = (data) => API.post('/upload', data);
export const checkBot = (data) => API.post('/check_bot', data);
