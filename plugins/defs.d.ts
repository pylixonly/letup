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
    buttons?: ActivityButton[];
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
