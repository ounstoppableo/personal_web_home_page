import { createSlice } from "@reduxjs/toolkit";

export const dialogSlice = createSlice({
  name: "dialog",
  initialState: {
    movingOrResizing: false,
  },
  reducers: {
    setMovingOrResizing: (state, action) => {
      state.movingOrResizing = action.payload;
    },
  },
});

export const { setMovingOrResizing } = dialogSlice.actions;

export default dialogSlice.reducer;
