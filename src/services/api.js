// src/services/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Use your computer's IP address, not localhost!
// Find your IP: ipconfig (Windows) or ifconfig (Linux/Mac)

//const API_BASE_URL = "http://192.168.0.110/Hema/public/api"; // Replace with your IP, localhost
const API_BASE_URL = "http://10.217.84.214/Hema/public/api"; // Replace with your IP, localhost
//const API_BASE_URL = "https://hematest.jldev.app.br/api"; // Remote server

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // ← CRITICAL: Send cookies with requests
});

// CSRF Token Management
let csrfToken = false;

// Ensure CSRF token before requests
api.interceptors.request.use(async (config) => {
  console.log("🔄 API Request:", config.url);

  // Skip for CSRF endpoint itself
  if (config.url?.includes("/sanctum/csrf-cookie")) return config;

  // Get CSRF token if we don't have it
  if (!csrfToken) {
    try {
      console.log("🔐 Setting up CSRF token...");
      //await axios.get('https://hematest.jldev.app.br/sanctum/csrf-cookie', {
      await axios.get("http://10.217.84.214/Hema/public/sanctum/csrf-cookie", {
      //await axios.get("http://192.168.0.110/Hema/public/sanctum/csrf-cookie", {
        withCredentials: true,
      });
      csrfToken = true; // Token is now in cookies
      console.log("✅ CSRF token initialized");
    } catch (error) {
      console.warn(
        "⚠️CSRF token setup failed, proceeding anyway, but this may cause issues",
        error.message
      );
    }
  }

  return config;
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log("API Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.log("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Added auth token to request");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");
      csrfToken = false;
    }
    return Promise.reject(error);
  }
);

export default api;
