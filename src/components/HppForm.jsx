import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../utils/axios";

const HppForm = ({ items, initialData, onCancel, onSave }) => {
  const [form, setForm] = useState({
    inventory_ids: [],
    nama_bahan: "",
    model: "",
    qty_produksi: "",
  });

  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const rekenings = useSelector((state) => state.data.rekening);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTrx, setActiveTrx] = useState({
    id: null,
    supplier_name: "",
    no_hp: "",
    nominal_bayar: "",
    rekening_id: "",
    items: [
      { id: Date.now(), component_name: "", nominal: "", qty: "1" }
    ]
  });

  const componentOptions = [
    "Kain", "Potong", "Jahit", "Finishing", "Laundry", "Sleting",
    "Puring", "Plastik", "Kancing", "Label", "Kertas",
    "Kertas Thermal", "Plastik Packing", "Lain-lain"
  ];

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axiosInstance.get("/hpp.php?action=get_suppliers");
        if (res.data.status === "success") setSuppliers(res.data.data);
      } catch (e) {
        console.error("Gagal mengambil data supplier:", e);
      }
    };
    fetchSuppliers();
    // Rekening diambil dari Redux store
  }, []);

  useEffect(() => {
    if (initialData) {
      let initAllocations = [];
      if (initialData.allocations_json) {
        try {
          initAllocations = typeof initialData.allocations_json === "string"
            ? JSON.parse(initialData.allocations_json)
            : initialData.allocations_json;
        } catch (e) { }
      }

      setForm({
        inventory_ids: Array.isArray(initialData.inventory_ids)
          ? initialData.inventory_ids.map(Number)
          : initialData.inventory_id ? [Number(initialData.inventory_id)] : [],
        nama_bahan: initialData.nama_bahan || "",
        model: initialData.model || "",
        qty_produksi: initialData.qty_produksi || "",
      });

      if (initAllocations && initAllocations.length > 0) {
        // Group by supplier
        const groups = {};
        initAllocations.forEach(a => {
          const key = a.supplier_name || "Unknown Vendor";
          if (!groups[key]) {
            groups[key] = {
              id: Date.now() + Math.random(),
              supplier_name: a.supplier_name || "",
              no_hp: a.no_hp || "",
              nominal_bayar: "", // DB didn't return DP mapping per vendor in this JSON yet
              rekening_id: "",
              items: []
            };
          }
          groups[key].items.push({
            id: Date.now() + Math.random(),
            component_name: a.component_name || "Lain-lain",
            nominal: a.nominal || "",
            qty: a.qty || "1"
          });
        });
        setTransactions(Object.values(groups));
      }
    }
  }, [initialData]);

  const filteredItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    if (!searchTerm) return safeItems;
    return safeItems.filter(item =>
      (item.nama_barang || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.kode_barang || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const handleCheckboxChange = (id) => {
    setForm(prev => {
      const currentIds = [...prev.inventory_ids];
      if (currentIds.includes(id)) return { ...prev, inventory_ids: currentIds.filter(x => x !== id) };
      return { ...prev, inventory_ids: [...currentIds, id] };
    });
  };

  const parseNum = (val) => {
    if (!val) return 0;
    const str = String(val);
    if (str.includes("Rp")) {
      return parseFloat(str.replace(/Rp/gi, "").replace(/\./g, "").replace(/,/g, ".").trim()) || 0;
    }
    return parseFloat(str) || 0;
  };

  const calc = useMemo(() => {
    let total_cost = 0;
    transactions.forEach(trx => {
      trx.items.forEach(item => {
        const nom = parseNum(item.nominal);
        const qty = parseNum(item.qty) || 1;
        total_cost += (nom * qty);
      });
    });

    const qty_produksi = parseNum(form.qty_produksi) || 1;
    const hpp_pcs = total_cost / qty_produksi;

    return {
      hpp_pcs: Math.round(hpp_pcs),
      hpp_lusin: Math.round(hpp_pcs * 12),
      qty_lusin: qty_produksi / 12,
      total_cost
    };
  }, [form.qty_produksi, transactions]);

  const formatCurrency = (num) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num || 0);

  // Modal Handlers
  const openModal = (trx = null) => {
    if (trx) {
      setActiveTrx(trx);
    } else {
      setActiveTrx({
        id: Date.now(),
        supplier_name: "",
        no_hp: "",
        nominal_bayar: "",
        rekening_id: "",
        items: [{ id: Date.now(), component_name: "", nominal: "", qty: "1" }]
      });
    }
    setIsModalOpen(true);
  };

  const saveModal = () => {
    if (!activeTrx.supplier_name.trim()) {
      return window.showToast("Nama Pihak / Vendor wajib diisi", "warning");
    }
    if (activeTrx.items.length === 0) {
      return window.showToast("Tambahkan minimal 1 komponen transaksi", "warning");
    }

    // Auto format if not yet formatted
    const cleanedItems = activeTrx.items.map(item => ({
      ...item,
      component_name: item.component_name || "Lain-lain"
    }));

    setTransactions(prev => {
      const exists = prev.find(t => t.id === activeTrx.id);
      if (exists) return prev.map(t => t.id === activeTrx.id ? { ...activeTrx, items: cleanedItems } : t);
      return [...prev, { ...activeTrx, items: cleanedItems }];
    });
    setIsModalOpen(false);
  };

  const removeTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id));

  // Handle active trx modifications
  const handleActiveItemChange = (itemId, field, val) => {
    setActiveTrx(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === itemId) {
          if (field === "nominal") {
            const clean = val.replace(/\D/g, "");
            return { ...it, nominal: clean ? "Rp " + new Intl.NumberFormat("id-ID").format(clean) : "" };
          }
          if (field === "qty") {
            const clean = val.replace(/[^0-9.]/g, "");
            const parts = clean.split(".");
            return { ...it, qty: parts[0] + (parts.length > 1 ? "." + parts[1] : "") };
          }
          return { ...it, [field]: val };
        }
        return it;
      })
    }));
  };

  const addActiveItem = () => {
    setActiveTrx(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), component_name: "", nominal: "", qty: "1" }]
    }));
  };
  const removeActiveItem = (itemId) => {
    setActiveTrx(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== itemId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.inventory_ids.length === 0) return window.showToast("Pilih minimal satu produk tujuan master!", "warning");
    if (transactions.length === 0) return window.showToast("Tambahkan minimal satu transaksi pihak/vendor!", "warning");
    if (!form.qty_produksi || parseNum(form.qty_produksi) <= 0) return window.showToast("Isi Hasil Jadi Produksi di kotak HPP Final!", "warning");

    const payloadAllocations = [];
    let mappedData = {
      harga_bahan: 0, qty_bahan: 0, biaya_potong_total: 0, biaya_jahit: 0,
      biaya_finishing_pcs: 0, biaya_laundry: 0, sleting_pcs: 0, puring: 0,
      plastik: 0, kancing: 0, label: 0, kertas: 0, kertas_thermal: 0,
      plastik_packing: 0, customer: "", no_hp_supplier: ""
    };

    transactions.forEach(trx => {
      let remainingDp = parseNum(trx.nominal_bayar);
      const isDpSet = remainingDp > 0 && !!trx.rekening_id;

      trx.items.forEach((item, index) => {
        const nom = parseNum(item.nominal);
        const qty = parseNum(item.qty) || 1;
        const total = nom * qty;
        const comp = item.component_name.toLowerCase();

        if (total > 0) {
          // Distribute DP
          const dpForThisItem = isDpSet ? Math.min(remainingDp, total) : 0;
          remainingDp -= dpForThisItem;

          payloadAllocations.push({
            component_name: item.component_name,
            supplier_name: trx.supplier_name,
            no_hp: trx.no_hp,
            nominal: nom, // HARGA SATUAN (bukan total) agar saat diedit tidak dikali dua
            qty: qty,
            nominal_bayar: dpForThisItem,
            rekening_id: dpForThisItem > 0 ? parseInt(trx.rekening_id) : 0
          });

          // Backward compatibility mapping
          if (comp.includes("kain") && !mappedData.customer) {
            mappedData.customer = trx.supplier_name;
            mappedData.no_hp_supplier = trx.no_hp;
            mappedData.harga_bahan = nom;
            mappedData.qty_bahan = qty;
          } else if (comp.includes("potong")) mappedData.biaya_potong_total += total;
          else if (comp.includes("jahit")) mappedData.biaya_jahit += total;
          else if (comp.includes("finish")) mappedData.biaya_finishing_pcs += total;
          else if (comp.includes("laundry")) mappedData.biaya_laundry += total;
          else if (comp.includes("sleting")) mappedData.sleting_pcs += total;
          else if (comp.includes("puring")) mappedData.puring += total;
          else if (comp.includes("plastik") && !comp.includes("packing")) mappedData.plastik += total;
          else if (comp.includes("kancing")) mappedData.kancing += total;
          else if (comp.includes("label")) mappedData.label += total;
          else if (comp.includes("kertas") && !comp.includes("thermal")) mappedData.kertas += total;
          else if (comp.includes("thermal")) mappedData.kertas_thermal += total;
          else if (comp.includes("packing")) mappedData.plastik_packing += total;
        }
      });

      // If there is overpayment DP left, attach to the last item
      if (remainingDp > 0 && payloadAllocations.length > 0) {
        const lastItem = payloadAllocations[payloadAllocations.length - 1];
        if (lastItem.supplier_name === trx.supplier_name) {
          lastItem.nominal_bayar += remainingDp;
          lastItem.rekening_id = parseInt(trx.rekening_id);
        }
      }
    });

    onSave({
      ...form,
      ...mappedData,
      allocations: payloadAllocations,
      hpp_pcs: calc.hpp_pcs,
    }, calc.hpp_pcs);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-900 dark:text-slate-100 relative">
        <div className="lg:col-span-2 space-y-6">
          {/* INFO PRODUKSI */}
          <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-black italic uppercase text-[11px] text-blue-600 dark:text-blue-400 tracking-widest border-b dark:border-slate-800 pb-2">
              📋 Informasi Produksi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Nama Bahan / Kain</label>
                <input
                  type="text" required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold text-xs outline-none focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100"
                  value={form.nama_bahan}
                  onChange={(e) => setForm(p => ({ ...p, nama_bahan: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">Keterangan Model Pakaian</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold text-xs outline-none focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100"
                  value={form.model}
                  onChange={(e) => setForm(p => ({ ...p, model: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* TRANSAKSI VENDOR LIST */}
          <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
              <h3 className="font-black italic uppercase text-[11px] text-purple-600 dark:text-purple-400 tracking-widest">
                🤝 Transaksi Pihak / Vendor
              </h3>
              <span className="text-[9px] text-slate-400 uppercase font-bold">{transactions.length} Pihak</span>
            </div>

            <div className="space-y-3">
              {transactions.map(trx => {
                const trxTotal = trx.items.reduce((acc, it) => acc + (parseNum(it.nominal) * (parseNum(it.qty) || 1)), 0);
                const dp = parseNum(trx.nominal_bayar);
                return (
                  <div key={trx.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 group hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                    <div>
                      <h4 className="font-black uppercase text-xs text-slate-800 dark:text-slate-200">{trx.supplier_name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                        {trx.items.map(it => it.component_name || "Lain-lain").join(", ")}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="font-black text-purple-600 dark:text-purple-400">{formatCurrency(trxTotal)}</p>
                        {dp > 0 && <p className="text-[8px] font-bold text-emerald-600 uppercase">DP: {formatCurrency(dp)}</p>}
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => openModal(trx)} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="Edit"><span className="text-xs">✏️</span></button>
                        <button type="button" onClick={() => removeTransaction(trx.id)} className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200" title="Hapus"><span className="text-xs">🗑️</span></button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {transactions.length === 0 && (
                <div className="text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Belum ada transaksi pihak
                </div>
              )}
            </div>

            <button
              type="button" onClick={() => openModal(null)}
              className="w-full border-2 border-dashed border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all flex justify-center items-center gap-2"
            >
              <span className="text-lg leading-none">+</span> Tambah Transaksi Pihak Baru
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* HPP FINAL & PRODUKSI */}
          <div className="bg-gradient-to-br from-slate-900 to-purple-950 p-5 rounded-[2rem] shadow-xl text-white relative overflow-hidden group h-fit space-y-4">
            <div className="relative z-10">
              <div className="w-fit bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase mb-4">
                HPP & HASIL PRODUKSI
              </div>

              <div className="mb-4">
                <label className="text-[9px] font-black uppercase opacity-60 ml-1">Hasil Jadi Produksi (Pcs)</label>
                <input
                  type="text" required
                  className="w-full bg-white/10 border border-white/20 p-2.5 rounded-xl font-black text-sm outline-none focus:border-white text-white placeholder-white/30 text-center mt-1"
                  placeholder="Misal: 100"
                  value={form.qty_produksi}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9.]/g, "");
                    setForm(p => ({ ...p, qty_produksi: clean }));
                  }}
                />
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                <p className="text-[9px] font-black uppercase opacity-60 mb-1 tracking-widest">Estimasi Modal / Pcs</p>
                <h4 className="text-3xl font-black italic tracking-tighter mb-4 text-emerald-400">{formatCurrency(calc.hpp_pcs)}</h4>
                <div className="grid grid-cols-2 border-t border-white/20 pt-4 gap-4">
                  <div>
                    <p className="text-[8px] font-black uppercase opacity-50 mb-1">Total Biaya PO</p>
                    <p className="font-black text-sm">{formatCurrency(calc.total_cost)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase opacity-50 mb-1">Per Lusin</p>
                    <p className="font-black text-sm">{formatCurrency(calc.hpp_lusin)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TARGET INVENTORY */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col max-h-[350px]">
            <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-3 tracking-widest">
              🎯 Target Master Barang ({form.inventory_ids.length})
            </h4>
            <input
              type="text" placeholder="Cari barang..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl font-bold text-[11px] outline-none mb-3 text-slate-900 dark:text-slate-100"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
              {filteredItems.map(item => {
                const checked = form.inventory_ids.includes(Number(item.id));
                return (
                  <label key={item.id} className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-colors ${checked ? "bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800" : "hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-100 dark:border-slate-700"}`}>
                    <input type="checkbox" className="w-4 h-4 accent-purple-600 rounded" checked={checked} onChange={() => handleCheckboxChange(Number(item.id))} />
                    <div className="overflow-hidden">
                      <p className="font-black text-[10px] uppercase truncate leading-tight text-slate-800 dark:text-slate-200">{item.nama_barang}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.kode_barang}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all">Batal</button>
            <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl shadow-lg transition-all">Simpan HPP</button>
          </div>
        </div>
      </form>

      {/* CASHIER-LIKE VENDOR TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl sm:rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg sm:text-xl uppercase tracking-tight">Detail Transaksi Pihak</h3>
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-0.5">Catat nota / tagihan dari suplier</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-colors">✕</button>
            </div>

            {/* Body Modal */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 text-slate-900 dark:text-slate-100">

              {/* VENDOR INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Nama Pihak / Vendor</label>
                  <input
                    list="modal-sup-options" placeholder="Pilih/Ketik nama..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold text-xs outline-none focus:border-purple-500 text-slate-900 dark:text-slate-100"
                    value={activeTrx.supplier_name}
                    onChange={(e) => setActiveTrx(p => ({ ...p, supplier_name: e.target.value }))}
                    onBlur={(e) => {
                      const sup = suppliers.find(s => s.customer === e.target.value);
                      if (sup && sup.no_hp_supplier && !activeTrx.no_hp) setActiveTrx(p => ({ ...p, no_hp: sup.no_hp_supplier }));
                    }}
                  />
                  <datalist id="modal-sup-options">{suppliers.map((s, i) => <option key={i} value={s.customer} />)}</datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">No HP Vendor</label>
                  <input
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold text-xs outline-none focus:border-purple-500 text-slate-900 dark:text-slate-100"
                    placeholder="Opsional"
                    value={activeTrx.no_hp}
                    onChange={(e) => setActiveTrx(p => ({ ...p, no_hp: e.target.value }))}
                  />
                </div>
              </div>

              <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-2"></div>

              {/* ITEMS/COMPONENTS */}
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Komponen Tagihan</label>
                </div>

                {activeTrx.items.map((item, idx) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="w-full sm:flex-1 space-y-1">
                      <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Jenis Biaya</label>
                      <input
                        list="modal-comp-options" placeholder="Misal: Kain, Potong..."
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 p-2 rounded-lg font-bold text-xs outline-none focus:border-purple-500 text-slate-900 dark:text-slate-100"
                        value={item.component_name}
                        onChange={(e) => handleActiveItemChange(item.id, "component_name", e.target.value)}
                      />
                      <datalist id="modal-comp-options">{componentOptions.map((opt, i) => <option key={i} value={opt} />)}</datalist>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <div className="w-20 space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Qty</label>
                        <input
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 p-2 rounded-lg font-bold text-xs outline-none text-center focus:border-purple-500 text-slate-900 dark:text-slate-100"
                          value={item.qty} placeholder="1"
                          onChange={(e) => handleActiveItemChange(item.id, "qty", e.target.value)}
                        />
                      </div>
                      <div className="flex-1 sm:w-32 space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Harga Satuan</label>
                        <input
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 p-2 rounded-lg font-bold text-xs outline-none focus:border-purple-500 text-purple-600 dark:text-purple-400"
                          value={item.nominal} placeholder="Rp..."
                          onChange={(e) => handleActiveItemChange(item.id, "nominal", e.target.value)}
                        />
                      </div>
                      {activeTrx.items.length > 1 && (
                        <button type="button" onClick={() => removeActiveItem(item.id)} className="w-10 h-10 mt-[18px] flex shrink-0 items-center justify-center bg-rose-100 text-rose-500 rounded-lg hover:bg-rose-200">✕</button>
                      )}
                    </div>
                  </div>
                ))}

                <button type="button" onClick={addActiveItem} className="w-full text-xs font-black uppercase text-purple-600 bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/30 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 dashed transition-colors mt-2">
                  + Tambah Baris Biaya
                </button>
              </div>

              <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-2"></div>

              {/* PEMBAYARAN DP */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <h4 className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 mb-3 tracking-widest">💸 Bayar Uang Muka / DP Pihak Ini</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Nominal DP</label>
                    <input
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold text-xs outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                      placeholder="Kosongkan jika ngutang full"
                      value={activeTrx.nominal_bayar}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, "");
                        setActiveTrx(p => ({ ...p, nominal_bayar: clean ? "Rp " + new Intl.NumberFormat("id-ID").format(clean) : "" }));
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Pilih Rekening</label>
                    <select
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold text-xs outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                      value={activeTrx.rekening_id}
                      onChange={(e) => setActiveTrx(p => ({ ...p, rekening_id: e.target.value }))}
                    >
                      <option value="">-- Rekening (Opsional) --</option>
                      {(Array.isArray(rekenings) ? rekenings : []).filter(r => r.tipe_rekening !== "MP Escrow").map(r => (
                        <option key={r.id} value={r.id}>{r.nama_rekening} - {r.nomor_rekening || r.tipe_rekening} [Saldo: Rp {parseInt(r.saldo_sekarang || 0).toLocaleString("id-ID")}]</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
              <div className="flex-1 flex items-center">
                <div className="text-[10px] font-black uppercase text-slate-500">Total Tagihan:</div>
                <div className="ml-2 text-base font-black text-slate-800 dark:text-slate-100">
                  {formatCurrency(activeTrx.items.reduce((acc, it) => acc + (parseNum(it.nominal) * (parseNum(it.qty) || 1)), 0))}
                </div>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase rounded-xl hover:bg-slate-300">Batal</button>
              <button type="button" onClick={saveModal} className="px-5 py-2.5 bg-purple-600 text-white font-black text-[10px] uppercase rounded-xl hover:bg-purple-700 shadow-lg active:scale-95 transition-all">Simpan Transaksi</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HppForm;
