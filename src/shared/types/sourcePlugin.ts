import { Lyrics } from "./lyrics.js";
import { formats } from "../constants.js";

export interface Transformer {
  track(tracks: any[]): Track<false>[];
  album(albums: any[]): Album<false>[];
  artist(artists: any[]): Artist<false>[];
  playlist(playlists: any[]): Playlist<false>[];
}

export type Album<T extends boolean = false> = {
  id: string;
  title: string;
  thumb: string;
  artists: Artist[];
  explicit: boolean;
  releaseYear: string;
  numberOfTracks: number;
} & (T extends true ? { tracks: Track[]; duration: number } : {});

export type Playlist<T extends boolean = false> = {
  id: string;
  title: string;
  thumb: string;
  artists: string[];
  numberOfTracks: number;
} & (T extends true ? { tracks: Track[] } : {});

export type Artist<T extends boolean = false> = {
  id: string;
  name: string;
  thumb: string;
} & (T extends true ? { albums: Album[]; tracks: Track[] } : {});

export type Track<T extends boolean = false> = {
  id: string;
  title: string;
  thumb: string;
  duration: number;
  artists: Artist[];
  explicit: boolean;
  resolution: "SR" | "CD" | "HR" | "DD";
  album: { id: string; name: string; thumb: string };
} & (T extends true ? { lyrics: string; streamURI: string } : {});

export interface SourcePlugin {
  name: string;

  init(): Promise<this>;

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
