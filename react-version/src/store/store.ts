import { configureStore } from "@reduxjs/toolkit";
import coinListSlice from "./coinList.slice";
import chosenCoinSlice from "./chosenCoin.slice";

export const store = configureStore({
  reducer: {
    coinList: coinListSlice,
    chosenCoin: chosenCoinSlice
  },
  devTools: true
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
