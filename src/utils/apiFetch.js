const API_URL =
  import.meta.env.VITE_API_URL;

export const apiFetch = async (endpoint, options = {}) => {
  const finalUrl = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const sessionStr = localStorage.getItem("user_session");
  let token = "";

  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      token = session.token || "";
    } catch (e) { }
  }

  // --- DEBUGGING TRACKER ---
  console.log("FETCH KE:", finalUrl);
  console.log(
    "TOKEN YG DIKIRIM:",
    token ? `Bearer ${token.substring(0, 10)}...` : "KOSONG/NULL!",
  );

  const headers = {
    ...options.headers,
    "ngrok-skip-browser-warning": "69420",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const finalOptions = { ...options };
  delete finalOptions.credentials;

  const response = await fetch(finalUrl, { ...finalOptions, headers });

  if (response.status === 401) {
    console.error("SERVER MENOLAK AKSES (401)! Token invalid / expired.");
    localStorage.removeItem("user_session");
    window.location.reload();
    throw new Error("Unauthorized: Sesi Telah Berakhir");
  }

  // CEK APAKAH FORMAT JSON VALID DARI BACKEND
  const clonedRes = response.clone();
  try {
    await clonedRes.json();
  } catch (err) {
    const text = await response.clone().text();
    console.error("ERROR: RESPON BACKEND BUKAN JSON! Isinya:", text);
    throw new Error(
      `Respons Server Invalid / Kosong. Isinya: ${text || "(BLANK)"}`,
    );
  }

  return response;
};
