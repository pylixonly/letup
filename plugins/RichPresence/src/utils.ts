function isValid(val: any) {
    if (val && typeof val.length === "number") return val.length > 0;
    return val || val === 0 || val === false;
}

// Deep clone and filter empty objects/values or keys starting with "_"
export function cloneAndFilter<T extends object>(obj: T): T {
    const filter = (k: PropertyKey, v: any) => {
        if (v === obj) return v;
        if (typeof k === "string" && k.startsWith("_")) return undefined;

        switch (typeof v) {
            case "object": {
                if (Array.isArray(v) && v.length === 0) return undefined;

                const filteredEntries = Object.entries(v).filter((e) => isValid(e[1]));
                return filteredEntries.length > 0 ? Object.fromEntries(filteredEntries) : undefined;
            }
            default:
                return isValid(v) ? v : undefined;
        }
    };

    return JSON.parse(JSON.stringify(obj, filter));
}
