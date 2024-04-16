import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IChosenCoin } from "../interfaces/chosenCoin.interface";
import axios from "axios";
import { ICoinDataForWebSite } from "../interfaces/coinDataForWebSite.interface";

const initialState: IChosenCoin = {
  symbol: "btc",
  website: "http://www.bitcoin.org",
  isLoading: false
};

export const loadCoinWebsite = createAsyncThunk(
  "load-coin-website",
  async (/*coin*/) => {
    const { data } = await axios.get(`../../../static/bitcoin.json`);
    // const { data } = await axios.get(
    //   `https://api.coingecko.com/api/v3/coins/${coin}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`
    // );
    return data;
  }
);

const chosenCoinSlice = createSlice({
  name: "chosenCoinSlice",
  initialState,
  reducers: {
    changeCoin: (state, action: PayloadAction<string>) => {
      state.symbol = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCoinWebsite.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        loadCoinWebsite.fulfilled,
        (state, action: PayloadAction<ICoinDataForWebSite>) => {
          state.isLoading = false;
          if (action.payload.links) {
            const homepage = action.payload.links.homepage;
            state.website = homepage[0];
          }
        }
      );
  }
});

export default chosenCoinSlice.reducer;
export const chosenCoinActions = chosenCoinSlice.actions;
