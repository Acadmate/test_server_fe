"use client";
import Title from "@/components/shared/title";
// import { useState, useEffect, useCallback } from "react";
// import { fetchLogs } from "@/actions/logsFetch";

interface LogCard {
  type: string;
  activity: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export default async function Main() {
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  try {
    const cookieHeader = new Headers().get("cookie") || "";

    const response = await fetch(`${api_url}/logs`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`);
    }

    const logData: LogCard[] = await response.json();

    return (
      <div className="flex flex-col w-full">
        {logData.map((log, index) => (
          <div key={index} className="bg-gray-800 p-4 mb-2 rounded">
            <p>Type: {log.type}</p>
            <p>Activity: {log.activity}</p>
            <p>Timestamp: {log.timestamp}</p>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error fetching logs:", error);
    return (
      <div className="flex flex-col w-full">
        <Title />
        <div className="text-red-500 p-4">
          {error instanceof Error
            ? error.message
            : "Error loading logs. Please try again later."}
        </div>
      </div>
    );
  }
}
