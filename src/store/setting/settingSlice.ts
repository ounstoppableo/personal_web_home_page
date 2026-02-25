import { createSlice } from "@reduxjs/toolkit";

type SettingInitiate = {
  appOpenMethod: "inner" | "outer";
};
export const settingSlice = createSlice({
  name: "setting",
  initialState: {
    appOpenMethod: "inner",
  } as SettingInitiate,
  reducers: {
    setAppOpenMethod: (
      state,
      action: { payload: SettingInitiate["appOpenMethod"] }
    ) => {
      state.appOpenMethod = action.payload;
    },
  },
});

export const { setAppOpenMethod } = settingSlice.actions;

export default settingSlice.reducer;
