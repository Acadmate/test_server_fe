"use client";
import axios from "axios";

export async function fetchOrder() {
  const api_url = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await axios.post(
      `${api_url}/order`,
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
    console.error("Error fetching Order:", error);
    return null;
  }
}
