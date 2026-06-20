import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import TopupRekeningModal from "../../components/finance/rekening/TopupRekeningModal";
import TransferRekeningModal from "../../components/finance/rekening/TransferRekeningModal";
import MutasiRekeningModal from "../../components/finance/rekening/MutasiRekeningModal";
import AddAkunModal from "../../components/finance/rekening/AddAkunModal";
import WithdrawRekeningModal from "../../components/finance/rekening/WithdrawRekeningModal";
import PayOperationalModal from "../../components/finance/rekening/PayOperationalModal";

const MasterRekening = () => {
  const [rekenings, setRekenings] = useState([]);
  const [rekeningTypes, setRekeningTypes] = useState([]);
  const [coaKasBankList, setCoaKasBankList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showPayOperationalModal, setShowPayOperationalModal] = useState(false);
  const [selectedRekeningForMutasi, setSelectedRekeningForMutasi] =
    useState(null);
  const [selectedRekeningForAction, setSelectedRekeningForAction] = useState(null);
  const [form, setForm] = useState({
    id: "",
    nama_rekening: "",
    tipe_rekening: "Transfer Bank",
    nomor_rekening: "",
    saldo_awal: "",
    mutasi_count: 0,
    coa_id: "",
  });

  const fetchRekenings = async () => {
    try {
      const res = await axiosInstance.get("finance/rekening.php?action=read");
      const data = res.data;
      setRekenings(Array.isArray(data) ? data : []); // Perbaikan di sini: ambil array dari properti 'data'
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRekeningTypes = async () => {
    try {
      const res = await axiosInstance.get("finance/rekening.php?action=get_types");
      const data = res.data;
      if (data.status === "success") {
        setRekeningTypes(data.types || []);
      }
    } catch (e) {
      console.error("Gagal muat tipe rekening");
    }
  };

  const fetchCoaKasBank = async () => {
    try {
      const res = await axiosInstance.get("finance/coa.php?action=read");
      if (res.data && res.data.status === "success") {
        setCoaKasBankList(res.data.data.filter(c => String(c.kode_akun).startsWith('10')));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRekenings();
    fetchRekeningTypes();
    fetchCoaKasBank();
  }, []);

  const formatRupiah = (val) => {
    if (!val) return "";
    return "Rp " + new Intl.NumberFormat("id-ID").format(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const path = form.id
        ? "finance/rekening.php?action=update"
        : "finance/rekening.php?action=create";

      const res = await axiosInstance.post(path, form);
      const data = res.data;

      if (data.status === "success") {
        window.showToast(
          form.id ? "Berhasil update rekening" : "Berhasil menambah rekening",
          "success",
        );
        setForm({
          id: "",
          nama_rekening: "",
          tipe_rekening: "Transfer Bank",
          nomor_rekening: "",
          saldo_awal: "",
          mutasi_count: 0,
          coa_id: "",
        });
        fetchRekenings();
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

  const handleEdit = (r) => {
    setForm({
      id: r.id,
      nama_rekening: r.nama_rekening,
      tipe_rekening: r.tipe_rekening,
      nomor_rekening: r.nomor_rekening,
      saldo_awal: r.saldo_awal,
      mutasi_count: parseInt(r.mutasi_count || 0),
      coa_id: r.coa_id || "",
    });
    setShowModal(true);
  };

  const handleViewMutasi = (rek) => {
    setSelectedRekeningForMutasi(rek);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Yakin hapus Rekening ini? Perhatikan jurnal atau transaksi yang mungkin terikat!",
      )
    )
      return;
    try {
      const res = await axiosInstance.get(
        `finance/rekening.php?action=delete&id=${id}`
      );
      const data = res.data;
      if (data.status === "success") {
        window.showToast("Rekening terhapus", "success");
        fetchRekenings();
      } else {
        window.showToast(data.message, "error");
      }
    } catch (e) {
      window.showToast("Gagal hapus", "error");
    }
  };

  // Menyembunyikan laci sistem (Piutang dan Hutang) agar tidak muncul di tabel
  const filteredRekenings = (Array.isArray(rekenings) ? rekenings : []).filter(
    (r) => {
      const isNotSystemAccount =
        r.tipe_rekening !== "Piutang" && r.tipe_rekening !== "Hutang";
      const matchesSearch =
        (r.nama_rekening || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (r.tipe_rekening || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (r.nomor_rekening || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return isNotSystemAccount && matchesSearch;
    },
  );

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500 h-full flex flex-col min-h-0 text-slate-900">
      {/* HEADER ROW: SEARCH, SUMMARY & ACTION BUTTONS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 md:mb-6 gap-4 shrink-0 w-full">
        <div className="relative w-full md:w-80 group shrink-0">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity">
            🔍
          </div>
          <input
            type="text"
            placeholder="Cari Rekening..."
            className="w-full bg-white border border-slate-100 p-3 pl-11 rounded-xl font-bold text-xs outline-none focus:border-blue-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm shrink-0">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 shrink-0">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="overflow-hidden">
            <p className="text-[8px] font-black text-emerald-600/70 uppercase tracking-widest leading-tight">
              Total Saldo Likuid
            </p>
            <h3 className="text-sm md:text-base font-black italic text-emerald-700 leading-none truncate">
              Rp{" "}
              {(Array.isArray(rekenings) ? rekenings : [])
                .reduce(
                  (sum, rek) => sum + parseInt(rek.saldo_sekarang || 0),
                  0,
                )
                .toLocaleString("id-ID")}
            </h3>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowTopupModal(true)}
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all whitespace-nowrap"
          >
            ➕ TOPUP
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all whitespace-nowrap"
          >
            🔄 PINDAH SALDO
          </button>
          <button
            onClick={() => {
              setForm({
                id: "",
                nama_rekening: "",
                tipe_rekening: "Transfer Bank",
                nomor_rekening: "",
                saldo_awal: "",
                mutasi_count: 0,
                coa_id: "",
              });
              setShowModal(true);
            }}
            className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all whitespace-nowrap"
          >
            + AKUN
          </button>
        </div>
      </div>

      {/* LIST TABLE DATA REKENING - FULL WIDTH */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col flex-1 min-h-[400px] overflow-hidden">
        <div className="overflow-auto custom-scrollbar flex-1 p-2 md:p-4 pt-0">
          <table className="w-full min-w-[600px] text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
                <th className="py-2 px-2 md:p-3">Informasi Akun</th>
                <th className="py-2 px-2 md:p-3 text-center">Tipe</th>
                <th className="py-2 px-2 md:p-3 text-right">Saldo Saat Ini</th>
                <th className="py-2 px-2 md:p-3 text-center min-w-[70px]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRekenings.map((r) => (
                <tr
                  key={r.id}
                  className="group hover:bg-slate-50 transition-colors"
                >
                  <td className="p-2 md:p-3 bg-slate-50 rounded-l-xl border-y border-l border-slate-100 max-w-[120px] md:max-w-[200px]">
                    <div className="font-black text-slate-800 uppercase italic tracking-tight text-[8px] md:text-[10px] truncate">
                      {r.tipe_rekening === "MP Escrow"
                        ? r.nama_rekening.replace(/Escrow\s*-\s*/i, "")
                        : r.nama_rekening}
                    </div>
                    <div className="mt-0.5">
                      {r.tipe_rekening === "MP Escrow" ? (
                        <span className="text-[7px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate block">
                          {r.nama_channel ? `MP: ${r.nama_channel}` : "MP: -"} |
                          STORE: {r.nama_store || "-"}
                        </span>
                      ) : (
                        <span className="text-[7px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate block">
                          {r.nomor_rekening || "-"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-center w-[60px] md:w-auto">
                    <span className="px-1.5 py-1 md:px-2.5 md:py-1 rounded-md text-[6px] md:text-[9px] font-black uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100 whitespace-nowrap inline-block">
                      {r.tipe_rekening}
                    </span>
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-right max-w-[100px] md:max-w-none">
                    <div className="text-[9px] md:text-xs font-black text-emerald-600 whitespace-nowrap truncate">
                      {formatRupiah(r.saldo_sekarang)}
                    </div>
                    {r.saldo_sekarang !== r.saldo_awal && (
                      <div className="text-[7px] md:text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest italic whitespace-nowrap truncate">
                        Awal: {formatRupiah(r.saldo_awal)}
                      </div>
                    )}
                  </td>
                  <td className="p-2 md:p-3 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-center w-[80px] md:w-auto whitespace-nowrap">
                    <div className="flex justify-center gap-1 md:gap-1.5 flex-wrap">
                      <button
                        onClick={() => {
                          setSelectedRekeningForAction(r);
                          setShowPayOperationalModal(true);
                        }}
                        className="px-1.5 py-1 md:px-2.5 md:py-1.5 bg-red-50 border border-red-100 rounded-md text-[10px] md:text-xs text-red-500 hover:bg-red-100 active:scale-95 transition-all"
                        title="Bayar Operasional"
                      >
                        ⚡
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRekeningForAction(r);
                          setShowWithdrawModal(true);
                        }}
                        className="px-1.5 py-1 md:px-2.5 md:py-1.5 bg-amber-50 border border-amber-100 rounded-md text-[10px] md:text-xs text-amber-500 hover:bg-amber-100 active:scale-95 transition-all"
                        title="Tarik Saldo (Prive)"
                      >
                        🏧
                      </button>
                      <button
                        onClick={() => handleViewMutasi(r)}
                        className="px-1.5 py-1 md:px-2.5 md:py-1.5 bg-indigo-50 border border-indigo-100 rounded-md text-[10px] md:text-xs text-indigo-500 hover:bg-indigo-100 active:scale-95 transition-all"
                        title="Riwayat Mutasi"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleEdit(r)}
                        className="px-1.5 py-1 md:px-2.5 md:py-1.5 bg-blue-50 border border-blue-100 rounded-md text-[10px] md:text-xs text-blue-500 hover:bg-blue-100 active:scale-95 transition-all"
                        title="Edit Data"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="px-1.5 py-1 md:px-2.5 md:py-1.5 bg-rose-50 border border-rose-100 rounded-md text-[10px] md:text-xs text-rose-500 hover:bg-rose-100 active:scale-95 transition-all"
                        title="Hapus Rekening"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRekenings.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="p-10 text-center bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="text-slate-300 font-bold text-[9px] md:text-[10px] uppercase italic tracking-widest">
                      {(Array.isArray(rekenings) ? rekenings : []).filter(
                        (r) =>
                          r.tipe_rekening !== "Piutang" &&
                          r.tipe_rekening !== "Hutang",
                      ).length === 0
                        ? "Belum Ada Data Rekening"
                        : "Data Tidak Ditemukan"}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddAkunModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        setForm={setForm}
        handleSubmit={handleSubmit}
        rekeningTypes={rekeningTypes}
        coaList={coaKasBankList}
        loading={loading}
      />

      {/* MODAL TOPUP */}
      <TopupRekeningModal
        isOpen={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        rekenings={rekenings}
        onSuccess={fetchRekenings}
      />

      {/* MODAL MUTASI & TRANSFER BATCH BARU */}
      <TransferRekeningModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        rekenings={rekenings}
        onSuccess={fetchRekenings}
      />

      <MutasiRekeningModal
        isOpen={!!selectedRekeningForMutasi}
        onClose={() => setSelectedRekeningForMutasi(null)}
        rekening={selectedRekeningForMutasi}
      />

      <WithdrawRekeningModal
        isOpen={showWithdrawModal}
        onClose={() => {
          setShowWithdrawModal(false);
          setSelectedRekeningForAction(null);
        }}
        rekening={selectedRekeningForAction}
        fetchRekening={fetchRekenings}
      />

      <PayOperationalModal
        isOpen={showPayOperationalModal}
        onClose={() => {
          setShowPayOperationalModal(false);
          setSelectedRekeningForAction(null);
        }}
        rekening={selectedRekeningForAction}
        fetchRekening={fetchRekenings}
      />
    </div>
  );
};

export default MasterRekening;
