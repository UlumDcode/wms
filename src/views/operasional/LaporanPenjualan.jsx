import React, { useState, useEffect } from "react";
import DateRangeFilter from "../../components/DateRangeFilter";
import axiosInstance from "../../utils/axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const LaporanPenjualan = () => {
  const getLocalISODate = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };

  // Default: 7 hari terakhir
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getLocalISODate(d);
  });
  const [endDate, setEndDate] = useState(() => getLocalISODate(new Date()));

  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `analytics_penjualan.php?start=${startDate}&end=${endDate}`
      );
      const json = res.data;

      if (json.status === "success") {
        setAnalyticsData(json.data);
      } else {
        console.error("Backend Error:", json.message);
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error("Fetch gagal:", error);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]); // API_URL is no longer a dependency

  const formatRupiah = (val) => {
    return new Intl.NumberFormat("id-ID").format(val || 0);
  };

  // Hitung nilai tertinggi di trend harian untuk rasio tinggi bar chart
  const maxTrend =
    analyticsData?.daily_trend?.reduce(
      (max, item) => Math.max(max, parseFloat(item?.omzet || 0)),
      0,
    ) || 1;

  // Konfigurasi data untuk Chart.js
  const chartData = {
    labels: analyticsData?.daily_trend?.map((item) => item.tanggal) || [],
    datasets: [
      {
        label: "Omzet Penjualan",
        data: analyticsData?.daily_trend?.map((item) => item.omzet) || [],
        fill: true,
        borderColor: "rgb(37, 99, 235)", // Blue-600
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "y",
      },
      {
        label: "Unit Terjual (Pcs)",
        data:
          analyticsData?.daily_trend?.map(
            (item) => item.qty || item.total_qty || 0,
          ) || [],
        fill: true,
        borderColor: "rgb(16, 185, 129)", // Emerald-600
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: { font: { weight: "bold", size: 10 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw;
            if (context.dataset.label.includes("Omzet")) {
              return `Omzet: Rp ${formatRupiah(val)}`;
            }
            return `Terjual: ${val} Pcs`;
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        beginAtZero: true,
        title: { display: true, text: "Unit (Pcs)", font: { weight: "bold" } },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        title: { display: true, text: "Omzet (Rp)", font: { weight: "bold" } },
        ticks: {
          callback: (value) =>
            value >= 1000000
              ? value / 1000000 + "jt"
              : value >= 1000
                ? value / 1000 + "k"
                : value,
        },
      },
    },
  };

  if (loading && !analyticsData) {
    return (
      <div className="p-4 animate-pulse space-y-6">
        <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 bg-slate-200 rounded-2xl"></div>
          <div className="lg:col-span-1 h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100 space-y-6 relative">
      {/* FUNCTIONAL HEADER */}
      <div className="flex justify-end items-center gap-4">
        <DateRangeFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </div>

      {loading && analyticsData && (
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse z-50"></div>
      )}

      {analyticsData && (
        <>
          {/* SECTION 1: METRICS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:-translate-y-1 transition-all">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Unit Keluar
                </p>
                <h3 className="text-xl md:text-2xl font-black italic text-blue-600">
                  {analyticsData?.metrics?.total_qty_terjual ||
                    analyticsData?.metrics?.total_qty ||
                    0}{" "}
                  <span className="text-[10px] not-italic">Pcs</span>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                📤
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:-translate-y-1 transition-all">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Unit Retur
                </p>
                <h3 className="text-xl md:text-2xl font-black italic text-rose-500">
                  {analyticsData?.metrics?.qty_retur || 0}{" "}
                  <span className="text-[10px] not-italic">Pcs</span>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                🔙
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:-translate-y-1 transition-all">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Total Stok
                </p>
                <h3 className="text-xl md:text-2xl font-black italic text-emerald-600">
                  {analyticsData?.metrics?.total_stok_all || 0}{" "}
                  <span className="text-[10px] not-italic">Pcs</span>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                📦
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:-translate-y-1 transition-all">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Stok Rendah
                </p>
                <h3 className="text-xl md:text-2xl font-black italic text-amber-500">
                  {analyticsData?.metrics?.low_stock_count || 0}{" "}
                  <span className="text-[10px] not-italic">Item</span>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                ⚠️
              </div>
            </div>
          </div>

          {/* SECTION 2: ANALYTICS SPLIT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-0">
            {/* Kiri: Trend Unit Terjual (Line Chart) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
              <h3 className="font-black italic uppercase text-xs mb-6 text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3 tracking-widest">
                📊 Tren Pergerakan Stok (Unit)
              </h3>
              <div className="flex-1 min-h-[250px]">
                {analyticsData?.daily_trend?.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 italic">
                    Tidak ada pergerakan barang di periode ini.
                  </div>
                )}
              </div>
            </div>

            {/* Kanan: Top Produk */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-black italic uppercase text-xs mb-4 text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3 tracking-widest">
                🔥 Produk Paling Laris
              </h3>
              <div className="space-y-3">
                {analyticsData?.top_products &&
                  analyticsData.top_products.length > 0 ? (
                  analyticsData.top_products.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 flex shrink-0 items-center justify-center rounded-lg font-black text-xs ${idx === 0 ? "bg-amber-100 text-amber-600" : idx === 1 ? "bg-slate-200 text-slate-600" : idx === 2 ? "bg-orange-100 text-orange-600" : "bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-600"}`}
                      >
                        #{idx + 1}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-black text-[10px] md:text-xs text-slate-800 dark:text-slate-200 uppercase italic truncate">
                          {item?.nama_barang || "Produk Tanpa Nama"}
                        </p>
                        <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 truncate">
                          {item?.kode_barang || "UMUM"}
                        </p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-1 rounded-md text-[9px] font-black tracking-widest whitespace-nowrap">
                        {item?.total_terjual || item?.total_qty || 0} Pcs
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs font-bold text-slate-400 italic">
                    Belum ada produk yang terjual.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LaporanPenjualan;
