import { configureStore } from "@reduxjs/toolkit";
import coinListSlice from "./coinList.slice";

export const store = configureStore({
  reducer: {
    coinList: coinListSlice
  },
  devTools: true
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
