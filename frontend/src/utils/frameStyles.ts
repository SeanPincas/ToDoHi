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

export interface FrameTheme {
    id: FrameStyleId;
    name: string;
    titleBorder: string;
}

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

export const FRAME_THEMES: Record<FrameStyleId, FrameTheme> = {
    "frame-ashe": {
        id: "frame-ashe",
        name: "Ash Wood",
        titleBorder: "#7b6040",
    },
    "frame-birch": {
        id: "frame-birch",
        name: "Birch Wood",
        titleBorder: "#8d714c",
    },
    "frame-cedar": {
        id: "frame-cedar",
        name: "Cedar Wood",
        titleBorder: "#8c5836",
    },
    "frame-cherry": {
        id: "frame-cherry",
        name: "Cherry Wood",
        titleBorder: "#7d4332",
    },
    "frame-ebony": {
        id: "frame-ebony",
        name: "Ebony Wood",
        titleBorder: "#2b241f",
    },
    "frame-greenheart": {
        id: "frame-greenheart",
        name: "Greenheart Wood",
        titleBorder: "#5d6330",
    },
    "frame-hinoki": {
        id: "frame-hinoki",
        name: "Hinoki Wood",
        titleBorder: "#8d6f47",
    },
    "frame-maple": {
        id: "frame-maple",
        name: "Maple Wood",
        titleBorder: "#916744",
    },
    "frame-oak": {
        id: "frame-oak",
        name: "Oak Wood",
        titleBorder: "#7b5531",
    },
    "frame-walnut": {
        id: "frame-walnut",
        name: "Walnut Wood",
        titleBorder: "#5f3f29",
    },
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

export const getFrameTheme = (style?: string): FrameTheme => {
    const normalizedStyle = normalizeFrameStyle(style);
    return FRAME_THEMES[normalizedStyle];
};
