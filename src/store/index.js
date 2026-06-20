import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import dataReducer from "./slices/dataSlice";
import monitoringReducer from "./slices/monitoringSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    data: dataReducer,
    monitoring: monitoringReducer,
  },
});

export default store;
