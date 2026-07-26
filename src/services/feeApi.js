import apiRequest from "./api.js";
import { API_URLS } from "./apiUrls";

export const feeAPI = {
  generateMonthlyFees: async (feeData) => {
    return await apiRequest(`${API_URLS.FEES}`, { method: "POST", body: feeData });
  },

  getAllFees: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await apiRequest(`${API_URLS.FEES}${params ? `?${params}` : ""}`);
  },

  getFinancialStats: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await apiRequest(`${API_URLS.FEES}/stats${params ? `?${params}` : ""}`);
  },

  markAsPaid: async (feeId) => {
    return await apiRequest(`${API_URLS.FEES}/${feeId}/pay-cash`, { method: "POST" });
  },

  sendOverdueReminders: async () => {
    return await apiRequest(`${API_URLS.FEES}/remind-overdue`, { method: "POST" });
  },

  getMyFees: async () => {
    return await apiRequest(`${API_URLS.FEES}/me`);
  },

  initiatePayHere: async (feeId) => {
    return await apiRequest(`${API_URLS.FEES}/${feeId}/initiate-payhere`, { method: "POST" });
  },

  mockPayHereSuccess: async (feeId) => {
    return await apiRequest(`${API_URLS.FEES}/${feeId}/mock-payhere-success`, { method: "POST" });
  },
};
export default feeAPI;
