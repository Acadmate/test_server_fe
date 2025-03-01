"use client";
import axios from "axios";

export async function signout() {
  const api_url = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await axios.post(
      `${api_url}/signout`,
      {},
      {
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return null;
  }
}
