import { currentSettings } from "..";
import { Track } from "../../../defs";
import Constants from "../constants";

/** Fetches the latest user's scrobble */
export async function fetchLatestScrobble(): Promise<Track> {
    const params = new URLSearchParams({
        "method": "user.getrecenttracks",
        "user": currentSettings.username,
        "api_key": Constants.LFM_API_KEY,
        "format": "json",
        "limit": "1",
        "extended": "1"
    }).toString();

    const result = await fetch(`https://ws.audioscrobbler.com/2.0/?${params}`);
    if (!result.ok) throw new Error(`Failed to fetch the latest scrobble: ${result.statusText}`);

    const info = await result.json();

    const lastTrack = info?.recenttracks?.track?.[0];

    if (!lastTrack) throw info;

    return {
        name: lastTrack.name,
        artist: lastTrack.artist.name,
        album: lastTrack.album["#text"],
        albumArt: await handleAlbumCover(lastTrack.image?.find((x: any) => x.size === "large")?.["#text"]),
        url: lastTrack.url,
        date: lastTrack.date?.["#text"] ?? "now",
        nowPlaying: Boolean(lastTrack["@attr"]?.nowplaying),
        loved: lastTrack.loved === "1",
    } as Track;
}

/** 
 * Currently ditches the default album covers 
 * @param cover The album cover given by Last.fm
*/
export async function handleAlbumCover(cover: string): Promise<string> {
    // If the cover is a default one, return null (remove the cover)
    if (Constants.LFM_DEFAULT_COVER_HASHES.some(x => cover.includes(x))) {
        return null;
    }
    return cover;
}
