import { createSlice } from "@reduxjs/toolkit";

type SettingInitiate = {
  appOpenMethod: "inner" | "outer";
  darkMode: boolean;
};
export const settingSlice = createSlice({
  name: "setting",
  initialState: {
    appOpenMethod: "inner",
    darkMode: false,
  } as SettingInitiate,
  reducers: {
    setAppOpenMethod: (
      state,
      action: { payload: SettingInitiate["appOpenMethod"] }
    ) => {
      state.appOpenMethod = action.payload;
    },
    setDarkMode: (state, action: { payload: SettingInitiate["darkMode"] }) => {
      state.darkMode = action.payload;
    },
  },
});

export const { setAppOpenMethod, setDarkMode } = settingSlice.actions;

export default settingSlice.reducer;
