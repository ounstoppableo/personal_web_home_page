import { configureStore } from "@reduxjs/toolkit";
import dialogReducer from "./dialog/dialogSlice";

export default configureStore({
  reducer: {
    dialog: dialogReducer,
  },
});
