"use client";

import { Card, CardContent, CardHeader } from "@heroui/react";
import { useEffect, useMemo, useRef } from "react";
import { buildVennSets } from "../../lib/setMath";
import { Playlist } from "../../lib/types";

type VennDiagramCardProps = {
  playlists: Playlist[];
  selectedIds: string[];
  playlistSets: Map<string, Set<string>>;
  onSelect: (ids: string[], size: number) => void;
};

const palette = ["#22c55e", "#3b82f6", "#f97316", "#ec4899", "#8b5cf6"];

export function VennDiagramCard({
  playlists,
  selectedIds,
  playlistSets,
  onSelect,
}: VennDiagramCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const sets = useMemo(
    () => buildVennSets(selectedIds, playlistSets),
    [playlistSets, selectedIds],
  );

  const legend = useMemo(
    () =>
      selectedIds.map((id, index) => ({
        id,
        name: playlists.find((playlist) => playlist.id === id)?.title ?? id,
        color: palette[index % palette.length],
      })),
    [playlists, selectedIds],
  );

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    legend.forEach((item) => map.set(item.id, item.color));
    return map;
  }, [legend]);

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      if (!containerRef.current || !isMounted) return;
      const container = containerRef.current;
      container.innerHTML = "";

      const venn = await import("@upsetjs/venn.js");
      const d3 = await import("d3");

      const chart = venn.VennDiagram();
      const selection = d3.select(container).datum(sets).call(chart as any);

      selection.selectAll(".venn-area path").style("fill-opacity", 0.4);
      selection.selectAll(".venn-area").each(function (datum: any) {
        if (datum.sets.length === 1) {
          const color = colorMap.get(datum.sets[0]);
          if (color) {
            d3.select(this).select("path").style("fill", color);
          }
        }
      });
      selection
        .selectAll(".venn-area")
        .select("text")
        .style("fill", "#0f172a")
        .style("font-size", "14px");

      selection
        .select("svg")
        .attr("width", "100%")
        .attr("height", 420);

      const tooltip = d3.select(tooltipRef.current);

      selection.selectAll("g").on("mouseover", function (event, datum: any) {
        venn.sortAreas(selection, datum);
        d3.select(this).transition().style("fill-opacity", 0.7);
        tooltip
          .style("opacity", 1)
          .text(`${datum.sets.join(" ∩ ")}: ${datum.size}`)
          .style("left", `${event.offsetX}px`)
          .style("top", `${event.offsetY}px`);
      });

      selection.selectAll("g").on("mousemove", function (event) {
        tooltip
          .style("left", `${event.offsetX}px`)
          .style("top", `${event.offsetY}px`);
      });

      selection.selectAll("g").on("mouseout", function () {
        d3.select(this).transition().style("fill-opacity", 0.4);
        tooltip.style("opacity", 0);
      });

      selection.selectAll("g").on("click", function (_event, datum: any) {
        onSelect(datum.sets, datum.size);
      });
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [colorMap, onSelect, sets]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-1">
        <h3 className="text-lg font-semibold">Диаграмма пересечений</h3>
        <p className="text-sm text-default-500">
          Наведите, чтобы увидеть размер пересечения, и кликните для списка треков.
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative min-h-[420px]">
          <div ref={containerRef} className="w-full" />
          <div ref={tooltipRef} className="venn-tooltip" style={{ opacity: 0 }} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {legend.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
