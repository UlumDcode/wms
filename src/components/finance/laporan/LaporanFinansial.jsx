import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/axios";
import ReportDocument from "./ReportDocument";

const LaporanFinansial = ({ bulan, tahun }) => {
  const [loading, setLoading] = useState(false);
  const [storeConfig, setStoreConfig] = useState(null);

  // State Data
  const [labaRugi, setLabaRugi] = useState(null);
  const [neraca, setNeraca] = useState(null);

  const API_URL =
    localStorage.getItem("CUSTOM_API_URL") ||
    import.meta.env.VITE_API_URL ||
    `http://${window.location.hostname}:8000`;

  const formatIDR = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resConfig = await axiosInstance.get("settings.php?action=get_store");
        const configData = resConfig.data;
        setStoreConfig(configData);

        // 2. Hitung Tanggal Awal dan Akhir berdasarkan Bulan & Tahun
        const startDate = `${tahun}-${bulan}-01`;
        // Tanggal terakhir di bulan tersebut
        const endDate = new Date(tahun, parseInt(bulan), 0)
          .toISOString()
          .split("T")[0];

        // 3. Tarik Data Laba Rugi & Neraca secara paralel
        const [resLR, resNeraca] = await Promise.all([
          axiosInstance.get(
            `finance/laporan.php?action=laba_rugi&start_date=${startDate}&end_date=${endDate}`
          ),
          axiosInstance.get(`finance/laporan.php?action=neraca&as_of_date=${endDate}`),
        ]);

        const dataLR = resLR.data;
        const dataNeraca = resNeraca.data;

        setLabaRugi(dataLR.status === "success" ? dataLR : null);
        setNeraca(dataNeraca.status === "success" ? dataNeraca : null);
      } catch (error) {
        console.error("Gagal memuat data laporan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bulan, tahun]);
  // Hapus API_URL dari dalam kurung siku dependency di atas karena sudah tidak dipakai di useEffect

  // UI Komponen Baris Tabel (Biar rapi dan seragam)
  const ReportRow = ({
    label,
    value,
    isTotal = false,
    isHighlight = false,
    isIndent = false,
  }) => (
    <div
      className={`flex justify-between items-center py-1.5 ${isTotal ? "border-t border-slate-300 mt-1" : "border-b border-slate-100 dark:border-slate-800"} ${isIndent ? "pl-4" : ""}`}
    >
      <span
        className={`${isTotal ? "font-bold text-slate-800 dark:text-slate-200" : "font-medium text-slate-600 dark:text-slate-400"} ${isHighlight ? "uppercase tracking-widest text-[10px]" : "text-[10px]"}`}
      >
        {label}
      </span>
      <span
        className={`${isTotal ? "font-black" : "font-bold"} ${isHighlight ? "text-[11px] text-emerald-600" : "text-[10px] text-slate-800 dark:text-slate-200"}`}
      >
        {formatIDR(value)}
      </span>
    </div>
  );

  // UI Header Kategori
  const CategoryHeader = ({ title }) => (
    <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 mt-3 mb-1 rounded-sm">
      {title}
    </h4>
  );

  const namaBulan = new Date(tahun, parseInt(bulan) - 1).toLocaleString(
    "id-ID",
    { month: "long" },
  );

  return (
    <div className="w-full max-w-4xl mx-auto pb-10">
      {/* TOMBOL CETAK MENGAMBANG DI KANAN ATAS */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => window.print()}
          className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-md print:hidden flex items-center gap-2 transition-all"
        >
          🖨️ Cetak PDF
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
            Menyusun Laporan...
          </p>
        </div>
      ) : (
        <ReportDocument
          title="Laporan Keuangan Konsolidasi"
          subtitle={`Periode: ${namaBulan} ${tahun}`}
          storeConfig={storeConfig}
          API_URL={API_URL}
        >
          {/* ============================================================== */}
          {/* BAGIAN 1: LAPORAN LABA RUGI */}
          {/* ============================================================== */}
          <div className="mb-6">
            <h3 className="text-center font-black text-[12px] uppercase tracking-[0.2em] mb-4 border-b-2 border-slate-900 pb-1 inline-block">
              1. Laporan Laba Rugi
            </h3>

            <div className="px-2">
              <CategoryHeader title="Pendapatan" />
              {labaRugi?.pendapatan?.items?.length > 0 ? (
                labaRugi.pendapatan.items.map((item, idx) => (
                  <ReportRow
                    key={idx}
                    label={item.nama}
                    value={item.saldo}
                    isIndent
                  />
                ))
              ) : (
                <ReportRow
                  label="Tidak ada mutasi pendapatan"
                  value={0}
                  isIndent
                />
              )}
              <ReportRow
                label="Total Pendapatan"
                value={labaRugi?.pendapatan?.total || 0}
                isTotal
              />

              <CategoryHeader title="Harga Pokok Penjualan (HPP)" />
              {labaRugi?.hpp?.items?.length > 0 ? (
                labaRugi.hpp.items.map((item, idx) => (
                  <ReportRow
                    key={idx}
                    label={item.nama}
                    value={item.saldo}
                    isIndent
                  />
                ))
              ) : (
                <ReportRow label="Tidak ada mutasi HPP" value={0} isIndent />
              )}
              <ReportRow
                label="Total HPP"
                value={labaRugi?.hpp?.total || 0}
                isTotal
              />

              <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 p-2 border border-emerald-200 dark:border-emerald-800 rounded">
                <ReportRow
                  label="LABA KOTOR"
                  value={labaRugi?.laba_kotor || 0}
                  isTotal
                  isHighlight
                />
              </div>

              <CategoryHeader title="Biaya Operasional (Opex)" />
              {labaRugi?.opex?.items?.length > 0 ? (
                labaRugi.opex.items.map((item, idx) => (
                  <ReportRow
                    key={idx}
                    label={item.nama}
                    value={item.saldo}
                    isIndent
                  />
                ))
              ) : (
                <ReportRow
                  label="Tidak ada mutasi biaya operasional"
                  value={0}
                  isIndent
                />
              )}
              <ReportRow
                label="Total Biaya Operasional"
                value={labaRugi?.opex?.total || 0}
                isTotal
              />

              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-2 border border-blue-200 dark:border-blue-800 rounded">
                <ReportRow
                  label="LABA BERSIH"
                  value={labaRugi?.laba_bersih || 0}
                  isTotal
                  isHighlight
                />
              </div>
            </div>
          </div>

          {/* PEMISAH ANTARA LABA RUGI & NERACA (MUNCUL DI CETAK) */}
          <div className="flex items-center gap-4 my-8 opacity-50">
            <div className="flex-1 border-b-2 border-dashed border-slate-400"></div>
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              Pemotongan Halaman (Bila Perlu)
            </span>
            <div className="flex-1 border-b-2 border-dashed border-slate-400"></div>
          </div>

          {/* ============================================================== */}
          {/* BAGIAN 2: POSISI KEUANGAN (NERACA) */}
          {/* ============================================================== */}
          <div className="mb-4">
            <div className="text-center mb-4">
              <h3 className="font-black text-[12px] uppercase tracking-[0.2em] border-b-2 border-slate-900 pb-1 inline-block">
                2. Neraca (Posisi Keuangan)
              </h3>
              <p className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                Per Tanggal:{" "}
                {new Date(tahun, parseInt(bulan), 0).toLocaleDateString(
                  "id-ID",
                  { day: "2-digit", month: "long", year: "numeric" },
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 px-2">
              {/* SISI KIRI: ASET (AKTIVA) */}
              <div className="flex flex-col">
                {/* Wrapper atas biar konten ngumpul di atas */}
                <div>
                  <h3 className="text-[11px] font-black text-slate-800 border-b-2 border-slate-800 pb-1 mb-2 uppercase tracking-widest">
                    AKTIVA (ASET)
                  </h3>

                  <CategoryHeader title="Aset Lancar & Tetap" />
                  {neraca?.aktiva?.items?.length > 0 ? (
                    neraca.aktiva.items.map((item, idx) => (
                      <ReportRow
                        key={idx}
                        label={item.nama}
                        value={item.saldo}
                        isIndent
                      />
                    ))
                  ) : (
                    <ReportRow label="Tidak ada data aset" value={0} isIndent />
                  )}
                </div>

                {/* mt-auto memaksanya turun ke ujung paling bawah agar sejajar dengan kolom kanan */}
                <div className="mt-auto pt-6">
                  <div className="pt-2 border-t-[3px] border-double border-slate-800">
                    <ReportRow
                      label="TOTAL AKTIVA"
                      value={neraca?.aktiva?.total || 0}
                      isTotal
                    />
                  </div>
                </div>
              </div>

              {/* SISI KANAN: PASIVA (KEWAJIBAN & EKUITAS) */}
              <div className="flex flex-col">
                <div>
                  <h3 className="text-[11px] font-black text-slate-800 border-b-2 border-slate-800 pb-1 mb-2 uppercase tracking-widest">
                    PASIVA (KEWAJIBAN & MODAL)
                  </h3>

                  <CategoryHeader title="Kewajiban (Hutang)" />
                  {neraca?.pasiva?.kewajiban?.items?.length > 0 ? (
                    neraca.pasiva.kewajiban.items.map((item, idx) => (
                      <ReportRow
                        key={idx}
                        label={item.nama}
                        value={item.saldo}
                        isIndent
                      />
                    ))
                  ) : (
                    <ReportRow
                      label="Tidak ada data kewajiban"
                      value={0}
                      isIndent
                    />
                  )}
                  <ReportRow
                    label="Total Kewajiban"
                    value={neraca?.pasiva?.kewajiban?.total || 0}
                    isTotal
                  />

                  <CategoryHeader title="Ekuitas (Modal)" />
                  {neraca?.pasiva?.modal?.items?.length > 0 ? (
                    neraca.pasiva.modal.items.map((item, idx) => (
                      <ReportRow
                        key={idx}
                        label={item.nama}
                        value={item.saldo}
                        isIndent
                      />
                    ))
                  ) : (
                    <ReportRow
                      label="Tidak ada data modal"
                      value={0}
                      isIndent
                    />
                  )}
                  <ReportRow
                    label="Total Ekuitas"
                    value={neraca?.pasiva?.modal?.total || 0}
                    isTotal
                  />
                </div>

                {/* mt-auto memastikan dia sejajar di bawah */}
                <div className="mt-auto pt-6">
                  <div className="pt-2 border-t-[3px] border-double border-slate-800">
                    <ReportRow
                      label="TOTAL PASIVA"
                      value={neraca?.pasiva?.total || 0}
                      isTotal
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* STATUS BALANCE */}
            {neraca && (
              <div
                className={`mt-8 text-center py-2 px-4 border rounded-md max-w-sm mx-auto text-[10px] font-black uppercase tracking-widest ${neraca.is_balance ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}
              >
                {neraca.is_balance
                  ? "✓ STATUS NERACA: SEIMBANG (BALANCED)"
                  : "✗ STATUS NERACA: TIDAK SEIMBANG"}
              </div>
            )}
          </div>
        </ReportDocument>
      )}
    </div>
  );
};

export default LaporanFinansial;
