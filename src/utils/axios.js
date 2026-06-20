import axios from "axios";
import { TOKEN_KEY, USER_KEY, decodeData } from "./storage";

// Ambil URL Base API dari localStorage, env variable, atau fallback default
export const API_URL =
  localStorage.getItem("CUSTOM_API_URL") || import.meta.env.VITE_API_URL;

// Pastikan base URL diakhiri dengan slash agar resolusi relative path aman
const baseURL = API_URL.endsWith("/") ? API_URL : `${API_URL}/`;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420", // Menghindari halaman warning jika menggunakan ngrok
  },
});

// Interceptor sebelum request dikirim
axiosInstance.interceptors.request.use(
  (config) => {
    // Hapus leading slash (/) dari URL request agar tidak di-resolve ke root domain oleh Axios
    if (config.url && config.url.startsWith("/")) {
      config.url = config.url.substring(1);
    }

    // Cari token dari localStorage atau sessionStorage (mendukung obfuscated atau fallback)
    const encToken =
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    let token = decodeData(encToken);

    // Fallback baca token lama jika belum sempat migrasi
    if (!token) {
      token = localStorage.getItem("token") || sessionStorage.getItem("token");
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (import.meta.env.MODE !== "production") {
      console.log(`📡 [AXIOS REQUEST] -> ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error(`❌ [AXIOS REQUEST ERROR]`, error);
    return Promise.reject(error);
  },
);

// Interceptor setelah response diterima
axiosInstance.interceptors.response.use(
  (response) => {
    // Fungsi helper auto-logout
    const triggerLogout = () => {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    };

    // 1. Deteksi HTML Fatal Error (Kadang server mengembalikan 200 OK tapi isinya teks error HTML)
    if (
      typeof response.data === "string" &&
      response.data.includes("max_connections_per_hour")
    ) {
      console.error(
        "🚨 DATABASE LIMIT TERLAMPAUI (HTML Response)! Auto-logout dipicu.",
      );
      triggerLogout();
      return Promise.reject(new Error("Database connection limit exceeded"));
    }

    // Deteksi jika Token kedaluwarsa atau tidak valid (Unauthorized) dari JSON message
    if (
      response.data &&
      response.data.status === "error" &&
      typeof response.data.message === "string"
    ) {
      const errorMsg = response.data.message;
      if (errorMsg.includes("Unauthorized")) {
        console.warn(
          "⚠️ [AUTH] Sesi telah berakhir atau token tidak valid. Anda akan dikeluarkan.",
        );
        triggerLogout();
        return Promise.reject(new Error("Unauthorized"));
      } else {
        console.error(
          `❌ [API JSON ERROR] <- ${response.config.url}`,
          errorMsg,
        );
      }
    } else if (import.meta.env.MODE !== "production") {
      // Hanya log sukses jika BUKAN mode production
      console.log(
        `✅ [AXIOS RESPONSE] SUCCESS <- ${response.config.url}`,
        response.data,
      );
    }
    return response;
  },
  (error) => {
    console.error(
      `❌ [AXIOS RESPONSE ERROR] <- ${error.config?.url || "Unknown URL"}`,
      error.response?.data || error.message,
    );

    // Fungsi helper untuk auto-logout
    const triggerLogout = () => {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    };

    // Deteksi HTTP 401 Unauthorized (Token Habis)
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Token API kedaluwarsa atau tidak valid (HTTP 401).");
      triggerLogout();
      return Promise.reject(error);
    }

    // Deteksi Fatal Error HTML dari Hostinger (Database Limit)
    // Server PHP mungkin membalas HTTP 500 atau 503 dengan teks HTML exception
    const isDbLimitError =
      error.response &&
      error.response.status >= 500 &&
      typeof error.response.data === "string" &&
      (error.response.data.includes("max_connections_per_hour") ||
        error.response.data.includes("mysqli_sql_exception"));

    if (isDbLimitError) {
      console.error(
        "🚨 DATABASE LIMIT TERLAMPAUI! Auto-logout dipicu untuk mengamankan server.",
      );
      triggerLogout();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

// ==============================================
// 🌟 AXIOS NO-CACHE CONFIGURATION
// ==============================================

// Tambahkan interceptor agar setiap GET request selalu bypass browser cache
axiosInstance.interceptors.request.use((config) => {
  if (config.method === 'get') {
    // Jangan ubah custom headers Cache-Control/Pragma karena bisa memicu CORS Preflight (OPTIONS)
    // yang akan ditolak oleh server PHP jika tidak di-allow di Access-Control-Allow-Headers.
    
    // Cukup gunakan timestamp query parameter untuk menjebol cache (Cache Buster)
    // Tanpa memicu CORS Preflight request
    config.params = { ...config.params, _t: Date.now() };
  }
  return config;
});

export default axiosInstance;
