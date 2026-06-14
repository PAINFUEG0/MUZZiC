/** @format */

import type { Album, Artist, Playlist, Track, Transformer } from "../../../shared/types/sourcePlugin.js";

export class Transformers implements Transformer {
  fallbackImage = "https://cdn.vectorstock.com/i/500p/33/47/no-photo-available-icon-vector-40343347.jpg";

  fmt(asset?: string, res = 320) {
    return asset ? `https://resources.tidal.com/images/${asset.replaceAll("-", "/")}/${res}x${res}.jpg` : this.fallbackImage;
  }

  artist(artists: any[]) {
    return artists.map(
      (artist: any) => ({ name: artist.name, id: artist.id.toString(), thumb: this.fmt(artist.picture, 750) }) satisfies Artist as Artist,
    );
  }

  album(albums: any[]) {
    return albums.map(
      (album: any) =>
        ({
          id: album.id.toString(),
          explicit: !!album.explicit,
          thumb: this.fmt(album.cover, 1280),
          numberOfTracks: album.numberOfTracks,
          releaseYear: album.releaseDate.substring(0, 4),
          title: album.title + " (" + album.version + ")",
          artists: album.artists.map((a: any) => ({ name: a.name, id: a.id.toString(), thumb: this.fmt(a.picture, 750) })),
        }) satisfies Album as Album,
    );
  }

  playlist(playlists: any[]) {
    return playlists.map(
      (playlist: any) =>
        ({
          id: playlist.uuid,
          title: playlist.title,
          numberOfTracks: playlist.numberOfTracks,
          thumb: this.fmt(playlist.squareImage, 750),
          artists: playlist.promotedArtists.map((artist: any) => ({
            name: artist.name,
            id: artist.id.toString(),
            thumb: this.fmt(artist.picture, 750),
          })),
        }) satisfies Playlist as Playlist,
    );
  }

  track(tracks: any[]) {
    return tracks.map(
      (track: any) =>
        ({
          title: track.title,
          id: track.id.toString(),
          duration: track.duration,
          explicit: !!track.explicit,
          thumb: this.fmt(track.album.cover, 1280),
          resolution: track.mediaMetadata.tags.includes("HIRES_LOSSLESS")
            ? "HR"
            : track.mediaMetadata.tags.includes("LOSSLESS")
              ? "CD"
              : track.mediaMetadata.tags.includes("DOLBY_ATMOS")
                ? "DD"
                : "SR",
          album: { name: track.album.title, id: track.album.id.toString(), thumb: this.fmt(track.album.cover, 1280) },
          artists: track.artists.map((a: any) => ({ name: a.name, id: a.id.toString(), thumb: this.fmt(a.picture, 750) })),
        }) satisfies Track as Track,
    );
  }
}
