import { Lyrics } from "./lyrics.js";
import { formats } from "../constants.js";

export interface SourcePlugin {
  name: string;

  init(): Promise<SourcePlugin>;

  getLyrics?(platformId: string): Promise<Lyrics<"None"> | Lyrics<"Word"> | Lyrics<"Line"> | undefined>;

  getAlbum(id: string): Promise<Album<true>>;
  searchAlbums(query: string): Promise<Album[]>;

  getArtist(id: string): Promise<Artist<true>>;
  searchArtists(query: string): Promise<Artist[]>;

  getPlaylist(id: string): Promise<Playlist<true>>;
  searchPlaylists(query: string): Promise<Playlist[]>;

  searchTracks(query: string): Promise<Track[]>;
  getTrack(id: string, quality: keyof typeof formats): Promise<{ uri: string; ext: string; direct: boolean }>;
}

export type Track<T extends boolean = false> = {
  id: string;
  url: string;
  title: string;
  thumb: string;
  duration: number;
  explicit: boolean;
  copyright: string;
  source: "TIDAL" | "SAAVN" | "LOCAL";
  resolution: "SR" | "CD" | "HR" | "DD";
  artists: (Artist & { type: "MAIN" | "FEAT" })[];
  album: { id: string; name: string; thumb: string };
} & (T extends true ? { lyrics: string; streamURI: string } : {});

export type Album<T extends boolean = false> = {
  id: string;
  url: string;
  title: string;
  thumb: string;
  explicit: boolean;
  releaseYear: string;
  numberOfTracks: number;
  version: string | null;
  type: "ALBUM" | "SINGLE";
  artists: (Artist & { type: "MAIN" | "FEAT" })[];
} & (T extends true ? { tracks: Track[]; duration: number } : {});

export type Playlist<T extends boolean = false> = {
  id: string;
  url: string;
  title: string;
  thumb: string;
  numberOfTracks: number;
  artists: (Artist & { type: "MAIN" | "FEAT" })[];
} & (T extends true ? { tracks: Track[]; duration: number } : {});

export type Artist<T extends boolean = false> = {
  id: string;
  name: string;
  thumb: string;
} & (T extends true ? { albums: Album[]; tracks: Track[] } : {});
