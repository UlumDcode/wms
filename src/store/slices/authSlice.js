import { createSlice } from "@reduxjs/toolkit";
import { TOKEN_KEY, USER_KEY, encodeData, decodeData } from "../../utils/storage";

/**
 * Helper function to retrieve initial auth state from storage.
 * It checks localStorage first (for persistent sessions) and falls back to sessionStorage.
 */
const getInitialAuth = () => {
  const encToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  const encUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  
  const token = decodeData(encToken);
  const userStr = decodeData(encUser);
  let user = null;

  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error("Gagal melakukan parse data user saat inisialisasi:", e);
    }
  }

  // Cek fallback legacy plain text jika obfuscated tidak ditemukan
  const legacyToken = localStorage.getItem("token") || sessionStorage.getItem("token");
  const legacyUser = localStorage.getItem("user") || sessionStorage.getItem("user");

  if (!token && legacyToken) {
    // Migrasi otomatis ke obfuscated
    localStorage.setItem(TOKEN_KEY, encodeData(legacyToken));
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  }
  if (!user && legacyUser) {
    localStorage.setItem(USER_KEY, encodeData(legacyUser));
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
  }

  return {
    token: token || legacyToken || null,
    user: user || (legacyUser ? JSON.parse(legacyUser) : null),
    isAuthenticated: !!(token || legacyToken),
  };
};

const initialState = getInitialAuth();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      // payload: { token, user, rememberMe }
      const { token, user, rememberMe } = action.payload;

      // Tentukan storage berdasarkan opsi 'Ingat Saya' (rememberMe)
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, encodeData(token));
      storage.setItem(USER_KEY, encodeData(JSON.stringify(user)));

      // Hapus data dari storage satunya untuk mencegah inkonsistensi
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem(TOKEN_KEY);
      otherStorage.removeItem(USER_KEY);
      
      // Hapus versi lama agar bersih
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      // Update state Redux
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      // Bersihkan token dan user dari kedua storage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);

      // Bersihkan versi lama juga
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      // Hapus session lama jika ada (migrasi kompatibilitas)
      localStorage.removeItem("user_session");

      // Reset state Redux
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
