"use client";
import axios from "axios";

export async function fetchLogs() {
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await axios.get(`${api_url}/logs`, {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching logs:", error);
    return null;
  }
}
