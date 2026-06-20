import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../utils/axios";
import DateRangeFilter from "../../components/DateRangeFilter";

// Import komponen-komponen yang telah dipisahkan
import TabBukuUtangPiutang from "../../components/finance/utangpiutang/TabBukuUtangPiutang";
import TabPusatHistori from "../../components/finance/utangpiutang/TabPusatHistori";
import TabRekapitulasiTagihan from "../../components/finance/utangpiutang/TabRekapitulasiTagihan";
import ModalHistoriCicilan from "../../components/finance/utangpiutang/ModalHistoriCicilan";
import ModalPelunasan from "../../components/finance/utangpiutang/ModalPelunasan";
import ModalPelunasanMassal from "../../components/finance/utangpiutang/ModalPelunasanMassal";

const UtangPiutang = () => {
  const [activeTab, setActiveTab] = useState("piutang");
  const [piutangList, setPiutangList] = useState([]);
  const [hutangList, setHutangList] = useState([]);
  const [historiHutangList, setHistoriHutangList] = useState([]);
  const [historiPiutangList, setHistoriPiutangList] = useState([]);
  const [rekenings, setRekenings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [channels, setChannels] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState({
    nominal: "",
    rekening_id: "",
    no_hp: "",
  });

  // State untuk Modal Histori Pembayaran
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // State untuk Modal Pelunasan Massal (Lunasi Semua)
  const [showMassPayModal, setShowMassPayModal] = useState(false);
  const [massPayPihak, setMassPayPihak] = useState("");
  const [massPayRekening, setMassPayRekening] = useState("");
  const [massPayNominal, setMassPayNominal] = useState("");
  const [massPayNoHp, setMassPayNoHp] = useState("");

  // State Filter Rentang Tanggal Histori
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // State untuk Detail Barang Tagihan
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalLoading, setDetailModalLoading] = useState(false);
  const [detailModalData, setDetailModalData] = useState({
    no_ref: "",
    nama_pihak: "",
    items: [],
  });

  const handleOpenDetail = async (item, type) => {
    setShowDetailModal(true);
    setDetailModalLoading(true);
    setDetailModalData({ no_ref: "", nama_pihak: "", items: [] });
    try {
      const res = await axiosInstance.get(
        `finance/utang_piutang.php?action=read_tagihan_detail&type=${type}&id=${item.id}`
      );
      const data = res.data;
      if (data.status === "success") {
        setDetailModalData({
          no_ref: data.no_ref,
          nama_pihak: data.nama_pihak,
          items: Array.isArray(data.items) ? data.items : [],
        });
      } else {
        window.showToast(data.message || "Gagal mengambil rincian barang", "error");
      }
    } catch (e) {
      window.showToast("Gagal mengambil rincian barang", "error");
    } finally {
      setDetailModalLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Rekening
      const resRek = await axiosInstance.get("finance/rekening.php?action=read");
      const dataRek = resRek.data;
      setRekenings(Array.isArray(dataRek) ? dataRek : []);

      // 2. Fetch Buku Piutang
      const resPiutang = await axiosInstance.get(
        "finance/utang_piutang.php?action=read_piutang"
      );
      const dataPiutang = resPiutang.data;
      if (Array.isArray(dataPiutang)) {
        setPiutangList(dataPiutang);
      }

      // 3. Fetch Buku Hutang
      const resHutang = await axiosInstance.get(
        "finance/utang_piutang.php?action=read_hutang"
      ).catch(() => null);
      if (resHutang) {
        const dataHutang = resHutang.data;
        setHutangList(Array.isArray(dataHutang) ? dataHutang : []);
      }

      // 4. Fetch Pusat Histori Hutang
      const resHistoriHutang = await axiosInstance.get(
        "finance/utang_piutang.php?action=read_histori_hutang"
      ).catch(() => null);
      if (resHistoriHutang) {
        const dataHistoriHutang = resHistoriHutang.data;
        setHistoriHutangList(
          Array.isArray(dataHistoriHutang) ? dataHistoriHutang : [],
        );
      }

      // 5. Fetch Pusat Histori Piutang
      const resHistoriPiutang = await axiosInstance.get(
        "finance/utang_piutang.php?action=read_histori_piutang"
      ).catch(() => null);
      if (resHistoriPiutang) {
        const dataHistoriPiutang = resHistoriPiutang.data;
        setHistoriPiutangList(
          Array.isArray(dataHistoriPiutang) ? dataHistoriPiutang : [],
        );
      }

      // 6. Fetch Channels
      const resChan = await axiosInstance.get("/channels.php?action=read_channels").catch(() => null);
      if (resChan) {
        setChannels(Array.isArray(resChan.data) ? resChan.data : []);
      }

      // 7. Fetch Suppliers
      const resSup = await axiosInstance.get("/hpp.php?action=get_suppliers").catch(() => null);
      if (resSup && resSup.data?.status === "success") {
        setSuppliers(Array.isArray(resSup.data.data) ? resSup.data.data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleOpenModal = (item, type) => {
    setSelectedItem({ ...item, type });

    const tagihan =
      type === "piutang"
        ? parseFloat(item.total_tagihan)
        : parseFloat(item.total_hutang || item.total_biaya || 0);
    const terbayar = parseFloat(item.total_terbayar || 0);
    const sisa = tagihan - terbayar;

    const cleanNominal = Math.floor(sisa || 0);

    setForm({
      nominal: cleanNominal.toString(),
      rekening_id: "",
      no_hp: item.no_hp || "",
    });
    setShowModal(true);
  };

  const handleNominalChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setForm({ ...form, nominal: rawValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rekening_id) {
      return window.showToast(
        "Pilih rekening sumber dana / pencairan!",
        "warning",
      );
    }

    setLoading(true);
    try {
      const endpoint =
        selectedItem.type === "piutang"
          ? "finance/utang_piutang.php?action=bayar_piutang"
          : "finance/utang_piutang.php?action=bayar_hutang";

      const payload = {
        rekening_id: parseInt(form.rekening_id),
        nominal_bayar: parseFloat(form.nominal),
        no_hp: form.no_hp,
      };

      if (selectedItem.type === "piutang") {
        payload.buku_piutang_id = selectedItem.id;
      } else {
        payload.buku_hutang_id = selectedItem.id;
      }

      const res = await axiosInstance.post(endpoint, payload);
      const data = res.data;

      if (data.status === "success") {
        window.showToast(
          data.message || "Pelunasan berhasil diproses!",
          "success",
        );
        setShowModal(false);
        fetchData();
      } else {
        window.showToast(data.message || "Gagal memproses pelunasan", "error");
      }
    } catch (e) {
      window.showToast("Terjadi kesalahan sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val) => {
    if (!val) return "Rp 0";
    let strVal = val.toString();
    if (!strVal.includes("Rp") && strVal.includes(".")) {
      strVal = strVal.split(".")[0];
    }
    const clean = strVal.replace(/\D/g, "");
    return "Rp " + new Intl.NumberFormat("id-ID").format(clean);
  };

  const handleViewHistory = async (item, type) => {
    setSelectedItem({ ...item, type });
    setShowHistoryModal(true);
    setHistoryLoading(true);
    setHistoryData([]);
    try {
      const res = await axiosInstance.get(
        `finance/utang_piutang.php?action=history_hutang_piutang&type=${type}&id=${item.id}`
      );
      const data = res.data;
      setHistoryData(Array.isArray(data) ? data : []);
    } catch (error) {
      window.showToast("Gagal mengambil histori", "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  const uniquePihak = useMemo(() => {
    const list =
      activeTab === "piutang"
        ? piutangList.map((p) => p.nama_channel || "Customer Umum")
        : hutangList.map(
          (h) => h.nama_supplier || h.supplier_name || "Supplier Umum",
        );
    return Array.from(new Set(list)).filter(Boolean);
  }, [activeTab, piutangList, hutangList]);

  // Auto-fill No HP saat memilih pihak di Pelunasan Massal
  useEffect(() => {
    if (showMassPayModal && massPayPihak) {
      const list = activeTab === "piutang" ? piutangList : hutangList;
      const found = list.find((item) => {
        const itemPihak =
          activeTab === "piutang"
            ? item.nama_channel || "Customer Umum"
            : item.nama_supplier || item.supplier_name || "Supplier Umum";
        return itemPihak === massPayPihak;
      });
      if (found) setMassPayNoHp(found.no_hp || "");
    }
  }, [massPayPihak, showMassPayModal, activeTab, piutangList, hutangList]);

  const massPayTotal = useMemo(() => {
    if (!massPayPihak) return 0;
    const items =
      activeTab === "piutang"
        ? piutangList.filter(
          (p) => (p.nama_channel || "Customer Umum") === massPayPihak,
        )
        : hutangList.filter(
          (h) =>
            (h.nama_supplier || h.supplier_name || "Supplier Umum") ===
            massPayPihak,
        );

    return items.reduce((sum, item) => {
      const tagihan =
        parseFloat(
          activeTab === "piutang"
            ? item.total_tagihan
            : item.total_kewajiban || item.total_hutang,
        ) || 0;
      const terbayar = parseFloat(item.total_terbayar) || 0;
      return sum + (tagihan - terbayar);
    }, 0);
  }, [massPayPihak, activeTab, piutangList, hutangList]);

  const handleMassPaySubmit = async (e) => {
    e.preventDefault();
    if (!massPayRekening)
      return window.showToast("Pilih rekening dana!", "warning");
    if (!massPayPihak)
      return window.showToast("Pilih pihak target pelunasan!", "warning");

    setLoading(true);
    try {
      const payload = {
        type: activeTab,
        pihak: massPayPihak,
        nominal: parseFloat(massPayNominal.replace(/\D/g, "")),
        rekening_id: parseInt(massPayRekening),
        no_hp: massPayNoHp,
      };

      const res = await axiosInstance.post(
        "finance/utang_piutang.php?action=settle_massal",
        payload
      );
      const data = res.data;

      if (data.status === "success") {
        window.showToast(
          data.message || "Pelunasan massal berhasil!",
          "success",
        );
      } else {
        throw new Error(data.message);
      }

      setShowMassPayModal(false);
      setMassPayPihak("");
      setMassPayRekening("");
      setMassPayNoHp("");
      fetchData();
    } catch (e) {
      window.showToast(
        "Terjadi kesalahan sistem saat pelunasan massal",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPiutang = piutangList.filter(
    (p) =>
      String(p.outbound_id).includes(searchTerm.toLowerCase()) ||
      (p.nama_channel || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.no_hp || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredHutang = hutangList.filter(
    (h) =>
      String(h.inbound_id).includes(searchTerm.toLowerCase()) ||
      (h.nama_supplier || h.supplier_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (h.no_hp || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredHistoriHutang = useMemo(() => {
    return historiHutangList.filter((h) => {
      let matchDate = true;
      if (h.tanggal) {
        const hDate = h.tanggal.split(" ")[0];
        if (startDate && hDate < startDate) matchDate = false;
        if (endDate && hDate > endDate) matchDate = false;
      }
      return matchDate;
    });
  }, [historiHutangList, startDate, endDate]);

  const filteredHistoriPiutang = useMemo(() => {
    return historiPiutangList.filter((h) => {
      let matchDate = true;
      if (h.tanggal) {
        const hDate = h.tanggal.split(" ")[0];
        if (startDate && hDate < startDate) matchDate = false;
        if (endDate && hDate > endDate) matchDate = false;
      }
      return matchDate;
    });
  }, [historiPiutangList, startDate, endDate]);

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500 h-full flex flex-col min-h-0 text-slate-900">
      {/* SEARCH HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 md:mb-6 gap-3 shrink-0">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
          <div className="relative w-full md:w-72 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity">
              🔍
            </div>
            <input
              type="text"
              placeholder="Cari ID Ref atau Nama..."
              className="w-full bg-white border border-slate-100 p-2.5 md:p-3 pl-10 md:pl-11 rounded-xl font-bold text-xs outline-none focus:border-blue-500 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS CONTROL */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 shrink-0 gap-3">
        <div className="flex flex-wrap gap-1.5 md:gap-2 w-full xl:w-auto">
          <button
            onClick={() => {
              setActiveTab("piutang");
              setMassPayPihak("");
            }}
            className={`flex-1 xl:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-black text-[8px] md:text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "piutang"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
          >
            Tagihan Piutang
          </button>
          <button
            onClick={() => {
              setActiveTab("hutang");
              setMassPayPihak("");
            }}
            className={`flex-1 xl:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-black text-[8px] md:text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "hutang"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
          >
            Kewajiban Hutang
          </button>
          <button
            onClick={() => {
              setActiveTab("histori");
              setMassPayPihak("");
            }}
            className={`flex-1 xl:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-black text-[8px] md:text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "histori"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
          >
            Pusat Histori
          </button>
          <button
            onClick={() => {
              setActiveTab("rekap");
              setMassPayPihak("");
            }}
            className={`flex-1 xl:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-black text-[8px] md:text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "rekap"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
          >
            Rekapitulasi Tagihan
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 md:gap-3 w-full xl:w-auto justify-end mt-1 xl:mt-0">
          {activeTab === "histori" && (
            <DateRangeFilter
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          )}
          <button
            onClick={() => setShowMassPayModal(true)}
            className="w-full sm:w-auto px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-black text-[8px] md:text-[9px] uppercase tracking-widest transition-all bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-95 flex justify-center items-center gap-1.5 whitespace-nowrap sm:self-stretch"
          >
            ⚡ Lunasi Semua Tagihan
          </button>
        </div>
      </div>

      {/* RENDER KONTEN TAB UTANG & PIUTANG */}
      <TabBukuUtangPiutang
        activeTab={activeTab}
        filteredPiutang={filteredPiutang}
        filteredHutang={filteredHutang}
        formatRupiah={formatRupiah}
        handleViewHistory={handleViewHistory}
        handleOpenModal={handleOpenModal}
        onRowClick={handleOpenDetail}
      />

      {/* RENDER KONTEN TAB PUSAT HISTORI */}
      <TabPusatHistori
        activeTab={activeTab}
        filteredHistoriHutang={filteredHistoriHutang}
        filteredHistoriPiutang={filteredHistoriPiutang}
        historiHutangList={historiHutangList}
        historiPiutangList={historiPiutangList}
        formatRupiah={formatRupiah}
      />

      {/* RENDER KONTEN TAB REKAPITULASI TAGIHAN */}
      <TabRekapitulasiTagihan
        activeTab={activeTab}
        channels={channels}
        suppliers={suppliers}
        formatRupiah={formatRupiah}
      />

      {/* MODAL PELUNASAN SATUAN (Bawaan Luar Komponen) */}
      <ModalPelunasan
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedItem={selectedItem}
        form={form}
        setForm={setForm}
        rekenings={rekenings}
        loading={loading}
        handleSubmit={handleSubmit}
        formatRupiah={formatRupiah}
        handleNominalChange={handleNominalChange}
      />

      {/* MODAL HISTORI CICILAN */}
      <ModalHistoriCicilan
        showHistoryModal={showHistoryModal}
        setShowHistoryModal={setShowHistoryModal}
        selectedItem={selectedItem}
        historyLoading={historyLoading}
        historyData={historyData}
        formatRupiah={formatRupiah}
      />

      {/* MODAL PELUNASAN MASSAL */}
      <ModalPelunasanMassal
        showMassPayModal={showMassPayModal}
        setShowMassPayModal={setShowMassPayModal}
        activeTab={activeTab}
        handleMassPaySubmit={handleMassPaySubmit}
        massPayPihak={massPayPihak}
        setMassPayPihak={setMassPayPihak}
        massPayNoHp={massPayNoHp}
        setMassPayNoHp={setMassPayNoHp}
        uniquePihak={uniquePihak}
        massPayTotal={massPayTotal}
        formatRupiah={formatRupiah}
        massPayRekening={massPayRekening}
        setMassPayRekening={setMassPayRekening}
        massPayNominal={massPayNominal}
        setMassPayNominal={setMassPayNominal}
        rekenings={rekenings}
        loading={loading}
      />

      {/* MODAL DETAIL BARANG TAGIHAN */}
      {showDetailModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[1.5rem] shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800 p-6 text-slate-800 dark:text-slate-200">
            <h3 className="font-black uppercase italic text-sm mb-4 text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
              <span>📋 Rincian Barang Tagihan</span>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors font-bold text-xs uppercase"
              >
                ✕
              </button>
            </h3>
            {detailModalLoading ? (
              <div className="py-12 text-center text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
                Memuat rincian barang...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Pihak / Transaksi
                  </p>
                  <p className="text-sm font-black text-slate-850 dark:text-slate-100 uppercase mt-0.5">
                    {detailModalData.nama_pihak}
                  </p>
                  <p className="text-[10px] font-mono font-bold text-slate-500 mt-1">
                    Ref: #{detailModalData.no_ref}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider ml-1">
                    Daftar Barang
                  </p>
                  <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                    {detailModalData.items.length === 0 ? (
                      <p className="text-xs font-bold text-slate-400 italic p-3 text-center">
                        Tidak ada detail barang terdaftar.
                      </p>
                    ) : (
                      detailModalData.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300"
                        >
                          <div>
                            <p className="text-slate-800 dark:text-slate-100 uppercase leading-tight">
                              {it.nama_barang}
                            </p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                              {it.kode_barang}
                            </p>
                          </div>
                          <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-[10px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {it.qty} Pcs
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 text-[10px] font-bold text-blue-700 dark:text-blue-400 leading-relaxed uppercase">
                  ℹ️ Pesanan #{detailModalData.no_ref} berisi{" "}
                  {detailModalData.items
                    .map((it) => `${it.nama_barang} ${it.qty} pcs`)
                    .join(", ") || "-"}
                </div>

                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full bg-slate-900 dark:bg-slate-850 hover:bg-slate-800 dark:hover:bg-slate-800 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-md mt-4"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UtangPiutang;
