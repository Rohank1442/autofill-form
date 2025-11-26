"use client";

import { useState } from "react";
// import { apiGet } from "../lib/http";

export default function Home() {
  const [message, setMessage] = useState("");

  async function checkConnection() {
    try {
    //   const res = await apiGet("/api/v1/health");
    //   setMessage(JSON.stringify(res));
    } catch (err: any) {
      setMessage("Error: " + err.message);
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Frontend → Backend Test</h1>

      <button
        onClick={checkConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Check Server Status
      </button>

      <p className="mt-4">{message}</p>
    </main>
  );
}
