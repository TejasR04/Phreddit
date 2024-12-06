import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const api = {
  getAllCommunities: async () => {
    const response = await axios.get(`${API_BASE_URL}/communities`);
    return response.data;
  },

  getCommunity: async (communityId) => {
    const response = await axios.get(
      `${API_BASE_URL}/communities/${communityId}`
    );
    return response.data;
  },

  createCommunity: async (communityData) => {
    const response = await axios.post(
      `${API_BASE_URL}/communities`,
      communityData
    );
    return response.data;
  },

  getAllPosts: async () => {
    const response = await axios.get(`${API_BASE_URL}/posts`);
    return response.data;
  },

  getPost: async (postId) => {
    const response = await axios.get(`${API_BASE_URL}/posts/${postId}`);
    return response.data;
  },

  createPost: async (postData) => {
    const response = await axios.post(`${API_BASE_URL}/posts`, postData);
    return response.data;
  },

  incrementViews: async (postId) => {
    const response = await axios.patch(`${API_BASE_URL}/posts/${postId}/views`);
    return response.data;
  },

  getComments: async (postId) => {
    const response = await axios.get(
      `${API_BASE_URL}/posts/${postId}/comments`
    );
    return response.data;
  },

  getComment: async (commentId) => {
    const response = await axios.get(`${API_BASE_URL}/comments/${commentId}`);
    return response.data;
  },

  createComment: async (postId, commentData) => {
    const response = await axios.post(
      `${API_BASE_URL}/posts/${postId}/comments`,
      commentData
    );
    return response.data;
  },

  getAllLinkFlairs: async () => {
    const response = await axios.get(`${API_BASE_URL}/linkFlairs`);
    return response.data;
  },

  createLinkFlair: async (linkFlairData) => {
    const response = await axios.post(
      `${API_BASE_URL}/linkFlairs`,
      linkFlairData
    );
    return response.data;
  },

  search: async (query) => {
    const response = await axios.get(`${API_BASE_URL}/search?q=${query}`);
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response.data;
  },

  login: async (loginData) => {
    const response = await axios.post(`${API_BASE_URL}/login`, loginData);
    return response.data;
  },

  joinCommunity: async (communityId, userId) => {
    const response = await axios.post(`${API_BASE_URL}/communities/${communityId}/join`,{ userId });
    return response.data;
  },
  leaveCommunity: async (communityId, userId) => {
    const response = await axios.post(`${API_BASE_URL}/communities/${communityId}/leave`,{ userId }
    );
    return response.data;
  },
};
