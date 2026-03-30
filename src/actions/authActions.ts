"use server";
import { apiGet, apiPost } from "./apiClient";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL;

export async function fetchCurrentUserAction() {
  try {
    const res = await apiGet(`${AUTH_URL}/api/auth/current-user`);
    return { success: true, user: res.user };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch current user" };
  }
}

export async function logoutUserAction() {
  try {
    await apiGet(`${AUTH_URL}/api/auth/logout`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to logout" };
  }
}

export async function loginAction(data: any) {
  try {
    const res = await apiPost(`${AUTH_URL}/api/auth/login`, data);
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || "Login failed" };
  }
}

export async function registerAction(data: any) {
  try {
    const res = await apiPost(`${AUTH_URL}/api/auth/register`, data);
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || "Registration failed" };
  }
}
