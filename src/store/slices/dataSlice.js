import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// Thunk untuk mengambil data global secara berurutan menggunakan Axios
export const fetchGlobalData = createAsyncThunk(
  "data/fetchGlobalData",
  async (_, { rejectWithValue }) => {
    try {
      // Mengambil data global melalui satu endpoint init_data untuk mengurangi koneksi DB
      const res = await axiosInstance.get("/settings.php?action=init_data");
      const data = res.data || {};

      const items = Array.isArray(data.items) ? data.items : [];
      const channels = Array.isArray(data.channels) ? data.channels : [];
      const stores = Array.isArray(data.stores) ? data.stores : [];
      const rekening = Array.isArray(data.rekening) ? data.rekening : [];
      const store =
        typeof data.store === "object" && data.store ? data.store : {};
      const syncHealth =
        typeof data.sync_health === "object" && data.sync_health
          ? data.sync_health
          : {};

      return { items, channels, stores, rekening, store, syncHealth };
    } catch (error) {
      console.error("Gagal melakukan sinkronisasi database via Redux:", error);
      return rejectWithValue(
        error.response?.data?.message || "Gagal sinkron database!",
      );
    }
  },
);

// Thunk ringan untuk refresh rekening saja (setelah mutasi keuangan)
export const fetchRekening = createAsyncThunk(
  "data/fetchRekening",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/finance/rekening.php?action=read");
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      return rejectWithValue("Gagal fetch rekening");
    }
  },
);

const dataSlice = createSlice({
  name: "data",
  initialState: {
    items: [],
    channels: [],
    stores: [],
    rekening: [],
    store: {},
    syncHealth: {},
    loading: false,
    error: null,
  },
  reducers: {
    // Reducer lokal untuk memutasi state secara instan tanpa memicu API fetch ulang
    setItems: (state, action) => {
      state.items = action.payload;
    },
    setChannels: (state, action) => {
      state.channels = action.payload;
    },
    setStores: (state, action) => {
      state.stores = action.payload;
    },
    setRekening: (state, action) => {
      state.rekening = action.payload;
    },
    updateItemStock: (state, action) => {
      // payload: { id, qty } atau { barang_id, stok }
      const { id, qty } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.stok = qty;
      }
    },
    // Batch update stok setelah checkout/inbound (hemat 1 fetchGlobalData = 4 API calls)
    updateMultipleItemStocks: (state, action) => {
      // payload: [{ id, qtyChange }] — qtyChange bisa negatif (outbound) atau positif (inbound)
      const changes = action.payload;
      for (const { id, qtyChange } of changes) {
        const item = state.items.find((i) => String(i.id) === String(id));
        if (item) {
          item.stok = Math.max(0, parseInt(item.stok || 0) + qtyChange);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalData.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.channels = action.payload.channels;
        state.stores = action.payload.stores;
        state.rekening = action.payload.rekening;
        state.store = action.payload.store;
        state.syncHealth = action.payload.syncHealth;
      })
      .addCase(fetchGlobalData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchRekening (ringan)
      .addCase(fetchRekening.fulfilled, (state, action) => {
        state.rekening = action.payload;
      });
  },
});

export const {
  setItems,
  setChannels,
  setStores,
  setRekening,
  updateItemStock,
  updateMultipleItemStocks,
} = dataSlice.actions;
export default dataSlice.reducer;
