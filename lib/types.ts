export interface WavespeedInput {
    prompt: string;
    images: string[];
    size?: string; // "1024*1024", "2048*2048", etc.
    enable_sync_mode?: boolean;
    enable_base64_output?: boolean;
}

export interface WavespeedResponse {
    created_at?: string;
    has_nsfw_contents?: boolean[];
    id?: string;
    model?: string;
    outputs?: string[];
    status?: string;
    urls?: Record<string, string>;
    error?: string; // For our internal error handling
}

export interface WavespeedApiResponse {
    code: number;
    message: string;
    data: WavespeedResponse;
}

// Mapping for UI dropdown to API size string
export const SIZE_MAPPING: Record<string, string> = {
    'square': '1024*1024',
    'square_hd': '2048*2048',
    'portrait_4_3': '1536*2048',
    'portrait_3_2': '1365*2048',
    'portrait_16_9': '1152*2048',
    'landscape_4_3': '2048*1536',
    'landscape_3_2': '2048*1365',
    'landscape_16_9': '2048*1152',
    'landscape_21_9': '2048*878',
};
