import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import DateRangeFilter from "../../components/DateRangeFilter";
import Pagination from "../../components/Pagination";
import JurnalGuide from "../../components/finance/jurnal/JurnalGuide";
import AddJurnalModal from "../../components/finance/jurnal/AddJurnalModal";
import EditJurnalModal from "../../components/finance/jurnal/EditJurnalModal";
import JurnalDetailModal from "../../components/finance/jurnal/JurnalDetailModal";
import ModalQuickJurnal from "../../components/finance/jurnal/ModalQuickJurnal";

const JurnalUmum = () => {
  const [coaList, setCoaList] = useState([]);
  const [jurnalList, setJurnalList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJurnal, setSelectedJurnal] = useState(null);
  const [editJurnalData, setEditJurnalData] = useState(null);

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalData, setTotalData] = useState(0);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const fetchCOA = async () => {
    try {
      // Asumsi file coa.php (atau sejenisnya) sudah ada di backend
      const res = await axiosInstance.get("finance/coa.php?action=read");
      const data = res.data;
      if (data && data.status === "success") {
        setCoaList(data.data || []);
      } else if (Array.isArray(data)) {
        setCoaList(data);
      }
    } catch (e) {
      console.error("Gagal load COA:", e);
    }
  };

  const fetchJurnals = async () => {
    try {
      const params = new URLSearchParams({
        action: "read",
        page,
        limit,
        start_date: startDate,
        end_date: endDate
      });
      const res = await axiosInstance.get(`finance/jurnal_umum.php?${params.toString()}`);
      const data = res.data;
      if (data && data.status === "success") {
        setJurnalList(data.data || []);
        setTotalData(data.total_data || 0);
      } else if (Array.isArray(data)) {
        setJurnalList(data);
      }
    } catch (e) {
      console.error("Gagal load Jurnal:", e);
    }
  };

  useEffect(() => {
    fetchCOA();
  }, []);

  useEffect(() => {
    fetchJurnals();
  }, [page, startDate, endDate]);

  // Reset page when date changes
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);

  const formatRp = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const filteredJurnals = jurnalList.filter(
    (j) =>
      j.no_referensi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500 h-full flex flex-col min-h-0 text-slate-900 bg-slate-50">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 md:mb-6 gap-3 shrink-0">
        {/* <div>
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
            Jurnal <span className="text-blue-600">Umum</span>
          </h2>
          <p className="font-bold text-[9px] md:text-[10px] tracking-[0.3em] uppercase mt-1.5 md:mt-2 text-blue-500">
            Pencatatan Transaksi Harian
          </p>
        </div> */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 md:mb-6 gap-3 shrink-0 w-full">
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-start sm:items-center">
            <DateRangeFilter
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
            <div className="relative w-full md:w-72 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity">
                🔍
              </div>
              <input
                type="text"
                placeholder="Cari Referensi atau Deskripsi..."
                className="w-full bg-white border border-slate-100 p-2.5 md:p-3 pl-10 md:pl-11 rounded-xl font-bold text-xs outline-none focus:border-blue-500 shadow-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowQuickModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 md:py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all whitespace-nowrap flex items-center gap-2"
            >
              ⚡ TRANS CEPAT
            </button>
            <JurnalGuide />
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 md:py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all whitespace-nowrap"
            >
              + TAMBAH
            </button>
          </div>
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden min-h-[400px]">
        {/* Table View */}
        <div className="overflow-auto custom-scrollbar flex-1 p-2 md:p-4 pt-0">
          <table className="w-full min-w-[600px] md:min-w-[800px] text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest">
                <th className="py-2 px-2 md:p-3">Tanggal</th>
                <th className="py-2 px-2 md:p-3">No Referensi</th>
                <th className="py-2 px-2 md:p-3">Deskripsi</th>
                <th className="py-2 px-2 md:p-3 text-right">Total Jurnal</th>
                <th className="py-2 px-2 md:p-3 text-center min-w-[70px]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredJurnals.length > 0 ? (
                filteredJurnals.map((j) => (
                  <tr
                    key={j.id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-2 md:p-3 bg-slate-50 rounded-l-xl border-y border-l border-slate-100 font-bold text-[8px] md:text-[10px] text-slate-500 whitespace-nowrap">
                      {j.tanggal}
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest">
                      {j.no_referensi}
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-[8px] md:text-[10px] text-slate-500 italic max-w-[150px] md:max-w-xs truncate">
                      {j.deskripsi || "-"}
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 border-y border-slate-100 text-right max-w-[100px] md:max-w-none">
                      <div className="text-[9px] md:text-xs font-black text-emerald-600 whitespace-nowrap truncate">
                        Rp {formatRp(j.total_debit)}
                      </div>
                    </td>
                    <td className="p-2 md:p-3 bg-slate-50 rounded-r-xl border-y border-r border-slate-100 text-center w-[80px] md:w-auto whitespace-nowrap">
                      <div className="flex justify-center gap-1 md:gap-1.5">
                        <button
                          onClick={() => {
                            setEditJurnalData(j);
                            setShowEditModal(true);
                          }}
                          className={`px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-md text-[10px] md:text-xs transition-all ${parseInt(j.is_auto || 0) === 1
                              ? "bg-amber-50 border border-amber-100 text-amber-500 hover:bg-amber-100"
                              : "bg-blue-50 border border-blue-100 text-blue-500 hover:bg-blue-100"
                            }`}
                          title="Edit Jurnal"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setSelectedJurnal(j)}
                          className="px-1.5 py-1 md:px-2.5 md:py-1.5 bg-indigo-50 border border-indigo-100 rounded-md text-[10px] md:text-xs text-indigo-500 hover:bg-indigo-100 active:scale-95 transition-all"
                          title="Detail Jurnal"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="text-slate-300 font-bold text-[9px] md:text-[10px] uppercase italic tracking-widest">
                      Belum ada data jurnal ditemukan
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          totalData={totalData}
          limit={limit}
          onLimitChange={setLimit}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>

      {/* MODAL */}
      <ModalQuickJurnal
        isOpen={showQuickModal}
        onClose={() => setShowQuickModal(false)}
        onSuccess={fetchJurnals}
      />
      <AddJurnalModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        coaList={coaList}
        onSuccess={fetchJurnals}
      />
      <EditJurnalModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditJurnalData(null);
        }}
        coaList={coaList}
        jurnalData={editJurnalData}
        onSuccess={fetchJurnals}
      />
      <JurnalDetailModal
        isOpen={!!selectedJurnal}
        onClose={() => setSelectedJurnal(null)}
        jurnal={selectedJurnal}
      />
    </div>
  );
};

export default JurnalUmum;
