import apiRequest from "./api.js";

const PARENT_API_URL = "/parents";

export const parentAPI = {
  getMyChildren: async () => {
    return await apiRequest(`${PARENT_API_URL}/me/children`);
  },

  getChildProgress: async (studentId) => {
    return await apiRequest(`${PARENT_API_URL}/children/${studentId}/progress`);
  },
};

export default parentAPI;
