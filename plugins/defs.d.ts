type Activity = {
    name: string;
    application_id: string;
    flags: number;
    type: number;
    details?: string;
    state?: string;
    timestamps?: {
        _enabled?: boolean;
        start: number | string;
        end?: number | string;
    };
    assets: ActivityAssets;
    buttons: ActivityButton[];
};

type ActivityButton = {
    label: string;
    url: string;
};

type ActivityAssets = {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
};

type LFMSettings = {
    appName: string;
    username: string;
    showTimestamp: boolean;
    timeInterval: number | string;
    listeningTo: boolean;
    ignoreSpotify: boolean;
    verboseLogging: boolean;
};

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
