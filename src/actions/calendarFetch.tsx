"use client";
import axios from "axios";

export async function fetchCalender() {
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await axios.post(
      `${api_url}/calendar`,
      {},
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (err) {
    console.log("error fetching calendar", err);
    return null;
  }
}
