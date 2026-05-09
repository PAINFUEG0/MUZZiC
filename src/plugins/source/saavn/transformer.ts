import type { SourcePlugin } from "../../../shared/types/sourcePlugin.js";

export class Transformers {
  static formatImage(image: string) {
    return image.replace("150x150", "500x500").replaceAll("50x50", "500x500").replaceAll("http://", "https://");
  }

  static artist(artists: any[]): Awaited<ReturnType<SourcePlugin["searchArtists"]>> {
    return artists.map((artist: any) => ({
      roles: [],
      name: artist.name,
      id: artist.id.toString(),
      thumb: this.formatImage(artist.image),
    }));
  }

  static album(albums: any[]): Awaited<ReturnType<SourcePlugin["searchAlbums"]>> {
    return albums.map((album: any) => ({
      version: null,
      title: album.title,
      url: album.perma_url,
      id: album.id.toString(),
      releaseYear: album.year,
      artists: album.more_info,
      numberOfTracks: album.song_count,
      thumb: this.formatImage(album.image),
      explicit: album.explicit_content === "1",
      type: album.song_count > 1 ? "ALBUM" : "SINGLE",
    }));
  }

  static playlist(playlists: any): Awaited<ReturnType<SourcePlugin["searchPlaylists"]>> {
    return playlists.map((playlist: any) => ({
      id: playlist.id,
      url: playlist.perma_url,
      title: playlist.title,
      numberOfTracks: Number(playlist.list_count || playlist.more_info.song_count),
      thumb: this.formatImage(playlist.image),
      artists: Array.isArray(playlist.more_info.artist_name)
        ? playlist.more_info.artist_name
        : playlist.more_info.artists.map((a: any) => a.name),
    }));
  }

  static track(tracks: any[]): Awaited<ReturnType<SourcePlugin["searchTracks"]>> {
    return tracks.map((t: any) => ({
      id: t.id,
      title: t.title,
      source: "SAAVN",
      url: t.perma_url,
      resolution: "SR",
      duration: t.more_info.duration,
      thumb: this.formatImage(t.image),
      explicit: t.explicit_content === "1",
      copyright: t.more_info.copyright_text,
      artists: ["primary_artists", "featured_artists"].flatMap((key) =>
        t.more_info.artistMap[key].map((artist: any) => ({
          id: artist.id,
          name: artist.name,
          thumb: this.formatImage(artist.image),
          type: key === "primary_artists" ? "MAIN" : "FEAT",
        })),
      ),
      album: { id: t.more_info.album_id, name: t.more_info.album, thumb: this.formatImage(t.image) },
    }));
  }
}
