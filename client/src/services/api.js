import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://192.168.137.1:5000/api',
});

// Attach token to every request if user is logged in
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const user = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const loginUser = async (email, password) => {
  const { data } = await API.post('/auth/login', { email, password });
  return data;
};

export const registerUser = async (username, email, password) => {
  const { data } = await API.post('/auth/register', { username, email, password });
  return data;
};

// Memes
export const getMemes = async () => {
  const { data } = await API.get('/memes');
  return data;
};

export const uploadMeme = async (formData) => {
  const { data } = await API.post('/memes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const likeMeme = async (id) => {
  const { data } = await API.put(`/memes/${id}/like`);
  return data;
};

export const deleteMeme = async (id) => {
  const { data } = await API.delete(`/memes/${id}`);
  return data;
};
// Comments
export const getComments = async (memeId) => {
  const { data } = await API.get(`/memes/${memeId}/comments`);
  return data;
};

export const addComment = async (memeId, text) => {
  const { data } = await API.post(`/memes/${memeId}/comments`, { text });
  return data;
};

// Optional: delete comment if needed later
export const deleteComment = async (commentId) => {
  const { data } = await API.delete(`/comments/${commentId}`);
  return data;
};

// Get user's memes
export const getUserMemes = async (userId) => {
  const { data } = await API.get(`/memes/user/${userId}`);
  return data;
};

// Update user profile (bio + optional image)
export const updateProfile = async (formData) => {
  const { data } = await API.put('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};