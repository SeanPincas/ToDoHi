export const FRAME_STYLE_OPTIONS = [
    "frame-ashe",
    "frame-birch",
    "frame-cedar",
    "frame-cherry",
    "frame-ebony",
    "frame-greenheart",
    "frame-hinoki",
    "frame-maple",
    "frame-oak",
    "frame-walnut",
] as const;

export type FrameStyleId = (typeof FRAME_STYLE_OPTIONS)[number];

export const FRAME_STYLE_LABELS: Record<FrameStyleId, string> = {
    "frame-ashe": "Ash Wood",
    "frame-birch": "Birch Wood",
    "frame-cedar": "Cedar Wood",
    "frame-cherry": "Cherry Wood",
    "frame-ebony": "Ebony Wood",
    "frame-greenheart": "Greenheart Wood",
    "frame-hinoki": "Hinoki Wood",
    "frame-maple": "Maple Wood",
    "frame-oak": "Oak Wood",
    "frame-walnut": "Walnut Wood",
};

const FRAME_IMAGE_LOADERS: Record<FrameStyleId, () => Promise<{ default: string }>> = {
    "frame-ashe": () => import("../assets/frames/frame-ashe.webp"),
    "frame-birch": () => import("../assets/frames/frame-birch.webp"),
    "frame-cedar": () => import("../assets/frames/frame-cedar.webp"),
    "frame-cherry": () => import("../assets/frames/frame-cherry.webp"),
    "frame-ebony": () => import("../assets/frames/frame-ebony.webp"),
    "frame-greenheart": () => import("../assets/frames/frame-greenheart.webp"),
    "frame-hinoki": () => import("../assets/frames/frame-hinoki.webp"),
    "frame-maple": () => import("../assets/frames/frame-maple.webp"),
    "frame-oak": () => import("../assets/frames/frame-oak.webp"),
    "frame-walnut": () => import("../assets/frames/frame-walnut.webp"),
};

export const DEFAULT_FRAME_STYLE: FrameStyleId = "frame-oak";

export const normalizeFrameStyle = (style?: string): FrameStyleId =>
    style && style in FRAME_IMAGE_LOADERS
        ? (style as FrameStyleId)
        : DEFAULT_FRAME_STYLE;

export const loadFrameStyleAsset = async (style?: string) => {
    const normalizedStyle = normalizeFrameStyle(style);
    const module = await FRAME_IMAGE_LOADERS[normalizedStyle]();
    return module.default;
};

