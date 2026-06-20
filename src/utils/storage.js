export const TOKEN_KEY = "_sys_k";
export const USER_KEY = "_sys_d";

// Fungsi untuk obfuscate (menyembunyikan teks ke dalam Base64 agar tidak terlihat plain text di DevTools)
export const encodeData = (data) => {
  if (!data) return null;
  try {
    return btoa(encodeURIComponent(data));
  } catch (e) {
    return data;
  }
};

// Fungsi untuk de-obfuscate (mengembalikan Base64 ke teks asli)
export const decodeData = (encoded) => {
  if (!encoded) return null;
  try {
    return decodeURIComponent(atob(encoded));
  } catch (e) {
    return encoded; // Fallback kalau ternyata datanya plain text lama
  }
};
