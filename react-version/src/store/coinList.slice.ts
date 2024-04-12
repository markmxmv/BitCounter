import { createSlice } from "@reduxjs/toolkit";

const coinListSlice = createSlice({
  name: "coinList",
  initialState: [],
  reducers: {}
});

export default coinListSlice.reducer;
export const coinListActions = coinListSlice.actions;
