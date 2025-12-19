import { CompareResponse } from "./types";

export async function comparePlaylists(
  playlistUrls: string[],
  signal?: AbortSignal,
): Promise<CompareResponse> {
  const response = await fetch("/compare", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ playlist_urls: playlistUrls }),
    signal,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Ошибка сравнения");
  }

  return response.json();
}
