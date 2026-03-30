"use server";
import { cookies } from "next/headers";

async function getCookiesString() {
  const cookieStore = await cookies();
  return cookieStore.toString();
}

async function createRequest(url: string, options: RequestInit = {}) {
  const cookieString = await getCookiesString();
  
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (cookieString) {
    headers.set("Cookie", cookieString);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle empty responses
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function apiGet(url: string, options?: RequestInit) {
  return createRequest(url, { ...options, method: "GET" });
}

export async function apiPost(url: string, body?: any, options?: RequestInit) {
  return createRequest(url, { ...options, method: "POST", body: JSON.stringify(body) });
}

export async function apiPatch(url: string, body?: any, options?: RequestInit) {
  return createRequest(url, { ...options, method: "PATCH", body: JSON.stringify(body) });
}

export async function apiDelete(url: string, options?: RequestInit) {
  return createRequest(url, { ...options, method: "DELETE" });
}
