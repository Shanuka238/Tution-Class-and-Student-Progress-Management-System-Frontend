import apiRequest from "./api.js";
import { API_URLS } from "./apiUrls.js";

export const notificationAPI = {
  getMyNotifications: async () => {
    return await apiRequest(`${API_URLS.NOTIFICATIONS}/me`);
  },

  markAsRead: async (notificationId) => {
    return await apiRequest(`${API_URLS.NOTIFICATIONS}/${notificationId}/read`, {
      method: "PUT",
    });
  },

  markAllAsRead: async () => {
    return await apiRequest(`${API_URLS.NOTIFICATIONS}/read-all`, {
      method: "PUT",
    });
  },

  deleteNotification: async (notificationId) => {
    return await apiRequest(`${API_URLS.NOTIFICATIONS}/${notificationId}`, {
      method: "DELETE",
    });
  },

  sendBroadcast: async (broadcastData) => {
    return await apiRequest(`${API_URLS.NOTIFICATIONS}/broadcast`, {
      method: "POST",
      body: broadcastData,
    });
  },
};
