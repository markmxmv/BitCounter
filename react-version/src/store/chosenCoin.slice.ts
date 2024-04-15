import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IChosenCoin } from "../interfaces/chosenCoin.interface";

const initialState: IChosenCoin = {
  symbol: "btc"
};

const chosenCoinSlice = createSlice({
  name: "chosenCoinSlice",
  initialState,
  reducers: {
    changeCoin: (state, action: PayloadAction<string>) => {
      state.symbol = action.payload;
    }
  }
});

export default chosenCoinSlice.reducer;
export const chosenCoinActions = chosenCoinSlice.actions;
