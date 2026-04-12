import { configureStore } from "@reduxjs/toolkit";

import { adminReducer } from "@/store/slices/admin";
import { authReducer } from "@/store/slices/auth";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
