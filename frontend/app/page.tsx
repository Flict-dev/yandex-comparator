"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Separator,
} from "@heroui/react";
import { useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PlaylistLinksInput } from "../components/PlaylistLinksInput";
import { ResultsDashboard } from "../components/ResultsDashboard";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { comparePlaylists } from "../lib/api";
import { buildPlaylistSets, intersectionSize } from "../lib/setMath";
import { CompareResponse } from "../lib/types";
import { playlistsSchema, validatePlaylistUrl } from "../lib/validate";

const normalizeUrls = (urls: string[]) => {
  const trimmed = urls.map((url) => url.trim()).filter(Boolean);
  return Array.from(new Set(trimmed));
};

export default function HomePage() {
  const [urls, setUrls] = useState<string[]>(["", ""]);
  const [data, setData] = useState<CompareResponse | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const formValidation = useMemo(() => {
    const normalized = normalizeUrls(urls);
    const baseErrors = urls.map((value) => {
      if (!value.trim()) return "";
      const validation = validatePlaylistUrl(value);
      return validation.isValid ? "" : validation.errors[0];
    });

    const parsed = playlistsSchema.safeParse(normalized);
    return {
      normalized,
      isValid: parsed.success && baseErrors.every((error) => !error),
      formError: parsed.success ? "" : parsed.error.errors[0]?.message,
    };
  }, [urls]);

  const mutation = useMutation({
    mutationFn: async (payload: string[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      return comparePlaylists(payload, controller.signal);
    },
    onSuccess: (response) => {
      setData(response);
    },
  });

  const handleCompare = () => {
    mutation.mutate(formValidation.normalized);
  };

  const summary = useMemo(() => {
    if (!data) return null;
    const playlistSets = buildPlaylistSets(data.track_keys_by_playlist);
    const totalTracks = data.playlists.reduce((acc, playlist) => acc + playlist.count, 0);
    const commonAll = intersectionSize(playlistSets);
    return {
      totalPlaylists: data.playlists.length,
      totalTracks,
      commonAll,
    };
  }, [data]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Playlist Overlap</h1>
            <p className="text-sm text-default-500">
              Сравнение плейлистов Яндекс.Музыки
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="h-6" aria-hidden="true" />

        <Card>
          <CardHeader>
            <div>
              <h2 className="text-xl font-semibold">Добавьте ссылки</h2>
              <p className="text-sm text-default-500">
                Вставьте минимум 2 ссылки на плейлисты, чтобы сравнить пересечения.
              </p>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4">
            <PlaylistLinksInput values={urls} onChange={setUrls} />
            {formValidation.formError && (
              <p className="text-sm text-danger">{formValidation.formError}</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                onPress={handleCompare}
                isDisabled={!formValidation.isValid || mutation.isPending}
                isLoading={mutation.isPending}
              >
                Сравнить
              </Button>
              {mutation.isError && (
                <span className="text-sm text-danger">
                  {(mutation.error as Error).message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {summary && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Chip color="primary" variant="flat">
              Плейлистов: {summary.totalPlaylists}
            </Chip>
            <Chip color="secondary" variant="flat">
              Всего треков: {summary.totalTracks}
            </Chip>
            <Chip color="success" variant="flat">
              Общих для всех: {summary.commonAll}
            </Chip>
          </div>
        )}

        {mutation.isPending && (
          <div className="mt-6 rounded-2xl border border-default-200 bg-content1 p-6">
            <p className="text-sm text-default-500">Сравниваем плейлисты...</p>
          </div>
        )}

        {data && <ResultsDashboard data={data} />}
      </div>
    </main>
  );
}
