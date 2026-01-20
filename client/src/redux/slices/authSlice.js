import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  isLoggedIn: false,
  userData: null,
  isloading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setIsloading: (state, action) => {
      state.isloading = action.payload;
    },

    login: (state, action) => {
      state.isLoggedIn = true;
      state.userData = action.payload;
      state.isloading = false;
    },

    logout: (state) => {
      state.isLoggedIn = false;
      state.userData = null;
      state.isloading = false;
    },

    updateUserData: (state, action) => {
      state.userData = { ...state.userData, ...action.payload };
    }
  },
});

export const { login, logout, updateUserData, setIsloading } = authSlice.actions;
export default authSlice.reducer;
