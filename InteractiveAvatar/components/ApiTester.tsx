"use client";

import { useState } from "react";

export default function ProductApiTester() {
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendRequest = async () => {
    setResponse(null);
    setError(null);

    try {
      const res = await fetch("/api/proxy-fenicio", {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">API Tester</h2>

      <button
        onClick={handleSendRequest}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
      >
        Send Request
      </button>

      {response && (
        <pre className="mt-4 p-4 bg-white text-sm text-gray-800 rounded overflow-auto">
          {response}
        </pre>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-200 text-red-800 rounded">
          Error: {error}
        </div>
      )}
    </div>
  );
}
