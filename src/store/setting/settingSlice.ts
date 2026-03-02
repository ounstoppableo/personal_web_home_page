import { createSlice } from "@reduxjs/toolkit";

type SettingInitiate = {
  appOpenMethod: "inner" | "outer";
  darkMode: boolean;
};

export const getDarkMode = () => {
  const localDarkMode = localStorage.getItem("darkMode");
  return localDarkMode === "true"
    ? true
    : localDarkMode === "false"
      ? false
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
};
export const settingSlice = createSlice({
  name: "setting",
  initialState: {
    appOpenMethod: "inner",
    darkMode: getDarkMode(),
  } as SettingInitiate,
  reducers: {
    setAppOpenMethod: (
      state,
      action: { payload: SettingInitiate["appOpenMethod"] },
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
