import { API_URLS } from "./apiUrls.js";

const API_BASE = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("edutracker_token");

const setToken = (token) => localStorage.setItem("edutracker_token", token);

const removeToken = () => {
  localStorage.removeItem("edutracker_token");
  localStorage.removeItem("edutracker_user");
};

const getStoredToken = () => localStorage.getItem("edutracker_token");

async function apiRequest(endpoint, options = {}) {
  const { 
    method = "GET", 
    body = null, 
    isFormData = false, 
    requireAuth = true 
  } = options;

  const headers = {};
  
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  if (requireAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config = { method, headers };
  
  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 && requireAuth) {
      removeToken();
    }
    throw { 
      status: response.status, 
      message: data.message || "Something went wrong" 
    };
  }

  return data;
}

export const authAPI = {
  async login({ email, password, role }) {
    const data = await apiRequest(API_URLS.AUTH.LOGIN, {
      method: "POST",
      body: { email, password, role },
      requireAuth: false,
    });
    
    const token = data.data?.token || data.token;
    const user = data.data?.user || data.user;
    
    if (token) setToken(token);
    if (user) localStorage.setItem("edutracker_user", JSON.stringify(user));
    
    return user || data;
  },

  async register(userData) {
    return await apiRequest(API_URLS.AUTH.REGISTER, {
      method: "POST",
      body: userData,
      requireAuth: false,
    });
  },

  async getMe() {
    const data = await apiRequest(API_URLS.AUTH.ME);
    return data.data?.user || data.user;
  },

  async uploadProfileImage(file) {
    const formData = new FormData();
    formData.append("profileImage", file);

    const token = getToken();
    const headers = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${API_URLS.AUTH.UPLOAD_PROFILE_IMAGE}`, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
      }
      throw { 
        status: response.status, 
        message: data.message || "Something went wrong" 
      };
    }

    return data;
  },

  logout() {
    removeToken();
  },

  getStoredUser() {
    try {
      const user = localStorage.getItem("edutracker_user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!getToken();
  },
};

export default apiRequest;
