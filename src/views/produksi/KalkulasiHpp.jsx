import { useState, useEffect, useCallback } from "react";
import HppForm from "../../components/HppForm"; // IMPORT FILE BARU TADI
import axiosInstance from "../../utils/axios";

const KalkulasiHpp = ({ items, refreshData }) => {
  const [view, setView] = useState("list"); // "list" atau "form"
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/hpp.php?action=read_history");
      const data = res.data;
      setHistory(Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []));
    } catch (e) {
      console.error("Error history:", e);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSave = async (formData, hppFinal) => {
    const parseToNumber = (v, key) => {
      if (v === null || v === undefined || v === "") return 0;
      const str = String(v);
      // Jika field berupa Qty/Jumlah, biarkan titik sebagai desimal
      if (["qty_bahan", "qty_produksi"].includes(key)) {
        return parseFloat(str.replace(/[^0-9.-]/g, "")) || 0;
      }
      // Jika field berupa Harga/Uang, hapus "Rp", titik ribuan, dan ubah koma jadi desimal
      return (
        parseFloat(
          str.replace(/Rp/gi, "").replace(/\./g, "").replace(/,/g, ".").trim(),
        ) || 0
      );
    };

    const dataKirim = {};
    Object.keys(formData).forEach((k) => {
      dataKirim[k] = [
        "inventory_ids",
        "no_po",
        "customer",
        "no_hp_supplier",
        "inventory_id",
        "nama_bahan",
        "model",
        "supplier_jahit",
        "no_hp_jahit",
        "supplier_finish",
        "no_hp_finish",
        "supplier_laundry",
        "no_hp_laundry",
        "allocations",
      ].includes(k)
        ? formData[k]
        : parseToNumber(formData[k], k);
    });

    try {
      const res = await axiosInstance.post("/hpp.php?action=save_hpp", {
        ...dataKirim,
        hpp_final: hppFinal,
        edit_id: selectedItem?.id,
      });
      const data = res.data;

      if (data.status === "success") {
        window.showToast("Berhasil disimpan!", "success");
        setView("list");
        fetchHistory();
        // Tidak memanggil refreshData() — HPP save tidak mengubah master data
      } else {
        window.showToast(data.message || "Gagal menyimpan kalkulasi!", "error");
      }
    } catch (err) {
      window.showToast("Gagal koneksi server!", "error");
    }
  };

  const formatIDR = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);

  // LOGIC TAMPILAN
  if (view === "form") {
    return (
      <HppForm
        items={items}
        initialData={selectedItem}
        onCancel={() => setView("list")}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500 flex flex-col h-full min-h-0 text-slate-900">
      <div className="flex flex-col md:flex-row justify-end items-start md:items-end mb-4 md:mb-6 gap-3 shrink-0">
        {/* <div>
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
            Database HPP
          </h2>
          <p className="font-bold text-[9px] md:text-[10px] tracking-[0.3em] uppercase mt-1.5 md:mt-2 text-blue-600">
            Master Production Cost
          </p>
        </div> */}
        <button
          onClick={() => {
            setSelectedItem(null);
            setView("form");
          }}
          className="bg-slate-900 text-white px-4 md:px-6 py-3 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-rose-500 transition-all shadow-md active:scale-95 shrink-0 whitespace-nowrap"
        >
          + Kalkulasi Baru
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-0 overflow-hidden">
        <div className="overflow-auto custom-scrollbar flex-1 p-2 md:p-4 pt-0">
          <table className="w-full min-w-[700px] text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="text-slate-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                <th className="py-2 px-2 md:p-3">Tanggal</th>
                <th className="py-2 px-2 md:p-3">No. PO / Produk</th>
                <th className="py-2 px-2 md:p-3 text-center">Qty</th>
                <th className="py-2 px-2 md:p-3 whitespace-nowrap">
                  HPP Final
                </th>
                <th className="py-2 px-2 md:p-3 text-center">Status PO</th>
                <th className="py-2 px-2 md:p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(history || []).map((h) => (
                <tr
                  key={h.id}
                  className="group hover:bg-slate-50 transition-colors"
                >
                  <td className="p-2 md:p-3 bg-slate-50 rounded-l-xl border-y border-l border-slate-100 text-[9px] md:text-[10px] font-bold text-slate-500 whitespace-nowrap">
                    {new Date(h.tanggal_hitung).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100">
                    <div className="text-[10px] md:text-xs font-black text-slate-800 uppercase italic tracking-tight">
                      {h.no_po}
                    </div>
                    <div className="text-[8px] md:text-[9px] font-bold text-blue-500 uppercase mt-0.5">
                      {(h.nama_barang || "").length > 50
                        ? (h.nama_barang || "").substring(0, 50) + "..."
                        : h.nama_barang || "-"}
                    </div>
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-center whitespace-nowrap">
                    <span className="bg-white border border-slate-200 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-full text-[8px] md:text-[10px] font-black text-slate-600">
                      {h.qty_inbound_aktual || 0} / {h.qty_produksi} Pcs
                    </span>
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 font-black text-emerald-600 text-[10px] md:text-xs whitespace-nowrap">
                    {formatIDR(h.hpp_final_pcs)}
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-center">
                    <span
                      className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest inline-block whitespace-nowrap border shadow-sm ${h.status_po_aktual === "Selesai"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : h.status_po_aktual === "Proses"
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                    >
                      {h.status_po_aktual === "Selesai"
                        ? "✓ "
                        : h.status_po_aktual === "Proses"
                          ? "⏳ "
                          : "⏱ "}
                      {h.status_po_aktual}
                    </span>
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-center space-x-1 whitespace-nowrap w-[120px] md:w-auto">
                    {/* Tombol Re-PO HANYA muncul kalau Inbound sudah selesai (>= Qty Produksi) */}
                    {h.status_po_aktual === "Selesai" && (
                      <button
                        onClick={() => {
                          // Prepare data for a new HPP entry based on existing one
                          const reformat = {
                            // Crucially, set id to null for a new entry
                            id: null,
                            // Clear no_po to trigger auto-generation in backend
                            no_po: "",
                            customer: h.customer,
                            nama_bahan: h.nama_bahan,
                            model: h.model, // Assuming model is derived from nama_barang or similar
                            harga_bahan:
                              "Rp " +
                              new Intl.NumberFormat("id-ID").format(
                                h.harga_bahan || 0,
                              ),
                            qty_bahan: parseFloat(h.qty_bahan || 0).toString(),
                            qty_produksi: h.qty_produksi,
                            biaya_potong_total:
                              "Rp " +
                              new Intl.NumberFormat("id-ID").format(
                                h.biaya_potong_total || 0,
                              ),
                            biaya_jahit:
                              "Rp " +
                              new Intl.NumberFormat("id-ID").format(
                                h.biaya_jahit || 0,
                              ),
                            biaya_finishing_pcs:
                              "Rp " +
                              new Intl.NumberFormat("id-ID").format(
                                h.biaya_finishing || 0,
                              ),
                            biaya_laundry:
                              "Rp " +
                              new Intl.NumberFormat("id-ID").format(
                                h.biaya_laundry || 0,
                              ),
                            sleting_pcs:
                              "Rp " +
                              new Intl.NumberFormat("id-ID").format(
                                h.sleting || 0,
                              ),
                            puring:
                              "Rp " +
                              new Intl.NumberFormat("id-ID").format(
                                h.puring || 0,
                              ),
                            plastik:
                              "Rp " +
                              new Intl.NumberFormat("id-ID").format(
                                h.plastik || 0,
                              ),
                            kancing:
                              "Rp " +
                              new Intl.NumberFormat("id-ID").format(
                                h.kancing || 0,
                              ),
                            label:
                              "Rp " +
                              new Intl.NumberFormat("id-ID").format(
                                h.label || 0,
                              ),
                            kertas:
                              "Rp " +
                              new Intl.NumberFormat("id-ID").format(
                                h.kertas || 0,
                              ),
                            kertas_thermal:
                              "Rp " +
                              new Intl.NumberFormat("id-ID").format(
                                h.kertas_thermal || 0,
                              ),
                            plastik_packing:
                              "Rp " +
                              new Intl.NumberFormat("id-ID").format(
                                h.plastik_packing || 0,
                              ),
                            inventory_ids: (h.inventory_ids || "")
                              .split(",")
                              .filter(Boolean)
                              .map((id) => parseInt(id)), // Ensure IDs are numbers
                          };
                          setSelectedItem(reformat);
                          setView("form");
                        }}
                        className="px-2 py-1.5 md:p-2 bg-blue-50 border border-blue-100 rounded-lg text-[10px] md:text-xs text-blue-600 hover:bg-blue-100 active:scale-95 transition-all"
                        title="Duplikasi HPP (Re-PO)"
                      >
                        🔄 Re-PO
                      </button>
                    )}
                    {/* Tombol Edit HANYA muncul kalau status_po_aktual masih Pending */}
                    {h.status_po_aktual === "Pending" && (
                      <button
                        onClick={() => {
                          // Re-masking biar di form muncul Rp nya lagi
                          const reformat = {
                            ...h,
                            qty_produksi: h.qty_produksi,
                            biaya_finishing_pcs: h.biaya_finishing,
                            sleting_pcs: h.sleting,
                            inventory_ids: (h.inventory_ids || "")
                              .split(",")
                              .filter(Boolean)
                              .map((id) => parseInt(id)), // Ensure IDs are numbers
                            qty_bahan: parseFloat(h.qty_bahan || 0).toString(),
                          };
                          [
                            "harga_bahan",
                            "biaya_potong_total",
                            "biaya_jahit",
                            "biaya_finishing_pcs",
                            "biaya_laundry",
                            "sleting_pcs",
                            "puring",
                            "plastik",
                            "kancing",
                            "label",
                            "kertas",
                            "kertas_thermal",
                            "plastik_packing",
                          ].forEach(
                            (key) =>
                            (reformat[key] =
                              "Rp " +
                              new Intl.NumberFormat("id-ID").format(
                                reformat[key] || 0,
                              )),
                          );
                          setSelectedItem(reformat);
                          setView("form");
                        }}
                        className="px-2 py-1.5 md:p-2 bg-white border border-slate-200 rounded-lg text-[10px] md:text-xs hover:bg-slate-50 active:scale-95 transition-all"
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KalkulasiHpp;
