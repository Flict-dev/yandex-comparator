"use client";

import { Button, Chip, Select, SelectItem } from "@heroui/react";
import { useMemo } from "react";
import { Playlist } from "../../lib/types";
import { jaccard, intersectionSize } from "../../lib/setMath";

type SubsetSelectorProps = {
  playlists: Playlist[];
  selectedIds: string[];
  playlistSets: Map<string, Set<string>>;
  onChange: (ids: string[]) => void;
  onQuickSelect: (ids: string[]) => void;
};

const clampSelection = (ids: string[]) => ids.slice(0, 5);

export function SubsetSelector({
  playlists,
  selectedIds,
  playlistSets,
  onChange,
  onQuickSelect,
}: SubsetSelectorProps) {
  const items = playlists.map((playlist) => ({
    key: playlist.id,
    label: playlist.title,
  }));

  const topSimilar = useMemo(() => {
    if (playlists.length < 2) return [];
    let bestPair: [string, string] | null = null;
    let bestScore = 0;
    for (let i = 0; i < playlists.length; i += 1) {
      for (let j = i + 1; j < playlists.length; j += 1) {
        const a = playlistSets.get(playlists[i].id) || new Set();
        const b = playlistSets.get(playlists[j].id) || new Set();
        const score = jaccard(a, b);
        if (score > bestScore) {
          bestScore = score;
          bestPair = [playlists[i].id, playlists[j].id];
        }
      }
    }

    if (!bestPair) return [];
    const remaining = playlists
      .filter((playlist) => !bestPair?.includes(playlist.id))
      .sort((a, b) => {
        const setA = playlistSets.get(a.id) || new Set();
        const setB = playlistSets.get(b.id) || new Set();
        return setB.size - setA.size;
      })
      .slice(0, 1)
      .map((playlist) => playlist.id);
    return [...bestPair, ...remaining];
  }, [playlists, playlistSets]);

  const topBySize = useMemo(() => {
    return playlists
      .slice()
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((playlist) => playlist.id);
  }, [playlists]);

  const handleSelectionChange = (keys: Set<string>) => {
    const next = clampSelection(Array.from(keys));
    if (next.length < 2) return;
    onChange(next);
  };

  const selectedLabel = selectedIds
    .map((id) => playlists.find((playlist) => playlist.id === id)?.title)
    .filter(Boolean)
    .join(", ");

  const intersectionCount = useMemo(() => {
    const sets = selectedIds
      .map((id) => playlistSets.get(id))
      .filter(Boolean) as Set<string>[];
    return intersectionSize(sets);
  }, [playlistSets, selectedIds]);

  return (
    <div className="rounded-2xl border border-default-200 bg-content1 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Подмножество для диаграммы</h3>
          <p className="text-sm text-default-500">
            Выберите от 2 до 5 плейлистов. Сейчас выбрано: {selectedLabel || "—"}
          </p>
        </div>
        <Chip color="primary" variant="flat">
          Общих треков: {intersectionCount}
        </Chip>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Select
          selectionMode="multiple"
          selectedKeys={new Set(selectedIds)}
          onSelectionChange={(keys) => handleSelectionChange(keys as Set<string>)}
          label="Плейлисты"
          description="Диаграмма строится для выбранных плейлистов"
        >
          {items.map((item) => (
            <SelectItem key={item.key}>{item.label}</SelectItem>
          ))}
        </Select>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="flat" onPress={() => onQuickSelect(topSimilar)}>
            Самые похожие 3
          </Button>
          <Button
            size="sm"
            variant="flat"
            onPress={() => onQuickSelect(playlists.slice(0, 3).map((p) => p.id))}
          >
            Первые 3
          </Button>
          <Button size="sm" variant="flat" onPress={() => onQuickSelect(topBySize)}>
            Топ-5 по размеру
          </Button>
        </div>
      </div>
    </div>
  );
}
