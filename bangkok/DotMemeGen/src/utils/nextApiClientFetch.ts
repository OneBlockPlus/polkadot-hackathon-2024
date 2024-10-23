"use client";

import MESSAGES from "./messsages";

async function nextApiClientFetch<T>(
  url: string,
  data?: { [key: string]: unknown },
  method?: "GET" | "POST",
): Promise<{ data?: T; error?: string }> {
  const headers: Record<string, string> = {
    "x-network": process.env.PUBLIC_NETWORK || "polkadot",
  };

  const response = await fetch(`${window.location.origin}/${url}`, {
    body: data instanceof FormData ? data : JSON.stringify(data),
    credentials: "include",
    headers,
    method: method || "POST",
  });

  const resJSON = await response.json();

  if (response.status === 200) {
    return {
      data: resJSON as T,
    };
  }

  return {
    error: resJSON.message || MESSAGES.API_FETCH_ERROR,
  };
}

export default nextApiClientFetch;
