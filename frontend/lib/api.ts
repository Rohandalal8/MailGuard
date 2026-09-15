import axios from "axios";
import { auth } from "../firebase/auth";

export const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api" });
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) config.headers.Authorization = `Bearer ${await user.getIdToken()}`;
  return config;
});

export const apiData = async <T>(request: Promise<{ data: { success: boolean; data: T } }>): Promise<T> => (await request).data.data;