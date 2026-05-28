import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🌐 EXPO GO Wi-Fi ROUTER IP
// Your phone and laptop must be on the exact same Wi-Fi network.
const DEV_LOCAL_IP = "http://192.168.1.173:8000/api/"; //swapped to my local ip so swap it to yours if you wanna use it

// Bypass Platform.select since real phones running Expo Go need the local network IP directly
const baseURL = "https://ipt-pitbackend.onrender.com/api/";

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * 🔒 REQUEST INTERCEPTOR
 * This intercepts every outbound HTTP request before it leaves your app.
 * It checks AsyncStorage for a valid 'auth' token and injects it into 
 * the Django REST Framework format: 'Authorization: Token <key>'
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("auth");
      
      if (token) {
        // Django's TokenAuthentication explicitly requires the 'Token' prefix
        config.headers.Authorization = `Token ${token}`;
      }
    } catch (error) {
      console.error("Error reading auth token from storage:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;