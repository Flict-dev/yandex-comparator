import { Track } from "./types";

export const tracksToCsv = (tracks: Track[]) => {
  const headers = ["Title", "Artists", "Duration", "Link"];
  const rows = tracks.map((track) => [
    track.title,
    track.artists.join(", "),
    track.duration_ms.toString(),
    track.link ?? "",
  ]);

  return [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${cell.replaceAll("\"", "\"\"")}"`)
        .join(","),
    )
    .join("\n");
};

export const downloadCsv = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
