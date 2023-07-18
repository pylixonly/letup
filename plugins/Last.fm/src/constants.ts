const Constants = {
    DEFAULT_APP_NAME: "Music",
    DEFAULT_TIME_INTERVAL: 5,
    /** The application ID of the Discord's developer app */
    APPLICATION_ID: "1054951789318909972",
    /** Last.fm api key */
    LFM_API_KEY: "014ffe8a614370f000d85d95ec30e1be",
    /** These are the default album covers that are used by Last.fm */
    LFM_DEFAULT_COVER_HASHES: [
        "2a96cbd8b46e442fc41c2b86b821562f",
        "c6f59c1e5e7240a4c0d427abd71f3dbb",
    ]
} as const;

export default Constants;
