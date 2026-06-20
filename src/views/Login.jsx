import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice";
import axiosInstance from "../utils/axios";

const Login = ({ onLoginSuccess }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Mengirim POST request menggunakan Axios
      const response = await axiosInstance.post("/log.php?action=login", form);
      const data = response.data;

      if (data.status === "success") {
        // Dispatch ke Redux slice (otomatis menyimpan ke localStorage/sessionStorage)
        dispatch(
          loginSuccess({
            token: data.token,
            user: data.user,
            rememberMe,
          })
        );

        // Lapor ke App.jsx untuk sinkronisasi data global & navigasi
        onLoginSuccess();
      } else {
        setError(data.message || "Username atau Password salah!");
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Gagal koneksi ke server API";
      setError(errMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-900 px-4 relative">
      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">
            INVEN<span className="text-blue-600">TORY</span>
          </h1>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400 mt-2">
            Login System
          </p>
        </div>

        {/* Munculin Notifikasi Kalo Ada Error */}
        {error && (
          <div className="bg-rose-100 text-rose-600 p-3 rounded-xl text-xs font-bold text-center mb-6 uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="text"
            placeholder="Username"
            className="w-full bg-slate-50 p-4 rounded-xl font-bold text-sm outline-none border-2 border-transparent focus:border-blue-600 transition-all"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value.replace(/\s/g, "") })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-slate-50 p-4 rounded-xl font-bold text-sm outline-none border-2 border-transparent focus:border-blue-600 transition-all"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {/* Checkbox Ingat Saya (Remember Me) */}
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-500 hover:text-slate-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Ingat Saya</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk Sistem"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

