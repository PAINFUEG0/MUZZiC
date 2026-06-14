/** @format */

import type { Album, Artist, Playlist, Track, Transformer } from "../../../shared/types/sourcePlugin.js";

export class Transformers implements Transformer {
  fallbackImage = "https://cdn.vectorstock.com/i/500p/33/47/no-photo-available-icon-vector-40343347.jpg";

  fmt(image?: string) {
    return image
      ? image.replace("150x150", "500x500").replaceAll("50x50", "500x500").replaceAll("http://", "https://")
      : this.fallbackImage;
  }

  artist(artists: any[]) {
    return artists.map(
      (artist) =>
        ({ name: artist.name, id: (artist.id || artist.artistId).toString(), thumb: this.fmt(artist.image) }) satisfies Artist as Artist,
    );
  }

  album(albums: any[]) {
    return albums.map(
      (album: any) =>
        ({
          title: album.title,
          id: album.id.toString(),
          releaseYear: album.year,
          artists: album.more_info.artistMap.primary_artists.map((a: any) => ({
            name: a.name,
            id: a.id.toString(),
            thumb: this.fmt(a.image),
          })),
          thumb: this.fmt(album.image),
          numberOfTracks: album.song_count || album.list_count,
          explicit: album.explicit_content === "1",
        }) satisfies Album as Album,
    );
  }

  playlist(playlists: any[]) {
    return playlists.map(
      (playlist) =>
        ({
          id: playlist.id,
          title: playlist.title,
          thumb: this.fmt(playlist.image),
          artists: Array.isArray(playlist.more_info.artist_name)
            ? playlist.more_info.artist_name
            : playlist.more_info.artists.map((a: any) => a.name),
          numberOfTracks: Number(playlist.list_count || playlist.more_info.song_count),
        }) satisfies Playlist as Playlist,
    );
  }

  track(tracks: any[]) {
    return tracks.map(
      (t: any) =>
        ({
          id: t.id,
          title: t.title,
          resolution: "SR",
          duration: t.more_info.duration,
          thumb: this.fmt(t.image),
          explicit: t.explicit_content === "1",
          album: { id: t.more_info.album_id, name: t.more_info.album, thumb: this.fmt(t.image) },
          artists: ["primary_artists", "featured_artists"].flatMap((key) =>
            t.more_info.artistMap[key].map((artist: any) => ({ id: artist.id, name: artist.name, thumb: this.fmt(artist.image) })),
          ),
        }) satisfies Track as Track,
    );
  }
}
