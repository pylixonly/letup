import { useReducer } from "react";
import { Activity, Track } from "../../../defs";

let __forceUpdate: () => void;

const debugInfo = {} as {
    lastActivity?: Activity,
    lastTrack?: Track,
    lastAPIResponse?: any,
    isSpotifyIgnored?: boolean,
};

export function setDebugInfo(key: keyof typeof debugInfo, value: typeof debugInfo[typeof key]) {
    debugInfo[key] = value;
    __forceUpdate?.();
}

export function useDebugInfo(): string {
    [, __forceUpdate] = useReducer((x) => ~x, 0);
    return JSON.stringify(debugInfo, null, 4);
}
