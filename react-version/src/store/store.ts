import { compose, configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: {
    compose
  }
});
