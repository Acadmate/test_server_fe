"use client";
import axios from "axios";

export async function fetchAttendance() {
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await axios.post(
      `${api_url}/attendance`,
      {},
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return null;
  }
}
