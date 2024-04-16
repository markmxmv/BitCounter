import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { coinData } from "../interfaces/coinData.interface";
import { ICoinList } from "../interfaces/coinList.interface";

export const loadList = createAsyncThunk(
  "load-list",
  async (): Promise<coinData[]> => {
    const { data } = await axios.get(`/src/assets/coinList.json`);
    // const { data } = await axios.get(
    //   "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en"
    // );

    return data;
  }
);

const initialState: ICoinList = {
  isLoading: false,
  list: [],
  error: null
};

const coinListSlice = createSlice({
  name: "coinList",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      });
  }
});

export default coinListSlice.reducer;
export const coinListActions = coinListSlice.actions;
