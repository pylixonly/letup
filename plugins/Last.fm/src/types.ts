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
    /** Whether or not to show verbose logging */
    verboseLogging: boolean;
};
