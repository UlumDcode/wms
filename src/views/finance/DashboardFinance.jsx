import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement, // For Line Chart
  LineElement, // For Line Chart
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2"; // Change Bar to Line

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement, // For Line Chart
  LineElement, // For Line Chart
  Title,
  Tooltip,
  Legend,
);

const DashboardFinance = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    total_kas: 0,
    total_piutang: 0,
    total_utang: 0,
    laba_bulan_ini: 0,
    cash_trends: [],
  });
  const [storeName, setStoreName] = useState("Toko");
  const [loading, setLoading] = useState(true);

  const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("finance/dashboard.php");
      const json = res.data;
      if (json && json.status === "success") {
        setMetrics(json.data);
      } else {
        window.showToast(
          json?.message || "Gagal memuat data dashboard",
          "error",
        );
      }
    } catch (error) {
      window.showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreName = async () => {
    try {
      const res = await axiosInstance.get("settings.php?action=get_store");
      const data = res.data;
      if (data && data.nama_toko) {
        setStoreName(data.nama_toko);
      }
    } catch (e) {
      console.error("Gagal load nama toko");
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchStoreName();
  }, []);

  const handleCardClick = (path) => {
    navigate(path);
  };

  // Setup Chart Data
  const chartData = {
    labels: metrics.cash_trends.map((t) => t.month),
    datasets: [
      {
        label: "Uang Masuk",
        data: metrics.cash_trends.map((t) => t.masuk),
        backgroundColor: "rgba(16, 185, 129, 0.8)", // Emerald 500
        borderRadius: 8,
      },
      {
        label: "Uang Keluar",
        data: metrics.cash_trends.map((t) => t.keluar),
        backgroundColor: "rgba(244, 63, 94, 0.8)", // Rose 500
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { weight: "bold", family: "Inter" } },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="p-2 md:p-4 animate-in fade-in duration-500 h-full flex flex-col min-h-0 text-slate-900">
      {/* HEADER */}
      {/* <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
          Dashboard <span className="text-blue-600">Finance</span>
        </h2>
        <p className="font-bold text-[9px] md:text-[10px] tracking-[0.3em] uppercase mt-1.5 md:mt-2 text-slate-400">
          Ringkasan metrik keuangan dewa {storeName}.
        </p>
      </div> */}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6 animate-pulse">
          <div className="bg-slate-100 p-5 rounded-2xl h-32"></div>
          <div className="bg-slate-100 p-5 rounded-2xl h-32"></div>
          <div className="bg-slate-100 p-5 rounded-2xl h-32"></div>
          <div className="bg-slate-100 p-5 rounded-2xl h-32"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
          {/* Card 1: Total Kas & Bank */}
          <div
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:-translate-y-1 transition-all group"
            onClick={() => handleCardClick("/finance/buku-kas-global")}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Total Kas & Bank
            </p>
            <h3 className="text-xl md:text-2xl font-black italic text-emerald-600 leading-none">
              {formatRupiah(metrics.total_kas)}
            </h3>
            <div className="mt-3 text-right text-emerald-500 group-hover:text-emerald-700 transition-colors">
              <span className="font-bold text-[8px] uppercase tracking-widest">
                Lihat Detail →
              </span>
            </div>
          </div>

          {/* Card 2: Laba Bulan Ini */}
          <div
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:-translate-y-1 transition-all group"
            onClick={() => handleCardClick("/finance/laporan")} // Assuming /finance/laporan will show Laba Rugi tab
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Laba Bulan Ini
            </p>
            <h3
              className={`text-xl md:text-2xl font-black italic leading-none ${metrics.laba_bulan_ini >= 0 ? "text-blue-600" : "text-rose-600"}`}
            >
              {formatRupiah(metrics.laba_bulan_ini)}
            </h3>
            <div className="mt-3 text-right text-blue-500 group-hover:text-blue-700 transition-colors">
              <span className="font-bold text-[8px] uppercase tracking-widest">
                Lihat Detail →
              </span>
            </div>
          </div>

          {/* Card 3: Total Piutang */}
          <div
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:-translate-y-1 transition-all group"
            onClick={() => handleCardClick("/finance/utang-piutang")}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Total Piutang
            </p>
            <h3 className="text-xl md:text-2xl font-black italic text-amber-600 leading-none">
              {formatRupiah(metrics.total_piutang)}
            </h3>
            <div className="mt-3 text-right text-amber-500 group-hover:text-amber-700 transition-colors">
              <span className="font-bold text-[8px] uppercase tracking-widest">
                Lihat Detail →
              </span>
            </div>
          </div>

          {/* Card 4: Total Utang */}
          <div
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:-translate-y-1 transition-all group"
            onClick={() => handleCardClick("/finance/utang-piutang")}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Total Utang
            </p>
            <h3 className="text-xl md:text-2xl font-black italic text-rose-600 leading-none">
              {formatRupiah(metrics.total_utang)}
            </h3>
            <div className="mt-3 text-right text-rose-500 group-hover:text-rose-700 transition-colors">
              <span className="font-bold text-[8px] uppercase tracking-widest">
                Lihat Detail →
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CHART SECTION */}
      {!loading && (
        <div className="mt-8 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex-1 min-h-[350px] flex flex-col">
          <h3 className="font-black italic uppercase text-xs mb-6 text-slate-800 tracking-tight">
            📊 Perbandingan Arus Kas (6 Bulan Terakhir)
          </h3>
          <div className="flex-1">
            <Line data={chartData} options={chartOptions} />{" "}
            {/* Change Bar to Line */}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFinance;
