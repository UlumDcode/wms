import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import UserFormModal from "../../components/UserFormModal";
import SalaryPaymentModal from "../../components/SalaryPaymentModal";

const UserManagement = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedUserForSalary, setSelectedUserForSalary] = useState(null);
  const [rekeningList, setRekeningList] = useState([]);
  const [editData, setEditData] = useState(null);

  const formatRupiah = (val) => {
    if (!val) return "Rp 0";
    return "Rp " + new Intl.NumberFormat("id-ID").format(val);
  };

  // Fetch dari users.php?action=read
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("users.php?action=read");
      const data = res.data;
      setUsers(data.data || []);
    } catch (e) {
      console.error("Gagal muat data user");
    }
  };

  const fetchRekeningList = async () => {
    try {
      const res = await axiosInstance.get(
        "users.php?action=get_payment_accounts"
      );
      const data = res.data;
      setRekeningList(data.data || []);
    } catch (e) {
      console.error("Gagal memuat daftar rekening", e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRekeningList();
  }, []);

  const handleEdit = (user) => {
    setEditData(user);
    setShowModal(true);
  };

  // Logic Hapus Akun dengan Proteksi Hak Akses
  const handleDelete = async (id, roleName) => {
    if (currentUser?.id === id)
      return window.showToast("Lu gak bisa ngehapus akun lu sendiri!", "error");
    if (roleName === "developer" && currentUser?.role !== "developer")
      return window.showToast(
        "Cuma Developer yang bisa ngehapus Developer lain!",
        "error",
      );
    if (roleName === "owner" && currentUser?.role !== "developer")
      return window.showToast(
        "Cuma Developer yang berhak ngehapus Owner!",
        "error",
      );

    const isConfirmed = await window.showConfirm("Yakin mau hapus user ini?");
    if (isConfirmed) {
      try {
        await axiosInstance.get(`users.php?action=delete&id=${id}`);
        fetchUsers();
      } catch (e) {
        window.showToast("Gagal hapus user", "error");
      }
    }
  };

  const handlePaySalaryClick = (user) => {
    setSelectedUserForSalary(user);
    setShowSalaryModal(true);
  };

  const handleSalarySubmit = async (formData) => {
    try {
      const res = await axiosInstance.post("users.php?action=pay_salary", formData);
      const data = res.data;
      if (data.status === "success") {
        window.showToast(data.message, "success");
        setShowSalaryModal(false);
        fetchRekeningList(); // Refresh saldo rekening
      } else {
        window.showToast(data.message, "error");
      }
    } catch (e) {
      window.showToast("Gagal memproses pembayaran gaji", "error");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500 h-full flex flex-col min-h-0 text-slate-900">
      {/* FUNCTIONAL HEADER - RAMPING & MODERN */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-3 shrink-0 w-full">
        <div>
          <h2 className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
            Management <span className="text-blue-600">User</span>
          </h2>
          <p className="font-bold text-[8px] md:text-[9px] tracking-[0.2em] uppercase mt-1 text-rose-500 opacity-80">
            🛡️ V.I.P Access Control
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
              🔍
            </div>
            <input
              type="text"
              placeholder="Cari nama, username, atau role..."
              className="w-full bg-white border border-slate-200 py-2.5 pl-11 pr-4 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setEditData(null);
              setShowModal(true);
            }}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md hover:bg-blue-600 active:scale-95 transition-all whitespace-nowrap"
          >
            + DAFTAR USER
          </button>
        </div>
      </div>

      {/* LIST DATA USER */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-0">
        <div className="overflow-auto custom-scrollbar flex-1 p-2 md:p-4 pt-0">
          <table className="w-full min-w-[700px] text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="text-slate-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                <th className="py-2 px-2 md:p-3">Informasi Akun</th>
                <th className="py-2 px-2 md:p-3 text-center">Hak Akses</th>
                <th className="py-2 px-2 md:p-3 text-center">Kontak</th>
                <th className="py-2 px-2 md:p-3 text-right">Gaji Pokok</th>
                <th className="py-2 px-2 md:p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u, idx) => (
                  <tr
                    key={u.id}
                    className="group hover:bg-slate-50 transition-all duration-200"
                  >
                    <td className="p-2.5 md:p-3 bg-slate-50 rounded-l-xl border-y border-l border-slate-100">
                      <div className="font-black text-slate-800 uppercase italic tracking-tighter text-[10px] md:text-xs">
                        {u.nama}
                      </div>
                      <div className="text-[8px] md:text-[9px] text-blue-500 font-bold mt-0.5 tracking-widest uppercase">
                        ID: {u.username}
                      </div>
                    </td>
                    <td className="p-2.5 md:p-3 bg-slate-50 border-y border-slate-100 text-center">
                      <span
                        className={`px-3 py-1 rounded-md text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${u.role?.toLowerCase() === "developer"
                            ? "bg-rose-500 text-white border-rose-600"
                            : u.role?.toLowerCase() === "owner"
                              ? "bg-blue-500 text-white border-blue-600"
                              : u.role?.toLowerCase() === "finance"
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : u.role?.toLowerCase() === "admin"
                                  ? "bg-red-500 text-white border-red-600"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                      >
                        {u.role || "GUEST"}
                      </span>
                    </td>
                    <td className="p-2.5 md:p-3 bg-slate-50 border-y border-slate-100 text-center">
                      <div className="text-[8px] md:text-[9px] font-black text-slate-700">
                        {u.no_hp || "-"}
                      </div>
                      <div className="text-[8px] md:text-[9px] font-bold text-slate-400 mt-0.5 md:mt-1">
                        {u.email || "-"}
                      </div>
                    </td>
                    <td className="p-2.5 md:p-3 bg-slate-50 border-y border-slate-100 text-right">
                      <div className="text-[10px] md:text-xs font-black text-emerald-600 italic">
                        {formatRupiah(u.gaji)}
                      </div>
                    </td>
                    <td className="p-2.5 md:p-3 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-center">
                      {currentUser?.id === u.id ? (
                        <span className="text-[8px] md:text-[9px] font-black text-slate-300 italic uppercase tracking-widest">
                          Anda
                        </span>
                      ) : (
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handlePaySalaryClick(u)}
                            className="px-2 py-1.5 md:p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] md:text-xs text-emerald-500 hover:bg-emerald-100 active:scale-95 transition-all"
                            title="Bayar Gaji"
                          >
                            💰
                          </button>
                          <button
                            onClick={() => handleEdit(u)}
                            className="px-2 py-1.5 md:p-2 bg-blue-50 border border-blue-100 rounded-lg text-[10px] md:text-xs text-blue-500 hover:bg-blue-100 active:scale-95 transition-all"
                            title="Edit Akun"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.role)}
                            className="px-2 py-1.5 md:p-2 bg-rose-50 border border-rose-100 rounded-lg text-[10px] md:text-xs text-rose-500 hover:bg-rose-100 active:scale-95 transition-all"
                            title="Hapus Akun"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <div className="text-slate-300 font-bold text-[10px] md:text-xs uppercase italic tracking-widest">
                      User Tidak Ditemukan
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditData(null);
        }}
        currentUser={currentUser}
        editData={editData}
        onSuccess={fetchUsers}
        formatRupiah={formatRupiah}
      />

      <SalaryPaymentModal
        isOpen={showSalaryModal}
        onClose={() => setShowSalaryModal(false)}
        user={selectedUserForSalary}
        rekeningList={rekeningList}
        onSubmit={handleSalarySubmit}
      />
    </div>
  );
};

export default UserManagement;
