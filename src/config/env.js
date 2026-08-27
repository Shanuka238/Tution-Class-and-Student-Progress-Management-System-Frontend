// Centralized frontend environment configuration
// Safely reads Vite environment variables with fallbacks
const metaEnv = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};

export const APP_CONFIG = {
  // Base backend API URL (defaults to localhost:5000 for local development)
  API_BASE_URL: metaEnv.VITE_API_URL || "http://localhost:5000",

  // Application Display Name
  APP_NAME: metaEnv.VITE_APP_NAME || "EduManage 360",

  // Environment flags
  IS_PROD: Boolean(metaEnv.PROD),
  IS_DEV: Boolean(metaEnv.DEV),
};

export default APP_CONFIG;
