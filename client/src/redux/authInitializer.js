import axios from "axios";
import Cookies from "js-cookie";
import { login, logout } from "./slices/authSlice";
import { BASE_URL } from "../lib/lib";

export const authInitializer = async (dispatch) => {
  try {
    // 1. Check token inside Cookie
    const token = Cookies.get("token");
    if (!token) return; // No token → no login

    const res = await axios.get(`${BASE_URL}api/employees/empdata`, {
      withCredentials: true,
    });

    dispatch(login(res.data));
  } catch (error) {
    console.error("Auth initialization failed:", error);
    dispatch(logout());
  }
};
