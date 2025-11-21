import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";
import { setUser } from "./authSlice";

export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { username, password }: { username: string; password: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await api.post("/auth/login", { username, password });
      // Set user directly from login response to avoid race condition
      dispatch(setUser(response.data.user));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);
