import wallpaperStyle1 from "../assets/wallpaper/wallpaper-1.webp";

export const WALLPAPER_STYLE_MAP: Record<string, string> = {
    default: wallpaperStyle1,
    "wallpaper-1": wallpaperStyle1,
};

export const WALLPAPER_STYLE_OPTIONS = Object.keys(WALLPAPER_STYLE_MAP).filter(
    (style) => style !== "default"
);

export const getWallpaperStyleAsset = (style?: string) => {
    if (!style) return WALLPAPER_STYLE_MAP.default;
    return WALLPAPER_STYLE_MAP[style] ?? WALLPAPER_STYLE_MAP.default;
};
