import apiRequest from "./api.js";

const FEE_API_URL = "/fees";

export const feeAPI = {
  generateMonthlyFees: async (feeData) => {
    return await apiRequest(`${FEE_API_URL}`, { method: "POST", body: feeData });
  },

  getAllFees: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await apiRequest(`${FEE_API_URL}${params ? `?${params}` : ""}`);
  },

  getFinancialStats: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await apiRequest(`${FEE_API_URL}/stats${params ? `?${params}` : ""}`);
  },

  markAsPaid: async (feeId) => {
    return await apiRequest(`${FEE_API_URL}/${feeId}/pay-cash`, { method: "POST" });
  },

  sendOverdueReminders: async () => {
    return await apiRequest(`${FEE_API_URL}/remind-overdue`, { method: "POST" });
  },

  getMyFees: async () => {
    return await apiRequest(`${FEE_API_URL}/me`);
  },

  initiatePayHere: async (feeId) => {
    return await apiRequest(`${FEE_API_URL}/${feeId}/initiate-payhere`, { method: "POST" });
  },

  mockPayHereSuccess: async (feeId) => {
    return await apiRequest(`${FEE_API_URL}/${feeId}/mock-payhere-success`, { method: "POST" });
  },
};
export default feeAPI;
