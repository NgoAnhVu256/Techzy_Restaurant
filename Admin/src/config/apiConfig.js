export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || "http://localhost:5000";

export const buildApiUrl = (path = "") => `${API_BASE_URL}${path}`;
export const buildFileUrl = (path = "") => `${FILE_BASE_URL}${path}`;
