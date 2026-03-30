"use server";
import { apiGet, apiPost, apiPatch, apiDelete } from "./apiClient";

const ROOM_URL = process.env.NEXT_PUBLIC_ROOM_URL;

export async function fetchPublicRoomsAction(params: { subject?: string; page?: number } = {}) {
  try {
    const query = new URLSearchParams(params as any).toString();
    const res = await apiGet(`${ROOM_URL}/api/rooms${query ? `?${query}` : ""}`);
    return { success: true, data: res.rooms };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch public rooms" };
  }
}

export async function fetchMyRoomsAction() {
  try {
    const res = await apiGet(`${ROOM_URL}/api/rooms/my-rooms`);
    return { success: true, data: res.rooms };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch your rooms" };
  }
}

export async function fetchRoomByIdAction(roomId: string) {
  try {
    const res = await apiGet(`${ROOM_URL}/api/rooms/${roomId}`);
    return { success: true, data: res.room || res };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch room" };
  }
}

export async function updateRoomAction(roomId: string, data: any) {
  try {
    const res = await apiPatch(`${ROOM_URL}/api/rooms/${roomId}`, data);
    return { success: true, data: res.room || res };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update room" };
  }
}

export async function deleteRoomAction(roomId: string) {
  try {
    await apiDelete(`${ROOM_URL}/api/rooms/${roomId}`);
    return { success: true, roomId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete room" };
  }
}

export async function kickMemberAction(roomId: string, memberId: string) {
  try {
    await apiDelete(`${ROOM_URL}/api/rooms/${roomId}/members/${memberId}`);
    return { success: true, memberId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to kick member" };
  }
}
