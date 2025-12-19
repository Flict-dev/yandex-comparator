"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
} from "@heroui/react";
import { downloadCsv, tracksToCsv } from "../../lib/csv";
import { formatDuration } from "../../lib/format";
import { IntersectionSelection, Track } from "../../lib/types";

type IntersectionDetailsPanelProps = {
  selection: IntersectionSelection | null;
  tracks: Track[];
  onClear: () => void;
  showEmptyState?: boolean;
};

export function IntersectionDetailsPanel({
  selection,
  tracks,
  onClear,
  showEmptyState = false,
}: IntersectionDetailsPanelProps) {
  const handleCopy = async () => {
    const content = tracks.map((track) => `${track.artists.join(", ")} — ${track.title}`).join("\n");
    await navigator.clipboard.writeText(content);
  };

  const handleCsv = () => {
    const csv = tracksToCsv(tracks);
    downloadCsv("intersection.csv", csv);
  };

  if (!selection && showEmptyState) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-default-500">
            Выберите область пересечения на диаграмме или пару в матрице.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!selection) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-default-500">
            Кликните по пересечению, чтобы увидеть список треков.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-2">
        <div className="flex w-full items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Пересечение</h3>
            <p className="text-sm text-default-500">{selection.label}</p>
          </div>
          <Button size="sm" variant="light" onPress={onClear}>
            Сбросить
          </Button>
        </div>
        <Chip color="primary" variant="flat">
          {selection.size} треков
        </Chip>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="primary" onPress={handleCsv}>
            Скачать CSV
          </Button>
          <Button size="sm" variant="flat" onPress={handleCopy}>
            Скопировать список
          </Button>
        </div>
        <div className="max-h-[420px] overflow-auto rounded-lg border border-default-200">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-content1 text-xs uppercase text-default-500">
              <tr>
                <th className="px-3 py-2 font-medium">Трек</th>
                <th className="px-3 py-2 font-medium">Артисты</th>
                <th className="px-3 py-2 font-medium">Длительность</th>
              </tr>
            </thead>
            <tbody>
              {tracks.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-default-500" colSpan={3}>
                    Нет треков
                  </td>
                </tr>
              ) : (
                tracks.map((track) => (
                  <tr key={track.track_key} className="border-t border-default-200">
                    <td className="px-3 py-2">
                      {track.link ? (
                        <a
                          href={track.link}
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {track.title}
                        </a>
                      ) : (
                        track.title
                      )}
                    </td>
                    <td className="px-3 py-2">{track.artists.join(", ")}</td>
                    <td className="px-3 py-2">{formatDuration(track.duration_ms)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
