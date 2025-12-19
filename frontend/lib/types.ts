export type Playlist = {
  id: string;
  title: string;
  owner: string;
  count: number;
};

export type Track = {
  track_key: string;
  title: string;
  artists: string[];
  duration_ms: number;
  link?: string;
};

export type CompareResponse = {
  playlists: Playlist[];
  track_keys_by_playlist: string[][];
  tracks_index: Record<string, Track>;
};

export type VennSet = {
  sets: string[];
  size: number;
};

export type IntersectionSelection = {
  playlistIds: string[];
  label: string;
  size: number;
};
