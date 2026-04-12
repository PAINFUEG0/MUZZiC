import { SourcePlugin } from "../../../shared/types/sourcePlugin.js";

export class Transformers {
  static album(albums: any[]): Awaited<ReturnType<SourcePlugin["searchAlbums"]>> {
    return albums.map((album: any) => ({
      url: album.url,
      title: album.title,
      version: album.version,
      id: album.id.toString(),
      duration: album.duration,
      explicit: !!album.explicit,
      releaseDate: album.releaseDate,
      numberOfTracks: album.numberOfTracks,
      type: album.type,
      artists: album.artists.map((a: any) => ({
        name: a.name,
        id: a.id.toString(),
        type: a.type === "MAIN" ? "MAIN" : "FEAT",
        thumb: this.generateAssetUrl(a.picture, 750),
      })),
      thumb: this.generateAssetUrl(album.cover, 1280),
      copyright: album.copyright || "© Unknown copyright holder",
    }));
  }

  static artist(artists: any[]): Awaited<ReturnType<SourcePlugin["searchArtists"]>> {
    return artists.map((artist: any) => ({
      name: artist.name,
      id: artist.id.toString(),
      thumb: this.generateAssetUrl(artist.picture, 750),
      roles: artist.artistRoles.map((role: any) => `${role.category}`),
    }));
  }

  static playlist(playlists: any): Awaited<ReturnType<SourcePlugin["searchPlaylists"]>> {
    return playlists.map((playlist: any) => ({
      id: playlist.uuid,
      url: playlist.url,
      title: playlist.title,
      duration: playlist.duration,
      description: playlist.description,
      numberOfTracks: playlist.numberOfTracks,
      lastItemAddedAt: playlist.lastItemAddedAt,
      thumb: this.generateAssetUrl(playlist.squareImage, 750),
      artists: playlist.promotedArtists.map((artist: any) => ({
        name: artist.name,
        id: artist.id.toString(),
        thumb: this.generateAssetUrl(artist.picture, 750),
        type: artist.type === "MAIN" ? "MAIN" : "FEAT",
      })),
    }));
  }

  static track(tracks: any[]): Awaited<ReturnType<SourcePlugin["searchTracks"]>> {
    return tracks.map((track: any) => ({
      source: "TIDAL",
      url: track.url,
      title: track.title,
      id: track.id.toString(),
      duration: track.duration,
      explicit: !!track.explicit,
      artists: track.artists.map((a: any) => ({
        name: a.name,
        id: a.id.toString(),
        thumb: this.generateAssetUrl(a.picture, 750),
        type: a.type === "MAIN" ? "MAIN" : "FEAT",
      })),
      thumb: this.generateAssetUrl(track.album.cover, 1280),
      album: {
        id: track.album.id.toString(),
        name: track.album.title,
        thumb: this.generateAssetUrl(track.album.cover, 1280),
      },
      copyright: track.copyright || "© Unknown copyright holder",
      resolution: track.mediaMetadata.tags.includes("HIRES_LOSSLESS")
        ? "HR"
        : track.mediaMetadata.tags.includes("LOSSLESS")
          ? "CD"
          : track.mediaMetadata.tags.includes("DOLBY_ATMOS")
            ? "DD"
            : "SR",
    }));
  }

  static generateAssetUrl(asset?: string, res = 320) {
    return asset
      ? `https://resources.tidal.com/images/${asset.replaceAll("-", "/")}/${res}x${res}.jpg`
      : this.fallbackImage;
  }

  static fallbackImage = "https://cdn.vectorstock.com/i/500p/33/47/no-photo-available-icon-vector-40343347.jpg";
}
