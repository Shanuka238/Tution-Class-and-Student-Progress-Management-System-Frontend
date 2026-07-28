import apiRequest from "./api.js";
import { API_URLS } from "./apiUrls";

export const parentAPI = {
  getMyChildren: async () => {
    return await apiRequest(`${API_URLS.PARENT}/me/children`);
  },

  getChildProgress: async (studentId) => {
    return await apiRequest(`${API_URLS.PARENT}/children/${studentId}/progress`);
  },
};

export default parentAPI;
