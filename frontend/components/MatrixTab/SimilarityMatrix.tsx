"use client";

import {
  Card,
  CardContent,
  CardHeader,
  Chip,
} from "@heroui/react";
import { useMemo } from "react";
import { formatPercent } from "../../lib/format";
import { jaccard, intersectionSize } from "../../lib/setMath";
import { Playlist } from "../../lib/types";

type SimilarityMatrixProps = {
  playlists: Playlist[];
  playlistSets: Map<string, Set<string>>;
  onPairSelect: (ids: string[], size: number) => void;
};

export function SimilarityMatrix({
  playlists,
  playlistSets,
  onPairSelect,
}: SimilarityMatrixProps) {
  const matrix = useMemo(() => {
    return playlists.map((row) =>
      playlists.map((column) => {
        if (row.id === column.id) {
          return { score: 1, size: row.count };
        }
        const setA = playlistSets.get(row.id) || new Set();
        const setB = playlistSets.get(column.id) || new Set();
        return {
          score: jaccard(setA, setB),
          size: intersectionSize([setA, setB]),
        };
      }),
    );
  }, [playlistSets, playlists]);

  const pairs = useMemo(() => {
    const result: Array<{ ids: string[]; size: number; score: number }> = [];
    for (let i = 0; i < playlists.length; i += 1) {
      for (let j = i + 1; j < playlists.length; j += 1) {
        result.push({
          ids: [playlists[i].id, playlists[j].id],
          size: matrix[i][j].size,
          score: matrix[i][j].score,
        });
      }
    }
    return result.sort((a, b) => b.score - a.score).slice(0, 20);
  }, [matrix, playlists]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-1">
        <h3 className="text-lg font-semibold">Матрица сходства</h3>
        <p className="text-sm text-default-500">
          Кликните ячейку, чтобы увидеть пересечение пары.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="hidden overflow-auto md:block">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 bg-content1 text-xs uppercase text-default-500">
              <tr>
                <th className="px-3 py-2 font-medium">Плейлист</th>
                {playlists.map((playlist) => (
                  <th key={playlist.id} className="px-3 py-2 font-medium">
                    {playlist.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {playlists.map((row, rowIndex) => (
                <tr key={row.id} className="border-t border-default-200">
                  <td className="px-3 py-2 font-semibold">{row.title}</td>
                  {playlists.map((column, colIndex) => {
                    const cell = matrix[rowIndex][colIndex];
                    const isDiagonal = row.id === column.id;
                    return (
                      <td key={column.id} className="px-3 py-2">
                        <button
                          type="button"
                          className={`flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition ${
                            isDiagonal
                              ? "cursor-default text-default-500"
                              : "hover:bg-default-100"
                          }`}
                          onClick={() =>
                            !isDiagonal && onPairSelect([row.id, column.id], cell.size)
                          }
                        >
                          <Chip size="sm" variant="flat" color={isDiagonal ? "default" : "primary"}>
                            {formatPercent(cell.score)}
                          </Chip>
                          {!isDiagonal && (
                            <span className="text-xs text-default-500">{cell.size}</span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 md:hidden">
          <h4 className="text-sm font-semibold text-default-500">Топ-пары</h4>
          {pairs.map((pair) => (
            <button
              key={pair.ids.join("-")}
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-default-200 px-3 py-2 text-left"
              onClick={() => onPairSelect(pair.ids, pair.size)}
            >
              <div>
                <p className="text-sm font-semibold">
                  {pair.ids
                    .map((id) => playlists.find((playlist) => playlist.id === id)?.title)
                    .join(" × ")}
                </p>
                <p className="text-xs text-default-500">Пересечение: {pair.size}</p>
              </div>
              <Chip size="sm" color="primary" variant="flat">
                {formatPercent(pair.score)}
              </Chip>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
