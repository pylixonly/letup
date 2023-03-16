/* eslint-disable @typescript-eslint/no-unused-vars */
type PluginSettings = {
    /** Application's name */
    appName: string;
    /** User's last.fm username */
    username: string;
    /** Whether or not to show the timestamp */
    showTimestamp: boolean;
    /** The time interval between each update */
    timeInterval: number;
    /** Whether or not to show "Listening to" */
    listeningTo: boolean;
    /** Ignore when Spotify is running */
    ignoreSpotify: boolean;
    /** Whether or not to show verbose logging */
    verboseLogging: boolean;
};

// A type of an object that is returned by the Discord API after setting the activity
type Activity = {
    name: string;
    application_id: string;
    flags: number;
    type: number;
    details?: string;
    state?: string;
    timestamps?: {
        start: number;
        end?: number;
    };
    assets?: ActivityAssets;
};

enum ActivityType {
    PLAYING = 0,
    STREAMING = 1,
    LISTENING = 2,
    COMPETING = 5
}

// The assets of the activity
type ActivityAssets = {
    large_image?: string;
    large_text?: string;
} | {
    small_image: string;
    small_text?: string;
};

// Last.fm track
type Track = {
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    url: string;
    date: string;
    nowPlaying: boolean;
    loved: boolean;
}
