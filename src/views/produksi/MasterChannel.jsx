import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchGlobalData } from "../../store/slices/dataSlice";
import axiosInstance from "../../utils/axios";

// TERIMA PROPS DARI App.jsx
const MasterChannel = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const channels = useSelector((state) => state.data.channels);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    nama_channel: "",
    tipe: "",
    no_hp: "",
    email: "",
    alamat: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_channel) return;
    if (!form.tipe)
      return window.showToast("Pilih kategori channel!", "warning");

    setIsSubmitting(true);

    try {
      // TEMBAK KE channels.php
      const res = await axiosInstance.post("channels.php?action=add_channel", form);
      const data = res.data;

      if (data.status === "success") {
        setForm({
          nama_channel: "",
          tipe: "",
          no_hp: "",
          email: "",
          alamat: "",
        });
        dispatch(fetchGlobalData()); // Trigger update data di Redux
        setShowModal(false);
        window.showToast("Channel berhasil ditambahkan!", "success");
      } else {
        window.showToast(data.message || "Gagal simpan channel", "error");
      }
    } catch (error) {
      window.showToast("Gagal koneksi ke server!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await window.showConfirm(
      "Hapus channel ini? Semua harga terkait di Price List juga akan terhapus.",
    );
    if (isConfirmed) {
      try {
        // TEMBAK KE channels.php
        await axiosInstance.get(`channels.php?action=delete_channel&id=${id}`);
        dispatch(fetchGlobalData()); // Trigger update data di Redux
        window.showToast("Channel berhasil dihapus!", "success");
      } catch (error) {
        window.showToast("Gagal hapus data!", "error");
      }
    }
  };

  const handleManualSync = async (id) => {
    try {
      const res = await axiosInstance.get(
        `channels.php?action=sync_one_channel&id=${id}`
      );
      const data = res.data;
      if (data.status === "success") {
        window.showToast("Antrean sinkronisasi dikirim!", "success");
      } else {
        window.showToast(data.message, "error");
      }
    } catch (e) {
      window.showToast("Gagal kirim permintaan sync", "error");
    }
  };

  // Logic Filter Search
  const filteredChannels = useMemo(() => {
    return channels.filter(
      (c) =>
        c.nama_channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tipe.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [channels, searchTerm]);

  return (
    <div className="p-1 md:p-2 animate-in fade-in duration-500 h-full flex flex-col min-h-0 text-slate-900">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-end items-start md:items-end mb-4 md:mb-6 gap-3 shrink-0">
        {/* <div>
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
            Master Channel
          </h2>
          <p className="font-bold text-[9px] md:text-[10px] tracking-[0.3em] uppercase mt-1.5 md:mt-2 text-blue-600">
            Daftar Marketplace & Reseller Tetap
          </p>
        </div> */}

        {/* INPUT SEARCH BAR */}
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80 group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
              🔍
            </div>
            <input
              type="text"
              placeholder="Cari nama atau tipe channel..."
              className="w-full bg-white border border-slate-100 p-3 pl-12 rounded-xl font-bold text-xs outline-none focus:border-blue-500 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-slate-900 text-white px-4 md:px-6 py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all whitespace-nowrap hover:bg-blue-600 shrink-0"
          >
            + Tambah
          </button>
        </div>
      </div>

      {/* LIST DATA */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-0 overflow-hidden">
        <div className="overflow-auto custom-scrollbar flex-1 p-2 md:p-4 pt-0">
          <table className="w-full min-w-[500px] text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="text-slate-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                <th className="py-2 px-2 md:p-3">Nama Channel</th>
                <th className="py-2 px-2 md:p-3 text-center">Tipe</th>
                <th className="py-2 px-2 md:p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredChannels.length > 0 ? (
                filteredChannels.map((c) => (
                  <tr
                    key={c.id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-2 md:p-3 bg-slate-50 rounded-l-xl border-y border-l border-slate-100">
                      <div className="font-black text-slate-800 uppercase italic tracking-tighter text-[10px] md:text-sm">
                        {c.nama_channel}
                      </div>
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-center">
                      <span
                        className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest border ${c.tipe === "Marketplace"
                            ? "bg-orange-50 text-orange-600 border-orange-100"
                            : c.tipe === "Reseller"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          }`}
                      >
                        {c.tipe}
                      </span>
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleManualSync(c.id)}
                        className="px-2 py-1.5 md:p-2 bg-purple-50 border border-purple-100 rounded-lg text-[10px] md:text-xs text-purple-600 hover:bg-purple-100 active:scale-95 transition-all mr-1 md:mr-2 font-bold"
                        title="Sync Ulang ke Google Sheets"
                      >
                        🔄
                      </button>
                      {c.tipe === "Reseller" && (
                        <button
                          onClick={() => navigate("/finance/deposit-reseller")}
                          className="px-2 py-1.5 md:p-2 bg-blue-50 border border-blue-100 rounded-lg text-[10px] md:text-xs text-blue-600 hover:bg-blue-100 active:scale-95 transition-all mr-1 md:mr-2 font-bold"
                          title="Kelola Deposit Reseller"
                        >
                          💰{" "}
                          <span className="hidden md:inline text-[9px] uppercase tracking-widest">
                            Deposit
                          </span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="px-2 py-1.5 md:p-2 bg-rose-50 border border-rose-100 rounded-lg text-[10px] md:text-xs text-rose-500 hover:bg-rose-100 active:scale-95 transition-all"
                        title="Hapus Channel"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-10 text-center">
                    <div className="text-slate-300 font-bold text-[10px] md:text-xs uppercase italic tracking-widest">
                      Channel Tidak Ditemukan
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH CHANNEL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 custom-scrollbar max-h-[95vh] overflow-y-auto">
            <div className="p-5 md:p-8">
              <h3 className="font-black uppercase italic text-sm md:text-base mb-4 md:mb-6 border-b border-slate-100 pb-3 md:pb-4 text-slate-800">
                Tambah Channel Baru
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
                      Nama Marketplace / Reseller
                    </label>
                    <input
                      type="text"
                      placeholder="Misal: Shopee Mall / Andi"
                      className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm outline-none border border-slate-100 focus:border-blue-500 transition-all shadow-sm"
                      value={form.nama_channel}
                      onChange={(e) =>
                        setForm({ ...form, nama_channel: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
                      Kategori Channel
                    </label>
                    <select
                      className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm outline-none border border-slate-100 focus:border-blue-500 transition-all cursor-pointer shadow-sm text-slate-800"
                      value={form.tipe}
                      onChange={(e) =>
                        setForm({ ...form, tipe: e.target.value })
                      }
                    >
                      <option value="">-- Pilih Kategori --</option>
                      <option value="Reseller">Reseller (Personal)</option>
                      <option value="Marketplace">
                        Marketplace (Shopee/TikTok/Lazada)
                      </option>
                      <option value="Toko">Toko Offline / Cabang</option>
                    </select>
                  </div>
                </div>

                {form.tipe === "Reseller" && (
                  <div className="flex flex-col gap-4 md:gap-6 pt-2 md:pt-4 border-t border-slate-100 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
                          Nomor HP / WhatsApp
                        </label>
                        <input
                          type="text"
                          placeholder="08..."
                          className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm outline-none border border-slate-100 focus:border-blue-500 transition-all shadow-sm"
                          value={form.no_hp}
                          onChange={(e) =>
                            setForm({ ...form, no_hp: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
                          Email (Opsional)
                        </label>
                        <input
                          type="email"
                          placeholder="email@reseller.com"
                          className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm outline-none border border-slate-100 focus:border-blue-500 transition-all shadow-sm"
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 block ml-1 tracking-widest">
                        Alamat Lengkap
                      </label>
                      <textarea
                        className="w-full bg-slate-50 p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm outline-none border border-slate-100 focus:border-blue-500 transition-all min-h-[56px] resize-none shadow-sm"
                        placeholder="Alamat Reseller..."
                        value={form.alamat}
                        onChange={(e) =>
                          setForm({ ...form, alamat: e.target.value })
                        }
                      ></textarea>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 md:gap-4 pt-4 md:pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 py-3 md:py-4 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest active:scale-95 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-[2] text-white py-3 md:py-4 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-md transition-all ${isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-blue-600 active:scale-95"}`}
                  >
                    {isSubmitting ? "Menyimpan..." : "Daftarkan Channel"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterChannel;
