import { configureStore } from "@reduxjs/toolkit";
import dialogReducer from "./dialog/dialogSlice";
import settingReducer from "./setting/settingSlice";

export default configureStore({
  reducer: {
    dialog: dialogReducer,
    setting: settingReducer,
  },
});
