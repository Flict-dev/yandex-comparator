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
        <CardBody>
          <p className="text-sm text-default-500">
            Выберите область пересечения на диаграмме или пару в матрице.
          </p>
        </CardBody>
      </Card>
    );
  }

  if (!selection) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-default-500">
            Кликните по пересечению, чтобы увидеть список треков.
          </p>
        </CardBody>
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
      <CardBody className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" color="primary" onPress={handleCsv}>
            Скачать CSV
          </Button>
          <Button size="sm" variant="flat" onPress={handleCopy}>
            Скопировать список
          </Button>
        </div>
        <ScrollShadow className="max-h-[420px]">
          <Table removeWrapper aria-label="intersection tracks">
            <TableHeader>
              <TableColumn>Трек</TableColumn>
              <TableColumn>Артисты</TableColumn>
              <TableColumn>Длительность</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Нет треков" items={tracks}>
              {(track) => (
                <TableRow key={track.track_key}>
                  <TableCell>
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
                  </TableCell>
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
