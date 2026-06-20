import { useState, useEffect } from "react";
import JsBarcode from "jsbarcode";
import Barcode from "react-barcode";
import { useSelector, useDispatch } from "react-redux";
import { fetchGlobalData } from "../../store/slices/dataSlice";
import axiosInstance from "../../utils/axios";

const MasterStore = () => {
  const dispatch = useDispatch();
  const stores = useSelector((state) => state.data.stores);
  const channels = useSelector((state) => state.data.channels);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: null,
    nama_store: "",
    kode_store: "",
    channel_id: "",
  });
  const [loading, setLoading] = useState(false);

  const generateKodeToko = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let random = "";
    for (let i = 0; i < 5; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return "TKTR" + random;
  };

  const handleOpenModal = (store = null) => {
    if (store) {
      setForm({
        id: store.id,
        nama_store: store.nama_store,
        kode_store: store.kode_store,
        channel_id: store.channel_id || "",
      });
    } else {
      setForm({
        id: null,
        nama_store: "",
        kode_store: generateKodeToko(),
        channel_id: "",
      });
    }
    setShowModal(true);
  };

  useEffect(() => {
    if (showModal && form.kode_store) {
      try {
        JsBarcode("#barcode-preview", form.kode_store, {
          format: "CODE128",
          width: 2,
          height: 60,
          displayValue: false, // Text kita tampilin manual di bawahnya biar rapi
        });
      } catch (error) { }
    }
  }, [showModal, form.kode_store]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_store)
      return window.showToast("Nama Toko wajib diisi!", "warning");

    setLoading(true);
    const action = form.id ? "update_store" : "create_store";
    const payload = { ...form };

    try {
      const res = await axiosInstance.post(`pos.php?action=${action}`, payload);
      const data = res.data;
      if (data.status === "success") {
        window.showToast(
          `Toko berhasil ${form.id ? "diperbarui" : "dibuat"}!`,
          "success",
        );
        setShowModal(false);
        dispatch(fetchGlobalData());
      } else {
        window.showToast(data.message || "Gagal menyimpan data!", "error");
      }
    } catch (error) {
      window.showToast("Gagal koneksi ke server!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await window.showConfirm("Yakin mau hapus toko ini?");
    if (isConfirmed) {
      try {
        await axiosInstance.get(`pos.php?action=delete_store&id=${id}`);
        window.showToast("Toko berhasil dihapus!", "success");
        dispatch(fetchGlobalData());
      } catch (e) {
        window.showToast("Gagal menghapus toko!", "error");
      }
    }
  };

  const handleManualSync = async (id) => {
    try {
      const res = await axiosInstance.get(
        `pos.php?action=sync_one_store&id=${id}`
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

  const printBarcode = (kode) => {
    if (!kode) return window.showToast("Kode toko kosong!", "warning");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    try {
      JsBarcode(svg, kode, {
        format: "CODE128",
        width: 4,
        height: 150,
        displayValue: true,
        fontSize: 40,
        fontOptions: "bold",
        margin: 20,
      });
      const svgData = new XMLSerializer().serializeToString(svg);
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcode - ${kode}</title>
            <style>
              @media print { @page { size: auto; margin: 0; } body { margin: 0; } }
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: white;}
            </style>
          </head>
          <body>
            ${svgData}
            <script>
              window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      window.showToast("Gagal print barcode!", "error");
    }
  };

  return (
    <div className="p-1 md:p-2 animate-in fade-in duration-500 h-full flex flex-col min-h-0 text-slate-900">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-end items-start md:items-end mb-2 md:mb-4 gap-2 shrink-0">
        {/* <div>
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
            Master <span className="text-blue-600">Store</span>
          </h2>
          <p className="font-bold text-[9px] md:text-[10px] tracking-[0.3em] uppercase mt-1.5 md:mt-2 text-blue-600">
            Manajemen Toko Marketplace
          </p>
        </div> */}
        <button
          onClick={() => handleOpenModal()}
          className="bg-slate-900 text-white px-2 md:px-4 py-2 rounded-xl font-black uppercase text-[8px] md:text-[9px] tracking-widest hover:bg-blue-600 transition-all shadow-md active:scale-95 shrink-0 whitespace-nowrap"
        >
          + Tambah Toko Baru
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-0 overflow-hidden">
        <div className="overflow-auto custom-scrollbar flex-1 p-1 md:p-4 pt-0">
          <table className="w-full min-w-0 text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="text-slate-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                <th className="py-1 px-1 md:p-2">Info Toko</th>
                <th className="py-1 px-1 md:p-2 text-center">Barcode</th>
                <th className="py-1 px-1 md:p-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr
                  key={store.id}
                  className="group hover:bg-slate-50 transition-colors"
                >
                  <td className="p-1 md:p-2 bg-slate-50 rounded-l-xl border-y border-l border-slate-100 max-w-[130px] md:max-w-none truncate">
                    <div className="font-black text-slate-800 uppercase italic tracking-tighter text-[10px] md:text-sm truncate">
                      {store.nama_store}
                    </div>
                    <div className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase mt-0.5 truncate">
                      CH:{" "}
                      <span className="text-blue-600">
                        {store.nama_mp || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="p-1 md:p-2 bg-slate-50 border-y border-slate-100 text-center">
                    <div className="bg-white inline-block px-1 md:px-2 py-1 rounded-lg border border-slate-200 overflow-hidden shadow-sm scale-75 md:scale-100 origin-center">
                      <Barcode
                        value={store.kode_store}
                        width={1}
                        height={25}
                        fontSize={10}
                        displayValue={true}
                        margin={0}
                        background="transparent"
                      />
                    </div>
                  </td>
                  <td className="p-1 md:p-2 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-center w-[60px] md:w-auto">
                    <div className="flex flex-col md:flex-row justify-center gap-1 md:gap-1.5">
                      <button
                        onClick={() => handleManualSync(store.id)}
                        className="px-1 py-1.5 md:p-1 bg-purple-50 border border-purple-100 rounded-lg text-[10px] md:text-xs text-purple-600 hover:bg-purple-100 active:scale-95 transition-all w-full md:w-auto"
                        title="Sync Ulang ke Google Sheets"
                      >
                        🔄
                      </button>
                      <button
                        onClick={() => printBarcode(store.kode_store)}
                        className="px-1 py-1.5 md:p-1 bg-white border border-slate-200 rounded-lg text-[10px] md:text-xs hover:bg-slate-50 active:scale-95 transition-all w-full md:w-auto"
                        title="Cetak Barcode Toko"
                      >
                        🖨️
                      </button>
                      <button
                        onClick={() => handleOpenModal(store)}
                        className="px-1 py-1.5 md:p-1 bg-white border border-slate-200 rounded-lg text-[10px] md:text-xs hover:bg-slate-50 active:scale-95 transition-all w-full md:w-auto"
                        title="Edit Toko"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(store.id)}
                        className="px-1 py-1.5 md:p-1 bg-rose-50 border border-rose-100 rounded-lg text-[10px] md:text-xs text-rose-500 hover:bg-rose-100 active:scale-95 transition-all w-full md:w-auto"
                        title="Hapus Toko"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-10 text-center">
                    <div className="text-slate-300 font-bold text-[10px] md:text-xs uppercase italic tracking-widest">
                      Belum ada toko
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-slate-900 max-h-[95vh]">
            {/* HEADER */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 text-center shrink-0">
              <h3 className="font-black uppercase italic text-lg text-slate-800 tracking-widest">
                {form.id ? "Edit Toko" : "Tambah Toko Baru"}
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase">
                Informasi Store & Barcode
              </p>
            </div>

            {/* BODY / FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                  Nama Toko
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Misal: Store SBY"
                  className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg font-bold text-sm text-slate-800 outline-none focus:border-blue-500 shadow-sm transition-all"
                  value={form.nama_store}
                  onChange={(e) =>
                    setForm({ ...form, nama_store: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                  Hubungkan ke Channel Marketplace
                </label>
                <select
                  className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg font-bold text-sm text-slate-800 outline-none focus:border-blue-500 shadow-sm transition-all cursor-pointer"
                  value={form.channel_id}
                  onChange={(e) =>
                    setForm({ ...form, channel_id: e.target.value })
                  }
                >
                  <option value="">-- Tidak terhubung --</option>
                  {channels
                    .filter((c) => c.tipe === "Marketplace")
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama_channel}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-span-full flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                  Barcode & Kode Toko
                </label>
                <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row items-center justify-center gap-4 shadow-inner">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Otomatis jika dikosongkan"
                      className="w-full bg-white border border-slate-200 py-2 px-3 rounded-lg font-black text-sm text-center md:text-left outline-none focus:border-blue-500 text-blue-600 tracking-widest shadow-sm transition-all"
                      value={form.kode_store}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          kode_store: e.target.value
                            .toUpperCase()
                            .replace(/\s/g, ""),
                        })
                      }
                    />
                    <p className="text-[9px] text-slate-400 mt-2 text-center md:text-left font-bold tracking-widest leading-relaxed">
                      Ketik manual untuk custom kode, atau kosongkan saat
                      membuat toko baru agar digenerate otomatis.
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm shrink-0 flex items-center justify-center min-w-[150px] min-h-[60px]">
                    <svg
                      id="barcode-preview"
                      className="max-h-[60px] max-w-full"
                    ></svg>
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="col-span-full flex justify-end gap-3 mt-2 md:mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "MEMPROSES..." : "SIMPAN TOKO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterStore;
