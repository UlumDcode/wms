import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import Barcode from "react-barcode";
import JsBarcode from "jsbarcode";
import axiosInstance from "../../utils/axios";
import Pagination from "../../components/Pagination";


// IMPORT MODALS BARU DARI SUBSOLDER COMPONENT
import ModalBarang from "../../components/barang/ModalBarang";
import ModalStok from "../../components/barang/ModalStok";
import ModalKategori from "../../components/barang/ModalKategori";
import FotoBarang from "../../components/FotoBarang";
import ZoomModal from "../../components/ZoomModal";

const Barang = ({ refreshData }) => {
  const [showModal, setShowModal] = useState(false);
  const [showModalStok, setShowModalStok] = useState(false);
  const [kategori, setKategori] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [showKatModal, setShowKatModal] = useState(false);
  const [newKatName, setNewKatName] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);

  // Pagination States
  const [inventoryItems, setInventoryItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalData, setTotalData] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const rekenings = useSelector((state) => state.data.rekening);
  const [form, setForm] = useState(null);
  const [formStok, setFormStok] = useState({
    id: null,
    nama_barang: "",
    qty: "",
    harga_per_pcs: "",
    model: "",
    supplier: "",
    no_hp_supplier: "",
    rekening_id: "",
    nominal_bayar: "",
  });

  const API_URL =
    localStorage.getItem("CUSTOM_API_URL") || import.meta.env.VITE_API_URL;

  const fetchKategori = () => {
    axiosInstance.get("/inventory.php?action=read_kategori")
      .then((res) => setKategori(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Gagal memuat kategori:", err));
  };

  const fetchSuppliers = () => {
    axiosInstance.get("/inventory.php?action=read_suppliers")
      .then((res) => setSuppliers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Gagal memuat supplier:", err));
  };


  // FUNGSI LOAD DATA BARANG (PAGINATED)
  const fetchInventoryItems = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const res = await axiosInstance.get(
        `/inventory.php?action=read_inventory&page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`
      );
      const json = res.data;
      if (json.status === "success") {
        setInventoryItems(json.data || []);
        setTotalData(json.total_data || 0);
      }
    } catch (e) {
      console.error("Gagal load inventory items:", e);
    } finally {
      setIsDataLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchKategori();
    fetchSuppliers();
    fetchInventoryItems();
    // Rekening diambil dari Redux store, tidak perlu fetch independen
  }, [fetchInventoryItems]);


  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  // Debounce logic untuk server-side search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset halaman jika kata kunci pencarian berubah
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const generateAutoKode = (nama) => {
    if (!nama) return "";
    const prefix = nama.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${random}`;
  };

  const handleNamaChange = (e) => {
    const val = e.target.value;
    setForm({
      ...form,
      nama_barang: val,
      kode_barang: form.id
        ? form.kode_barang
        : form.kode_barang === ""
          ? generateAutoKode(val)
          : form.kode_barang,
    });
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setForm({ ...item, foto: null }); // Jangan kirim foto lama
      setPreview(item.foto ? `${API_URL}/uploads/${item.foto}` : null);
    } else {
      setForm({
        id: null,
        kode_barang: "",
        nama_barang: "",
        nama_kategori: "",
        size: "",
        batas_stok_rendah: 20,
        foto: null,
      });
      setPreview(null);
    }
    setShowModal(true);
  };

  const handleOpenModalStok = (item) => {
    setFormStok({
      id: item.id,
      nama_barang: item.nama_barang,
      qty: "",
      harga_per_pcs: "",
      model: "",
      supplier: "",
      no_hp_supplier: "",
      rekening_id: "",
      nominal_bayar: "",
    });
    setShowModalStok(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_barang || !form.kode_barang)
      return window.showToast("Nama & Kode Barang wajib diisi!", "warning");

    setLoading(true);
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === "foto") {
        if (form.foto) formData.append("foto", form.foto);
      } else {
        formData.append(key, form[key] === null ? "" : form[key]);
      }
    });

    const action = form.id ? "update_barang" : "add_barang_baru";

    try {
      const res = await axiosInstance.post(`/inventory.php?action=${action}`, formData, {
        headers: {
          "Content-Type": undefined,
        },
      });
      const data = res.data;

      if (data.status === "success" || data.status === true) {
        window.showToast(
          `Barang berhasil ${form.id ? "diupdate" : "ditambahkan"}!`,
          "success",
        );
        setShowModal(false);
        fetchInventoryItems();
        // Tidak memanggil refreshData() untuk menghemat koneksi DB
      } else {
        window.showToast(data.message || "Gagal menyimpan data!", "error");
      }
    } catch (error) {
      window.showToast("Gagal menyimpan data!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStok = async (e) => {
    e.preventDefault();
    if (!formStok.qty || !formStok.harga_per_pcs || !formStok.supplier)
      return window.showToast("Semua field wajib diisi!", "warning");

    const qty = parseInt(formStok.qty) || 0;
    const harga = parseInt(formStok.harga_per_pcs.replace(/\D/g, "")) || 0;
    const cleanTotal = qty * harga;
    const cleanNominal =
      parseInt(formStok.nominal_bayar.replace(/\D/g, "")) || 0;

    if (cleanNominal > cleanTotal) {
      return window.showToast(
        "Nominal bayar tidak boleh melebihi total tagihan!",
        "warning",
      );
    }

    if (cleanNominal > 0 && !formStok.rekening_id) {
      return window.showToast(
        "Pilih Rekening jika ada uang yang dibayar!",
        "warning",
      );
    }

    const status_pembayaran =
      cleanNominal >= cleanTotal ? "Selesai" : "Pending";

    setLoading(true);
    const payload = {
      ...formStok,
      total_biaya: cleanTotal,
      nominal_dibayar: cleanNominal,
      status_pembayaran: status_pembayaran,
      id_rekening: cleanNominal > 0 ? parseInt(formStok.rekening_id) : 0,
      is_quick_set: true,
    };

    try {
      const res = await axiosInstance.post(
        "/inventory.php?action=update_stok",
        payload
      );
      const data = res.data;
      if (data.status === "success") {
        window.showToast("Stok & Modal berhasil diupdate!", "success");
        setShowModalStok(false);
        fetchInventoryItems();
        // Tidak memanggil refreshData() untuk menghemat koneksi DB
      } else {
        window.showToast(data.message || "Gagal update stok!", "error");
      }
    } catch (error) {
      window.showToast("Gagal koneksi ke server!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await window.showConfirm(
      "Yakin mau hapus barang ini? Semua data transaksi terkait akan hilang!",
    );
    if (isConfirmed) {
      try {
        const res = await axiosInstance.get(
          `/inventory.php?action=delete_barang&id=${id}`
        );
        const data = res.data;
        if (data.status === "success" || data.status === true) {
          window.showToast("Barang berhasil dihapus!", "success");
          fetchInventoryItems();
          // Tidak memanggil refreshData() untuk menghemat koneksi DB
        } else {
          window.showToast(data.message || "Gagal menghapus barang!", "error");
        }
      } catch (e) {
        window.showToast("Gagal koneksi ke server!", "error");
      }
    }
  };

  const handleManualSync = async (id) => {
    try {
      const res = await axiosInstance.get(
        `/inventory.php?action=sync_one_barang&id=${id}`
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

  const formatRupiah = (val) => {
    if (!val) return "";
    let strVal = val.toString();
    if (!strVal.includes("Rp") && strVal.includes(".")) {
      strVal = strVal.split(".")[0];
    }
    const clean = strVal.replace(/\D/g, "");
    if (!clean) return "";
    return "Rp " + new Intl.NumberFormat("id-ID").format(clean);
  };

  const handlePrint = (kode) => {
    if (!kode) return window.showToast("Kode barang kosong!", "warning");
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

  const handleSaveKategori = async () => {
    if (!newKatName)
      return window.showToast("Nama kategori harus diisi!", "warning");
    try {
      const res = await axiosInstance.post(
        "/inventory.php?action=add_kategori",
        { nama_kategori: newKatName }
      );
      const data = res.data;
      if (data.status === "success") {
        window.showToast("Kategori baru berhasil ditambah!", "success");
        fetchKategori();
        setForm({ ...form, nama_kategori: data.nama_kategori });
        setShowKatModal(false);
        setNewKatName("");
      } else {
        window.showToast(data.message, "error");
      }
    } catch (e) {
      window.showToast("Server Error!", "error");
    }
  };

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500 h-full flex flex-col min-h-0 text-slate-900">
      {/* FUNCTIONAL HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-3 shrink-0">
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Cari Produk atau Kode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 bg-white border border-slate-200 p-3 rounded-xl font-bold text-xs outline-none focus:border-blue-600 shadow-sm transition-all"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md hover:bg-blue-600 active:scale-95 transition-all shrink-0 whitespace-nowrap"
        >
          + TAMBAH BARANG
        </button>
      </div>

      {/* TABEL DATA BARANG */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-0">
        <div className="overflow-auto custom-scrollbar flex-1 p-2 md:p-4 pt-0 relative">
          {isDataLoading && (
            <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                  Sinkronisasi Data...
                </p>
              </div>
            </div>
          )}
          <table className="w-full min-w-0 text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="text-slate-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                <th className="py-2 px-2 md:p-3">Produk</th>
                <th className="py-2 px-2 md:p-3 text-center">Barcode</th>
                <th className="py-2 px-2 md:p-3">Kategori/Size</th>
                <th className="py-2 px-2 md:p-3 text-center">Stok</th>
                <th className="py-2 px-2 md:p-3 whitespace-nowrap">
                  Harga Modal
                </th>
                <th className="py-2 px-2 md:p-3 text-center">Sync Terakhir</th>
                <th className="py-2 px-2 md:p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => {
                const isStokNipis =
                  parseInt(item.stok || 0) <=
                  parseInt(item.batas_stok_rendah || 0);
                return (
                  <tr
                    key={item.id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-2 md:p-3 bg-slate-50 rounded-l-xl border-y border-l border-slate-100 max-w-[150px] md:max-w-none">
                      <div className="flex items-center gap-3">
                        <FotoBarang
                          foto={item.foto}
                          apiUrl={API_URL}
                          containerClass="w-10 h-10 bg-white rounded-lg border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden relative shadow-sm"
                          iconClass="text-sm opacity-30"
                          onClick={() => setZoomedImage(item.foto ? `${API_URL}/uploads/${item.foto}` : "no-image")}
                        />
                        <div className="overflow-hidden">
                          <div className="font-black text-slate-800 uppercase italic tracking-tighter text-[10px] md:text-sm truncate">
                            {item.nama_barang}
                          </div>
                          <div className="text-[9px] md:text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5 truncate">
                            {item.kode_barang}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-center w-[80px] md:w-auto">
                      <div className="flex justify-center">
                        <div className="bg-white p-1 md:p-1.5 rounded-lg border border-slate-200 shrink-0">
                          <Barcode
                            value={item.kode_barang}
                            width={1}
                            height={25}
                            margin={0}
                            displayValue={false}
                            background="transparent"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 max-w-[120px] md:max-w-none">
                      <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase truncate">
                        {item.nama_kategori || "Uncategorized"}
                      </div>
                      <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mt-0.5 truncate">
                        Size: {item.size || "-"}
                      </div>
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-center w-[50px] md:w-auto">
                      <span
                        className={`inline-block px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black tracking-widest ${isStokNipis
                            ? "bg-rose-100 text-rose-600"
                            : "bg-slate-100 text-slate-600"
                          }`}
                      >
                        {item.stok}
                      </span>
                      {isStokNipis && (
                        <div className="text-[8px] md:text-[9px] text-rose-500 font-bold mt-1 animate-pulse uppercase tracking-widest">
                          Stok Nipis!
                        </div>
                      )}
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-[10px] md:text-xs font-black text-emerald-600 italic whitespace-nowrap">
                      {formatRupiah(item.harga_beli)}
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-center space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleManualSync(item.id)}
                        className="px-2 py-1.5 md:p-2 bg-purple-50 border border-purple-100 rounded-lg text-[10px] md:text-xs text-purple-600 hover:bg-purple-100 active:scale-95 transition-all"
                        title="Sync Ulang ke Google Sheets"
                      >
                        🔄
                      </button>
                      <button
                        onClick={() => handlePrint(item.kode_barang)}
                        className="px-2 py-1.5 md:p-2 bg-blue-50 border border-blue-100 rounded-lg text-[10px] md:text-xs text-blue-600 hover:bg-blue-100 active:scale-95 transition-all"
                        title="Print Barcode"
                      >
                        🖨️
                      </button>
                      <button
                        onClick={() => handleOpenModalStok(item)}
                        className="px-2 py-1.5 md:p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] md:text-xs text-emerald-600 hover:bg-emerald-100 active:scale-95 transition-all"
                        title="Set Modal Cepat / Inbound"
                      >
                        💰
                      </button>
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="px-2 py-1.5 md:p-2 bg-white border border-slate-200 rounded-lg text-[10px] md:text-xs hover:bg-slate-50 active:scale-95 transition-all"
                        title="Edit Barang"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-2 py-1.5 md:p-2 bg-rose-50 border border-rose-100 rounded-lg text-[10px] md:text-xs text-rose-500 hover:bg-rose-100 active:scale-95 transition-all"
                        title="Hapus Barang"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
              {inventoryItems.length === 0 && !isDataLoading && (
                <tr>
                  <td colSpan="7" className="p-10 text-center">
                    <div className="text-slate-300 font-bold text-[10px] md:text-xs uppercase italic tracking-widest">
                      Barang tidak ditemukan
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalData={totalData}
          limit={limit}
          onLimitChange={setLimit}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>

      {/* RENDER MODAL-MODAL YANG SUDAH DIPISAH */}
      <ModalBarang
        showModal={showModal}
        setShowModal={setShowModal}
        form={form}
        setForm={setForm}
        handleSubmit={handleSubmit}
        handleNamaChange={handleNamaChange}
        kategori={kategori}
        setShowKatModal={setShowKatModal}
        preview={preview}
        setPreview={setPreview}
        loading={loading}
      />

      <ModalStok
        showModalStok={showModalStok}
        setShowModalStok={setShowModalStok}
        handleSubmitStok={handleSubmitStok}
        formStok={formStok}
        setFormStok={setFormStok}
        formatRupiah={formatRupiah}
        showSupplierSuggestions={showSupplierSuggestions}
        setShowSupplierSuggestions={setShowSupplierSuggestions}
        suppliers={suppliers}
        rekenings={rekenings}
        loading={loading}
      />

      <ModalKategori
        showKatModal={showKatModal}
        setShowKatModal={setShowKatModal}
        newKatName={newKatName}
        setNewKatName={setNewKatName}
        handleSaveKategori={handleSaveKategori}
      />

      <ZoomModal zoomedImage={zoomedImage} setZoomedImage={setZoomedImage} />
    </div>
  );
};

export default Barang;
