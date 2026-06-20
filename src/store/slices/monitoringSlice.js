import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

export const scanResiForRetur = createAsyncThunk(
  "monitoring/scanResiForRetur",
  async (resi, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `pos.php?action=get_order_by_resi&resi=${encodeURIComponent(resi)}`
      );
      const data = res.data;
      if (data.status === "success") {
        return data.data;
      } else {
        return rejectWithValue(data.message || "Order tidak ditemukan");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal melakukan query resi"
      );
    }
  }
);

const monitoringSlice = createSlice({
  name: "monitoring",
  initialState: {
    activeReturOrder: null,
    isReturModalOpen: false,
    loading: false,
    error: null,
  },
  reducers: {
    setReturModalOpen: (state, action) => {
      state.isReturModalOpen = action.payload;
    },
    setActiveReturOrder: (state, action) => {
      state.activeReturOrder = action.payload;
    },
    clearReturState: (state) => {
      state.activeReturOrder = null;
      state.isReturModalOpen = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(scanResiForRetur.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scanResiForRetur.fulfilled, (state, action) => {
        state.loading = false;
        state.activeReturOrder = action.payload;
        state.isReturModalOpen = true;
      })
      .addCase(scanResiForRetur.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setReturModalOpen, setActiveReturOrder, clearReturState } =
  monitoringSlice.actions;
export default monitoringSlice.reducer;
