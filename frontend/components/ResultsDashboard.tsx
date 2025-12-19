"use client";

import { Tab, TabList, TabPanel, Tabs } from "@heroui/react";
import { useMemo, useState } from "react";
import { CompareResponse, IntersectionSelection, Playlist } from "../lib/types";
import { buildPlaylistSets, intersectionKeys, intersectionLabel } from "../lib/setMath";
import { CommonToAll } from "./CommonTab/CommonToAll";
import { SimilarityMatrix } from "./MatrixTab/SimilarityMatrix";
import { SubsetSelector } from "./VennTab/SubsetSelector";
import { VennDiagramCard } from "./VennTab/VennDiagramCard";
import { IntersectionDetailsPanel } from "./VennTab/IntersectionDetailsPanel";

const defaultSubset = (playlists: Playlist[]) => {
  const first = playlists.slice(0, 3).map((p) => p.id);
  return first.length >= 2 ? first : playlists.map((p) => p.id);
};

export function ResultsDashboard({ data }: { data: CompareResponse }) {
  const [activeTab, setActiveTab] = useState("diagram");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    defaultSubset(data.playlists),
  );
  const [selection, setSelection] = useState<IntersectionSelection | null>(null);

  const playlistSets = useMemo(() => {
    const sets = buildPlaylistSets(data.track_keys_by_playlist);
    return new Map(data.playlists.map((playlist, index) => [playlist.id, sets[index]]));
  }, [data.playlists, data.track_keys_by_playlist]);

  const selectionTracks = useMemo(() => {
    if (!selection) return [];
    const sets = selection.playlistIds
      .map((id) => playlistSets.get(id))
      .filter(Boolean) as Set<string>[];
    const keys = intersectionKeys(sets);
    return keys
      .map((key) => data.tracks_index[key])
      .filter(Boolean)
      .sort((a, b) => {
        const artistA = a.artists.join(", ");
        const artistB = b.artists.join(", ");
        if (artistA !== artistB) {
          return artistA.localeCompare(artistB, "ru");
        }
        return a.title.localeCompare(b.title, "ru");
      });
  }, [data.tracks_index, playlistSets, selection]);

  const handleSelectIntersection = (ids: string[], size: number) => {
    const names = ids
      .map((id) => data.playlists.find((playlist) => playlist.id === id)?.title)
      .filter(Boolean) as string[];
    setSelection({ playlistIds: ids, label: intersectionLabel(names), size });
    setActiveTab("intersection");
  };

  return (
    <section className="mt-8 space-y-6">
      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(String(key))}>
        <TabList>
          <Tab id="diagram">Диаграмма</Tab>
          <Tab id="matrix">Матрица</Tab>
          <Tab id="common">Общие для всех</Tab>
          <Tab id="intersection">Треки пересечения</Tab>
        </TabList>
        <TabPanel id="diagram">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <SubsetSelector
                playlists={data.playlists}
                selectedIds={selectedIds}
                onChange={setSelectedIds}
                playlistSets={playlistSets}
                onQuickSelect={setSelectedIds}
              />
              <VennDiagramCard
                playlists={data.playlists}
                selectedIds={selectedIds}
                playlistSets={playlistSets}
                onSelect={handleSelectIntersection}
              />
            </div>
            <IntersectionDetailsPanel
              selection={selection}
              tracks={selectionTracks}
              onClear={() => setSelection(null)}
            />
          </div>
        </TabPanel>
        <TabPanel id="matrix">
          <SimilarityMatrix
            playlists={data.playlists}
            playlistSets={playlistSets}
            onPairSelect={handleSelectIntersection}
          />
        </TabPanel>
        <TabPanel id="common">
          <CommonToAll
            playlists={data.playlists}
            playlistSets={playlistSets}
            tracksIndex={data.tracks_index}
            onSelect={handleSelectIntersection}
          />
        </TabPanel>
        <TabPanel id="intersection">
          <IntersectionDetailsPanel
            selection={selection}
            tracks={selectionTracks}
            onClear={() => setSelection(null)}
            showEmptyState
          />
        </TabPanel>
      </Tabs>
    </section>
  );
}
