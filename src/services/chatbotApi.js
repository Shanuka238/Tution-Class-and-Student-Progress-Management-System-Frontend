import apiRequest from "./api.js";
import { API_URLS } from "./apiUrls.js";

export const chatbotAPI = {
  askQuestion: async (question) => {
    return await apiRequest(`${API_URLS.CHATBOT}/ask`, {
      method: "POST",
      body: { question },
    });
  },

  getHistory: async () => {
    return await apiRequest(`${API_URLS.CHATBOT}/history`);
  },

  clearHistory: async () => {
    return await apiRequest(`${API_URLS.CHATBOT}/history`, {
      method: "DELETE",
    });
  },
};
