"use server";
import { apiGet, apiPost } from "./apiClient";

const SESSION_URL = process.env.NEXT_PUBLIC_SESSION_URL;

export async function fetchStatsAction() {
  try {
    const res = await apiGet(`${SESSION_URL}/api/sessions/stats`);
    return { success: true, stats: res.stats };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch stats" };
  }
}

export async function fetchChartDataAction(range: "week" | "month") {
  try {
    const res = await apiGet(`${SESSION_URL}/api/sessions/charts?range=${range}`);
    return { success: true, data: res.data };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch chart data" };
  }
}

export async function fetchHistoryAction(params: { page?: number; limit?: number } = {}) {
  try {
    const query = new URLSearchParams(params as any).toString();
    const res = await apiGet(`${SESSION_URL}/api/sessions/history${query ? `?${query}` : ""}`);
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch history" };
  }
}

export async function endSessionAction(roomId: string) {
  try {
    const res = await apiPost(`${SESSION_URL}/api/sessions/end`, { roomId });
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to end session" };
  }
}
