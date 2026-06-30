import apiRequest from "./api.js";
import { API_URLS } from "./apiUrls.js";

export const adminAPI = {

  async getAllUsers() {
    return await apiRequest(API_URLS.ADMIN.USERS);
  },

  async createUser(userData) {
    return await apiRequest(API_URLS.ADMIN.USERS, {
      method: "POST",
      body: userData,
    });
  },

  async updateUser(userId, userData) {
    return await apiRequest(`${API_URLS.ADMIN.USERS}/${userId}`, {
      method: "PUT",
      body: userData,
    });
  },

  async deleteUser(userId, mode = "soft") {
    return await apiRequest(`${API_URLS.ADMIN.USERS}/${userId}?mode=${mode}`, {
      method: "DELETE",
    });
  },
};