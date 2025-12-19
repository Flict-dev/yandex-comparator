"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  ScrollShadow,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
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
        <CardBody>
          <p className="text-sm text-default-500">
            Общих треков для всех плейлистов не найдено. Попробуйте выбрать поднабор
            для диаграммы.
          </p>
        </CardBody>
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
          <Button size="sm" variant="flat" onPress={() => onSelect(allIds, tracks.length)}>
            Открыть пересечение
          </Button>
        </div>
        <Chip color="primary" variant="flat">
          {tracks.length} треков
        </Chip>
      </CardHeader>
      <CardBody>
        <ScrollShadow className="max-h-[420px]">
          <Table removeWrapper aria-label="Common tracks">
            <TableHeader>
              <TableColumn>Трек</TableColumn>
              <TableColumn>Артисты</TableColumn>
              <TableColumn>Длительность</TableColumn>
            </TableHeader>
            <TableBody items={tracks}>
              {(track) => (
                <TableRow key={track.track_key}>
                  <TableCell>{track.title}</TableCell>
                  <TableCell>{track.artists.join(", ")}</TableCell>
                  <TableCell>{formatDuration(track.duration_ms)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollShadow>
      </CardBody>
    </Card>
  );
}
