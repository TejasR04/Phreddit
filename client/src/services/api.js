import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const api = {
  getAllCommunities: async () => {
    const response = await axios.get(`${API_BASE_URL}/communities`);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  },

  deleteUser: async (userId) => {
    await axios.delete(`${API_BASE_URL}/users/${userId}`);
  },

  getCommunity: async (communityId) => {
    const response = await axios.get(
      `${API_BASE_URL}/communities/${communityId}`
    );
    return response.data;
  },

  getUserProfile: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/profile`);
    return response.data;
  },

  getUserCommunities: async (displayName) => {
    const response = await axios.get(
      `${API_BASE_URL}/creator/${displayName}/communities`
    );
    return response.data;
  },

  getUserPosts: async (displayName) => {
    const response = await axios.get(
      `${API_BASE_URL}/creator/${displayName}/posts`
    );
    return response.data;
  },

  getUserComments: async (displayName) => {
    const response = await axios.get(
      `${API_BASE_URL}/creator/${displayName}/comments`
    );
    return response.data;
  },

  updateCommunity: async (communityId, communityData) => {
    const response = await axios.patch(
      `${API_BASE_URL}/communities/${communityId}`,
      communityData
    );
    return response.data;
  },

  // Update a post
  updatePost: async (postId, postData) => {
    const response = await axios.patch(
      `${API_BASE_URL}/posts/${postId}`,
      postData
    );
    return response.data;
  },

  // Update a comment
  updateComment: async (commentId, commentData) => {
    const response = await axios.patch(
      `${API_BASE_URL}/comments/${commentId}`,
      commentData
    );
    return response.data;
  },

  deleteCommunity: async (communityId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/communities/${communityId}`
    );
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await axios.delete(`${API_BASE_URL}/posts/${postId}`);
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/comments/${commentId}`
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

  createComment: async (postId, commentData, displayName) => {
    const response = await axios.post(
      `${API_BASE_URL}/posts/${postId}/comments`,
      { ...commentData, displayName } // Include displayName in the payload
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

  joinCommunity: async (communityId, displayName) => {
    const response = await axios.post(
      `${API_BASE_URL}/communities/${communityId}/join`,
      { displayName }
    );
    return response.data;
  },
  leaveCommunity: async (communityId, displayName) => {
    const response = await axios.post(
      `${API_BASE_URL}/communities/${communityId}/leave`,
      { displayName }
    );
    return response.data;
  },
  upvotePost: async (postId, displayName) => {
    const response = await axios.patch(
      `${API_BASE_URL}/posts/${postId}/upvote`,
      { displayName }
    );
    return response.data;
  },

  downvotePost: async (postId, displayName) => {
    const response = await axios.patch(
      `${API_BASE_URL}/posts/${postId}/downvote`,
      { displayName }
    );
    return response.data;
  },

  upvoteComment: async (commentId, displayName) => {
    const response = await axios.patch(
      `${API_BASE_URL}/comments/${commentId}/upvote`,
      { displayName }
    );
    return response.data;
  },

  downvoteComment: async (commentId, displayName) => {
    console.log(
      "API: Downvote comment with ID:",
      commentId,
      "by user:",
      displayName
    ); // Debugging
    const response = await axios.patch(
      `${API_BASE_URL}/comments/${commentId}/downvote`,
      { displayName }
    );
    return response.data;
  },
};
