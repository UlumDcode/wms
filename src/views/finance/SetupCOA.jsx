import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import CoaGuide from "../../components/finance/coa/CoaGuide";

const SetupCOA = () => {
  const [coas, setCoas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    id: "",
    kode_akun: "",
    nama_akun: "",
    tipe_akun: "Asset",
    saldo_normal: "Debit",
  });

  const fetchCoas = async () => {
    try {
      const res = await axiosInstance.get("finance/coa.php?action=read");
      const json = res.data;
      setCoas(json.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCoas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const action = form.id ? "update" : "create";
      const res = await axiosInstance.post(`finance/coa.php?action=${action}`, form);
      const data = res.data;

      if (data.status === "success") {
        window.showToast(
          form.id ? "Berhasil update COA" : "Berhasil menyimpan COA",
          "success",
        );
        setForm({
          id: "",
          kode_akun: "",
          nama_akun: "",
          tipe_akun: form.tipe_akun,
          saldo_normal: form.saldo_normal,
        });
        fetchCoas();
        setShowModal(false);
      } else {
        window.showToast(data.message || "Gagal menyimpan", "error");
      }
    } catch (e) {
      window.showToast("Terjadi kesalahan sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coa) => {
    setForm({
      id: coa.id,
      kode_akun: coa.kode_akun,
      nama_akun: coa.nama_akun,
      tipe_akun: coa.tipe_akun,
      saldo_normal: coa.saldo_normal,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus COA ini?")) return;
    try {
      const res = await axiosInstance.get(`finance/coa.php?action=delete&id=${id}`);
      const data = res.data;
      if (data.status === "success") {
        window.showToast("COA terhapus", "success");
        fetchCoas();
      } else {
        window.showToast(data.message, "error");
      }
    } catch (e) {
      window.showToast("Gagal hapus", "error");
    }
  };

  const filteredCoas = coas.filter(
    (coa) =>
      (coa.kode_akun || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coa.nama_akun || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coa.tipe_akun || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500 h-full flex flex-col min-h-0 text-slate-900">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 md:mb-6 gap-3 shrink-0">
        {/* <div>
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
            Setup <span className="text-blue-600">COA</span>
          </h2>
          <p className="font-bold text-[9px] md:text-[10px] tracking-[0.3em] uppercase mt-1.5 md:mt-2 text-blue-500">
            Manajemen Chart of Accounts
          </p>
        </div> */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
          <div className="relative w-full md:w-72 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity">
              🔍
            </div>
            <input
              type="text"
              placeholder="Cari Kode, Nama, atau Tipe..."
              className="w-full bg-white border border-slate-100 p-2.5 md:p-3 pl-10 md:pl-11 rounded-xl font-bold text-xs outline-none focus:border-blue-500 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* PANDUAN COA (KECIL DI SEBELAH SEARCH) */}
          <CoaGuide />
          <button
            onClick={() => {
              setForm({
                id: "",
                kode_akun: "",
                nama_akun: "",
                tipe_akun: "Asset",
                saldo_normal: "Debit",
              });
              setShowModal(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 md:py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all whitespace-nowrap"
          >
            + TAMBAH
          </button>
        </div>
      </div>

      {/* LIST TABLE COA - FULL WIDTH */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col flex-1 min-h-[400px] overflow-hidden">
        <div className="overflow-auto custom-scrollbar flex-1 p-2 md:p-4 pt-0">
          <table className="w-full min-w-[500px] md:min-w-[600px] text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
                <th className="py-2 px-2 md:p-3">Kode Akun</th>
                <th className="py-2 px-2 md:p-3">Nama Akun</th>
                <th className="py-2 px-2 md:p-3 text-center">Tipe</th>
                <th className="py-2 px-2 md:p-3 text-center">Saldo</th>
                <th className="py-2 px-2 md:p-3 text-center min-w-[70px]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCoas.map((coa) => (
                <tr
                  key={coa.id}
                  className="group hover:bg-slate-50 transition-colors"
                >
                  <td className="p-2 md:p-3 bg-slate-50 rounded-l-xl border-y border-l border-slate-100 font-black text-slate-800 text-[10px] md:text-sm whitespace-nowrap">
                    {coa.kode_akun}
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 font-bold text-[9px] md:text-xs text-slate-700">
                    <div>{coa.nama_akun}</div>
                    {coa.linked_rekening && (
                      <div className="mt-1">
                        <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[7px] md:text-[8px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                          Rekening: {coa.linked_rekening}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-center w-[60px] md:w-auto">
                    <span className="px-1.5 py-1 md:px-2.5 md:py-1 rounded-md text-[6px] md:text-[9px] font-black uppercase tracking-widest border bg-slate-100 text-slate-600 border-slate-200 whitespace-nowrap inline-block">
                      {coa.tipe_akun}
                    </span>
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-center text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {coa.saldo_normal}
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-center w-[80px] md:w-auto whitespace-nowrap">
                    <div className="flex justify-center gap-1 md:gap-1.5">
                      <button
                        onClick={() => handleEdit(coa)}
                        className="px-1.5 py-1 md:px-2.5 md:py-1.5 bg-blue-50 border border-blue-100 rounded-md text-[10px] md:text-xs text-blue-500 hover:bg-blue-100 active:scale-95 transition-all"
                        title="Edit COA"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(coa.id)}
                        className="px-1.5 py-1 md:px-2.5 md:py-1.5 bg-rose-50 border border-rose-100 rounded-md text-[10px] md:text-xs text-rose-500 hover:bg-rose-100 active:scale-95 transition-all"
                        title="Hapus COA"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCoas.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="text-slate-300 font-bold text-[9px] md:text-[10px] uppercase italic tracking-widest">
                      {coas.length === 0
                        ? "BELUM ADA DATA COA"
                        : "DATA TIDAK DITEMUKAN"}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md animate-in zoom-in-95 duration-300">
            <h3 className="font-black uppercase italic text-sm md:text-base mb-4 border-b border-slate-100 pb-3 text-slate-800">
              {form.id ? "Edit Akun COA" : "Tambah Akun Baru"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Kode Akun
                </label>
                <input
                  type="text"
                  value={form.kode_akun}
                  onChange={(e) =>
                    setForm({ ...form, kode_akun: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all mb-4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Nama Akun
                </label>
                <input
                  type="text"
                  value={form.nama_akun}
                  onChange={(e) =>
                    setForm({ ...form, nama_akun: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all mb-4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Tipe Akun
                </label>
                <select
                  value={form.tipe_akun}
                  onChange={(e) =>
                    setForm({ ...form, tipe_akun: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all mb-4 cursor-pointer"
                >
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Saldo Normal
                </label>
                <select
                  value={form.saldo_normal}
                  onChange={(e) =>
                    setForm({ ...form, saldo_normal: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all mb-4 cursor-pointer"
                >
                  <option value="Debit">Debit</option>
                  <option value="Kredit">Kredit</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 text-slate-500 py-3 md:py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 md:py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? "MEMPROSES..." : "SIMPAN DATA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default SetupCOA;
