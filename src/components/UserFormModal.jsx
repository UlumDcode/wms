import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";

const UserFormModal = ({
  isOpen,
  onClose,
  currentUser,
  editData,
  onSuccess,
  formatRupiah,
}) => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [vipRoles, setVipRoles] = useState([]);

  const [form, setForm] = useState({
    username: "",
    password: "",
    nama: "",
    role: "", // Akan terisi otomatis dari BE
    no_hp: "",
    email: "",
    gaji: "",
  });

  // Mengambil daftar role dari Backend saat Modal dibuka
  useEffect(() => {
    if (isOpen) {
      axiosInstance.get("/users.php?action=get_roles")
        .then((res) => {
          const data = res.data;
          if (data.status === "success") {
            const rList = data.roles || [];
            setRoles(rList);
            setVipRoles(data.vip_roles || []);

            if (editData) {
              setForm({
                id: editData.id,
                username: editData.username,
                password: "",
                nama: editData.nama,
                role: editData.role,
                no_hp: editData.no_hp || "",
                email: editData.email || "",
                gaji: editData.gaji || "",
              });
            } else {
              setForm({
                username: "",
                password: "",
                nama: "",
                role: rList.length > 0 ? rList[0].value : "",
                no_hp: "",
                email: "",
                gaji: "",
              });
            }
          }
        })
        .catch(() => console.error("Gagal mengambil data roles dari BE"));
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || (!editData && !form.password) || !form.nama) {
      return window.showToast(
        `Nama, Username, dan ${!editData ? "Password " : ""}wajib diisi, Bro!`,
        "warning",
      );
    }
    if (!form.role) {
      return window.showToast("Role wajib dipilih!", "warning");
    }

    setLoading(true);
    const action = editData ? "update" : "create";
    try {
      const res = await axiosInstance.post(`/users.php?action=${action}`, form);
      const data = res.data;


      if (data.status === "success") {
        window.showToast(
          data.message ||
          (editData
            ? "Data user berhasil diupdate!"
            : "User berhasil didaftarkan!"),
          "success",
        );
        setForm({
          username: "",
          password: "",
          nama: "",
          role: roles.length > 0 ? roles[0].value : "",
          no_hp: "",
          email: "",
          gaji: "",
        });
        onSuccess();
        onClose();
      } else {
        window.showToast(data.message, "error");
      }
    } catch (err) {
      window.showToast("Gagal koneksi ke server!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
        <h3 className="font-black uppercase italic text-sm md:text-base mb-4 md:mb-6 border-b border-slate-100 pb-3 md:pb-4 text-slate-800">
          {editData ? "Update" : "Registrasi"}{" "}
          <span className="text-rose-600">
            {editData ? "Data User" : "Akun Baru"}
          </span>
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
                Nama Pengguna
              </label>
              <input
                type="text"
                placeholder="Misal: Budi Santoso"
                className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm outline-none border border-slate-100 focus:border-rose-500 transition-all shadow-sm"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
                Username Login
              </label>
              <input
                type="text"
                placeholder="Misal: kasir_budi"
                className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm outline-none border border-slate-100 focus:border-rose-500 transition-all shadow-sm"
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value.replace(/\s/g, ""),
                  })
                }
              />
            </div>
            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
                Password
              </label>
              <input
                type="password"
                placeholder="Buat password..."
                className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm outline-none border border-slate-100 focus:border-rose-500 transition-all shadow-sm"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {editData && (
                <p className="text-[8px] font-bold text-slate-400 mt-1 italic">
                  * Kosongkan jika tidak ingin ganti password
                </p>
              )}
            </div>

            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
                No. HP
              </label>
              <input
                type="text"
                placeholder="0812..."
                className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm outline-none border border-slate-100 focus:border-rose-500 transition-all shadow-sm"
                value={form.no_hp}
                onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
                Role
              </label>
              <select
                className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm outline-none border border-slate-100 focus:border-rose-500 transition-all cursor-pointer shadow-sm text-slate-800"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}

                {/* V.I.P ROLES untuk Developer */}
                {currentUser?.role === "developer" && (
                  <>
                    {vipRoles.map((vr) => (
                      <option key={vr.value} value={vr.value}>
                        {vr.label}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
                Email
              </label>
              <input
                type="email"
                placeholder="email@domain.com"
                className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm outline-none border border-slate-100 focus:border-rose-500 transition-all shadow-sm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
                Gaji Bulanan
              </label>
              <input
                type="text"
                placeholder="Rp 0"
                className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm outline-none border border-slate-100 focus:border-rose-500 transition-all shadow-sm"
                value={formatRupiah ? formatRupiah(form.gaji) : form.gaji}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gaji: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 p-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-slate-900 text-white p-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 active:scale-95 transition-all shadow-md disabled:opacity-50"
            >
              {loading
                ? "Menyimpan..."
                : editData
                  ? "Simpan Perubahan"
                  : "Daftarkan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
