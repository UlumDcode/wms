import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import TopupDepositModal from "../../components/finance/deposit/TopupDepositModal";
import TarikDepositModal from "../../components/finance/deposit/ModalTarikSaldo";
import RiwayatDepositModal from "../../components/finance/deposit/ModalHistoryDeposit";

const DepositReseller = () => {
  const [resellerList, setResellerList] = useState([]);
  const [rekeningList, setRekeningList] = useState([]);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showTarikModal, setShowTarikModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReseller = async () => {
    try {
      const res = await axiosInstance.get(
        "finance/deposit_reseller.php?action=read_reseller"
      );
      const data = res.data;
      setResellerList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Gagal memuat data reseller", e);
    }
  };

  const fetchRekening = async () => {
    try {
      const res = await axiosInstance.get("finance/rekening.php?action=read");
      const data = res.data;
      setRekeningList(
        Array.isArray(data)
          ? data.filter((rek) => rek.tipe_rekening !== "MP Escrow")
          : [],
      );
    } catch (e) {
      console.error("Gagal memuat data rekening", e);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchReseller(), fetchRekening()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Fungsi masking format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  const handleOpenTopup = (reseller) => {
    setSelectedReseller(reseller);
    setShowTopupModal(true);
  };

  const handleOpenTarik = (reseller) => {
    setSelectedReseller(reseller);
    setShowTarikModal(true);
  };

  const handleOpenHistory = (reseller) => {
    setSelectedReseller(reseller);
    setShowHistoryModal(true);
  };

  return (
    <div className="p-4 md:p-6 animate-in fade-in duration-500 h-full flex flex-col text-slate-900">
      {/* HEADER SECTION */}
      {/* <div className="mb-6 shrink-0">
        <h2 className="text-2xl md:text-3xl font-black italic uppercase text-slate-900 leading-none tracking-tighter">
          Manajemen Modal &{" "}
          <span className="text-blue-600">Deposit Reseller</span>
        </h2>
        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
          Kelola saldo deposit dari mitra reseller Anda
        </p>
      </div> */}

      {/* TABLE SECTION */}
      <div className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="overflow-auto overflow-x-auto custom-scrollbar flex-1 p-4 pt-0 mt-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                Memuat Data...
              </span>
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-left border-separate border-spacing-y-2">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100">
                    Nama Channel/Reseller
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100 hidden md:table-cell">
                    No HP
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100 hidden md:table-cell">
                    Email
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100 text-right">
                    Saldo Deposit Saat Ini
                  </th>
                  <th className="py-2 px-2 md:p-3 border-b border-slate-100 text-center min-w-[70px]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {resellerList.map((reseller) => (
                  <tr
                    key={reseller.id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-l border-slate-100 rounded-l-xl max-w-[120px] md:max-w-[200px]">
                      <div className="font-black text-slate-800 uppercase italic tracking-tight text-[8px] md:text-[10px] truncate">
                        {reseller.nama_channel}
                      </div>
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-[8px] md:text-[10px] font-bold text-slate-600 hidden md:table-cell truncate">
                      {reseller.no_hp || "-"}
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-[8px] md:text-[10px] font-bold text-slate-600 hidden md:table-cell truncate">
                      {reseller.email || "-"}
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-right max-w-[100px] md:max-w-none">
                      <div className="text-[9px] md:text-xs font-black text-blue-600 whitespace-nowrap truncate">
                        {formatRupiah(
                          reseller.saldo_deposit ?? reseller.saldo_titipan ?? 0,
                        )}
                      </div>
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-r border-slate-100 rounded-r-xl text-center w-[80px] md:w-auto whitespace-nowrap">
                      <div className="flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2 w-full">
                        <button
                          onClick={() => handleOpenTopup(reseller)}
                          className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 whitespace-nowrap"
                        >
                          + Topup
                        </button>
                        <button
                          onClick={() => handleOpenTarik(reseller)}
                          className="w-full md:w-auto bg-rose-500 hover:bg-rose-600 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 whitespace-nowrap"
                        >
                          - Tarik
                        </button>
                        <button
                          onClick={() => handleOpenHistory(reseller)}
                          className="w-full md:w-auto bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap"
                        >
                          📄 Riwayat
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {resellerList.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-10 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-300 font-bold text-[9px] md:text-[10px] uppercase italic tracking-widest"
                    >
                      Belum ada data reseller
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL TOPUP COMPONENT */}
      <TopupDepositModal
        isOpen={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        selectedReseller={selectedReseller}
        rekeningList={rekeningList}
        onSuccess={fetchReseller}
      />
      {/* MODAL TARIK SALDO COMPONENT */}
      <TarikDepositModal
        isOpen={showTarikModal}
        onClose={() => setShowTarikModal(false)}
        selectedReseller={selectedReseller}
        rekeningList={rekeningList}
        onSuccess={fetchReseller}
      />
      {/* MODAL HISTORY DEPOSIT COMPONENT */}
      <RiwayatDepositModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        selectedReseller={selectedReseller}
      />
    </div>
  );
};

export default DepositReseller;
