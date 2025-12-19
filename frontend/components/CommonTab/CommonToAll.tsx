"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
} from "@heroui/react";
import { useMemo } from "react";
import { formatDuration } from "../../lib/format";
import { intersectionKeys, intersectionLabel } from "../../lib/setMath";
import { Playlist, Track } from "../../lib/types";

type CommonToAllProps = {
  playlists: Playlist[];
  playlistSets: Map<string, Set<string>>;
  tracksIndex: Record<string, Track>;
  onSelect: (ids: string[], size: number) => void;
};

export function CommonToAll({
  playlists,
  playlistSets,
  tracksIndex,
  onSelect,
}: CommonToAllProps) {
  const allIds = playlists.map((playlist) => playlist.id);
  const sets = allIds
    .map((id) => playlistSets.get(id))
    .filter(Boolean) as Set<string>[];
  const keys = useMemo(() => intersectionKeys(sets), [sets]);
  const tracks = keys.map((key) => tracksIndex[key]).filter(Boolean);

  if (tracks.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-default-500">
            Общих треков для всех плейлистов не найдено. Попробуйте выбрать поднабор
            для диаграммы.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-2">
        <div className="flex w-full items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Общие для всех</h3>
            <p className="text-sm text-default-500">
              {intersectionLabel(playlists.map((playlist) => playlist.title))}
            </p>
          </div>
          <Button size="sm" variant="secondary" onPress={() => onSelect(allIds, tracks.length)}>
            Открыть пересечение
          </Button>
        </div>
        <Chip color="primary" variant="flat">
          {tracks.length} треков
        </Chip>
      </CardHeader>
      <CardContent>
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
              {tracks.map((track) => (
                <tr key={track.track_key} className="border-t border-default-200">
                  <td className="px-3 py-2">{track.title}</td>
                  <td className="px-3 py-2">{track.artists.join(", ")}</td>
                  <td className="px-3 py-2">{formatDuration(track.duration_ms)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
