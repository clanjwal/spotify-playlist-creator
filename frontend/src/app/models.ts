export interface Track {
  id: string;
  name: string;
  uri: string;
  addedAt: string;
  durationMs: number;
  artists: string[];
  albumName: string | null;
  albumImageUrl: string | null;
}

export interface CreatedPlaylist {
  id: string;
  name: string;
  url: string;
  trackCount: number;
}
