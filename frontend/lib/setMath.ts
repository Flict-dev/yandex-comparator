import { VennSet } from "./types";

export const buildPlaylistSets = (trackKeysByPlaylist: string[][]) =>
  trackKeysByPlaylist.map((keys) => new Set(keys));

export const intersectionSize = (sets: Set<string>[]) => {
  if (sets.length === 0) return 0;
  const [first, ...rest] = sets;
  let count = 0;
  first.forEach((value) => {
    if (rest.every((set) => set.has(value))) {
      count += 1;
    }
  });
  return count;
};

export const intersectionKeys = (sets: Set<string>[]) => {
  if (sets.length === 0) return [] as string[];
  const [first, ...rest] = sets;
  const keys: string[] = [];
  first.forEach((value) => {
    if (rest.every((set) => set.has(value))) {
      keys.push(value);
    }
  });
  return keys;
};

export const unionSize = (sets: Set<string>[]) => {
  const union = new Set<string>();
  sets.forEach((set) => {
    set.forEach((value) => union.add(value));
  });
  return union.size;
};

export const jaccard = (a: Set<string>, b: Set<string>) => {
  const intersection = intersectionSize([a, b]);
  const union = unionSize([a, b]);
  return union === 0 ? 0 : intersection / union;
};

const generateSubsets = (items: string[]) => {
  const subsets: string[][] = [];
  const total = 1 << items.length;
  for (let mask = 1; mask < total; mask += 1) {
    const subset: string[] = [];
    items.forEach((item, index) => {
      if (mask & (1 << index)) {
        subset.push(item);
      }
    });
    subsets.push(subset);
  }
  return subsets;
};

export const buildVennSets = (
  playlistIds: string[],
  playlistSets: Map<string, Set<string>>,
): VennSet[] => {
  const subsets = generateSubsets(playlistIds);
  return subsets.map((subset) => {
    const sets = subset.map((id) => playlistSets.get(id) ?? new Set<string>());
    const size = intersectionSize(sets);
    return { sets: subset, size };
  });
};

export const intersectionLabel = (names: string[]) =>
  names.join(" ∩ ");
