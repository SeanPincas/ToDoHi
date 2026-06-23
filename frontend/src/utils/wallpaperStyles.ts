export interface WallpaperTheme {
    id: string;
    name: string;
    pageBase: string;
    titleInk: string;
    pageLayers: string[];
    pageSizes?: string[];
    pagePositions?: string[];
    pageRepeats?: string[];
}

interface PaperWashOptions {
    base: string;
    titleInk: string;
    topGlow: string;
    sideTint: string;
    paperTop: string;
    paperBottom: string;
    fiberColor: string;
    grainColor: string;
    accentColor: string;
    accentOpacity?: number;
}

interface MistBloomOptions {
    base: string;
    titleInk: string;
    bloomOne: string;
    bloomTwo: string;
    bloomThree: string;
    washTop: string;
    washBottom: string;
    hazeColor: string;
    mistColor: string;
}

interface OrganicAccentOptions {
    base: string;
    titleInk: string;
    canopyOne: string;
    canopyTwo: string;
    bloomAccent: string;
    washTop: string;
    washBottom: string;
    speckleColor: string;
    driftColor: string;
}

const createWallpaperTheme = (
    id: string,
    name: string,
    config: Omit<WallpaperTheme, "id" | "name">
): WallpaperTheme => ({
    id,
    name,
    ...config,
});

const createPaperWashTheme = (
    id: string,
    name: string,
    options: PaperWashOptions
): WallpaperTheme =>
    createWallpaperTheme(id, name, {
        pageBase: options.base,
        titleInk: options.titleInk,
        pageLayers: [
            `radial-gradient(circle at 16% 14%, ${options.topGlow} 0%, rgba(255, 255, 255, 0) 30%)`,
            `radial-gradient(circle at 84% 18%, ${options.sideTint} 0%, rgba(255, 255, 255, 0) 34%)`,
            `radial-gradient(circle at 52% 108%, color-mix(in srgb, ${options.accentColor} 14%, rgba(94, 68, 34, 0.14)) 0%, rgba(255, 255, 255, 0) 42%)`,
            `linear-gradient(180deg, ${options.paperTop} 0%, ${options.paperBottom} 100%)`,
            `linear-gradient(145deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 34%, rgba(130, 105, 72, 0.05) 100%)`,
            `repeating-linear-gradient(96deg, ${options.fiberColor} 0 1px, rgba(255, 255, 255, 0) 1px 12px)`,
            `repeating-linear-gradient(180deg, rgba(255, 255, 255, 0) 0 14px, ${options.grainColor} 14px 15px, rgba(255, 255, 255, 0) 15px 28px)`,
            `repeating-radial-gradient(circle at 24% 28%, color-mix(in srgb, ${options.accentColor} 12%, transparent) 0 1px, rgba(255, 255, 255, 0) 1px 24px)`,
            `radial-gradient(circle at 28% 62%, color-mix(in srgb, ${options.accentColor} ${options.accentOpacity ?? 16}%, transparent) 0%, rgba(255, 255, 255, 0) 24%)`,
            `linear-gradient(180deg, rgba(109, 81, 45, 0.06) 0%, rgba(255, 255, 255, 0) 12%, rgba(255, 255, 255, 0) 88%, rgba(109, 81, 45, 0.08) 100%)`,
        ],
        pageSizes: ["cover", "cover", "cover", "cover", "cover", "auto", "auto", "160px 160px", "cover", "cover"],
        pagePositions: ["center", "center", "center", "center", "center", "center", "center", "center", "center", "center"],
        pageRepeats: ["no-repeat", "no-repeat", "no-repeat", "no-repeat", "no-repeat", "repeat", "repeat", "repeat", "no-repeat", "no-repeat"],
    });

const createMistBloomTheme = (
    id: string,
    name: string,
    options: MistBloomOptions
): WallpaperTheme =>
    createWallpaperTheme(id, name, {
        pageBase: options.base,
        titleInk: options.titleInk,
        pageLayers: [
            `radial-gradient(circle at 20% 18%, ${options.bloomOne} 0%, rgba(255, 255, 255, 0) 34%)`,
            `radial-gradient(circle at 78% 22%, ${options.bloomTwo} 0%, rgba(255, 255, 255, 0) 38%)`,
            `radial-gradient(circle at 52% 76%, ${options.bloomThree} 0%, rgba(255, 255, 255, 0) 42%)`,
            `radial-gradient(circle at 18% 78%, color-mix(in srgb, ${options.bloomTwo} 76%, transparent) 0%, rgba(255, 255, 255, 0) 28%)`,
            `linear-gradient(180deg, ${options.washTop} 0%, ${options.washBottom} 100%)`,
            `linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 36%, rgba(255, 255, 255, 0.08) 100%)`,
            `linear-gradient(125deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0) 42%)`,
            `radial-gradient(circle at 50% 50%, ${options.hazeColor} 0%, rgba(255, 255, 255, 0) 68%)`,
            `repeating-linear-gradient(160deg, rgba(255, 255, 255, 0) 0 16px, ${options.mistColor} 16px 19px, rgba(255, 255, 255, 0) 19px 36px)`,
            `repeating-radial-gradient(circle at 22% 24%, rgba(255, 255, 255, 0.07) 0 1px, rgba(255, 255, 255, 0) 1px 30px)`,
            `linear-gradient(180deg, rgba(44, 52, 70, 0.08) 0%, rgba(255, 255, 255, 0) 14%, rgba(255, 255, 255, 0) 84%, rgba(44, 52, 70, 0.10) 100%)`,
        ],
        pageSizes: ["cover", "cover", "cover", "cover", "cover", "cover", "cover", "cover", "auto", "170px 170px", "cover"],
        pagePositions: ["center", "center", "center", "center", "center", "center", "center", "center", "center", "center", "center"],
        pageRepeats: ["no-repeat", "no-repeat", "no-repeat", "no-repeat", "no-repeat", "no-repeat", "no-repeat", "no-repeat", "repeat", "repeat", "no-repeat"],
    });

const createOrganicAccentTheme = (
    id: string,
    name: string,
    options: OrganicAccentOptions
): WallpaperTheme =>
    createWallpaperTheme(id, name, {
        pageBase: options.base,
        titleInk: options.titleInk,
        pageLayers: [
            `radial-gradient(circle at 18% 18%, ${options.canopyOne} 0%, rgba(255, 255, 255, 0) 34%)`,
            `radial-gradient(circle at 84% 24%, ${options.canopyTwo} 0%, rgba(255, 255, 255, 0) 38%)`,
            `radial-gradient(circle at 52% 72%, ${options.bloomAccent} 0%, rgba(255, 255, 255, 0) 26%)`,
            `radial-gradient(circle at 72% 78%, color-mix(in srgb, ${options.bloomAccent} 74%, transparent) 0%, rgba(255, 255, 255, 0) 22%)`,
            `linear-gradient(180deg, ${options.washTop} 0%, ${options.washBottom} 100%)`,
            `linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 34%, rgba(10, 18, 24, 0.08) 100%)`,
            `repeating-radial-gradient(circle at center, ${options.speckleColor} 0 1.2px, rgba(255, 255, 255, 0) 1.2px 22px)`,
            `repeating-linear-gradient(138deg, rgba(255, 255, 255, 0) 0 18px, ${options.driftColor} 18px 22px, rgba(255, 255, 255, 0) 22px 40px)`,
            `repeating-radial-gradient(circle at 28% 32%, color-mix(in srgb, ${options.canopyOne} 42%, transparent) 0 2px, rgba(255, 255, 255, 0) 2px 42px)`,
            `linear-gradient(180deg, rgba(7, 12, 18, 0.10) 0%, rgba(255, 255, 255, 0) 14%, rgba(255, 255, 255, 0) 84%, rgba(7, 12, 18, 0.12) 100%)`,
        ],
        pageSizes: ["cover", "cover", "cover", "cover", "cover", "cover", "140px 140px", "auto", "210px 210px", "cover"],
        pagePositions: ["center", "center", "center", "center", "center", "center", "center", "center", "center", "center"],
        pageRepeats: ["no-repeat", "no-repeat", "no-repeat", "no-repeat", "no-repeat", "no-repeat", "repeat", "repeat", "repeat", "no-repeat"],
    });

export const WALLPAPER_THEMES: Record<string, WallpaperTheme> = {
    "wallpaper-1": createPaperWashTheme("wallpaper-1", "Warm Cream Paper", {
        base: "#f5efe1",
        titleInk: "#8b6330",
        topGlow: "rgba(255, 254, 248, 0.84)",
        sideTint: "rgba(226, 201, 156, 0.30)",
        paperTop: "rgba(249, 243, 232, 0.98)",
        paperBottom: "rgba(237, 227, 208, 0.98)",
        fiberColor: "rgba(194, 174, 142, 0.10)",
        grainColor: "rgba(255, 255, 255, 0.07)",
        accentColor: "#d8b982",
        accentOpacity: 18,
    }),
    "wallpaper-2": createMistBloomTheme("wallpaper-2", "Mist Blue Wash", {
        base: "#dfeaf2",
        titleInk: "#6f96b6",
        bloomOne: "rgba(255, 255, 255, 0.66)",
        bloomTwo: "rgba(163, 195, 221, 0.34)",
        bloomThree: "rgba(192, 218, 233, 0.28)",
        washTop: "rgba(229, 240, 247, 0.98)",
        washBottom: "rgba(203, 220, 234, 0.99)",
        hazeColor: "rgba(244, 249, 252, 0.20)",
        mistColor: "rgba(255, 255, 255, 0.05)",
    }),
    "wallpaper-3": createPaperWashTheme("wallpaper-3", "Soft Sage Paper", {
        base: "#e4ecdf",
        titleInk: "#68875f",
        topGlow: "rgba(252, 255, 250, 0.76)",
        sideTint: "rgba(177, 201, 168, 0.30)",
        paperTop: "rgba(239, 246, 235, 0.98)",
        paperBottom: "rgba(217, 229, 212, 0.98)",
        fiberColor: "rgba(145, 167, 137, 0.11)",
        grainColor: "rgba(255, 255, 255, 0.06)",
        accentColor: "#9ab38d",
        accentOpacity: 18,
    }),
    "wallpaper-4": createOrganicAccentTheme("wallpaper-4", "Moss Garden", {
        base: "#d4dfcc",
        titleInk: "#6c8b57",
        canopyOne: "rgba(226, 237, 214, 0.56)",
        canopyTwo: "rgba(120, 151, 110, 0.28)",
        bloomAccent: "rgba(166, 191, 140, 0.22)",
        washTop: "rgba(223, 234, 213, 0.98)",
        washBottom: "rgba(193, 208, 185, 0.99)",
        speckleColor: "rgba(245, 248, 238, 0.16)",
        driftColor: "rgba(95, 126, 86, 0.06)",
    }),
    "wallpaper-5": createPaperWashTheme("wallpaper-5", "Rice Field Beige", {
        base: "#efe1c2",
        titleInk: "#a47d2b",
        topGlow: "rgba(255, 251, 241, 0.78)",
        sideTint: "rgba(205, 182, 126, 0.28)",
        paperTop: "rgba(246, 237, 213, 0.98)",
        paperBottom: "rgba(230, 214, 176, 0.98)",
        fiberColor: "rgba(176, 150, 92, 0.11)",
        grainColor: "rgba(255, 255, 255, 0.06)",
        accentColor: "#c9a24d",
        accentOpacity: 17,
    }),
    "wallpaper-6": createPaperWashTheme("wallpaper-6", "Floral Linen", {
        base: "#f1e6de",
        titleInk: "#b38192",
        topGlow: "rgba(255, 252, 250, 0.78)",
        sideTint: "rgba(214, 181, 170, 0.26)",
        paperTop: "rgba(248, 239, 234, 0.98)",
        paperBottom: "rgba(233, 218, 211, 0.98)",
        fiberColor: "rgba(184, 156, 145, 0.11)",
        grainColor: "rgba(255, 255, 255, 0.06)",
        accentColor: "#d4b0ba",
        accentOpacity: 16,
    }),
    "wallpaper-7": createMistBloomTheme("wallpaper-7", "Lavender Mist", {
        base: "#e6deef",
        titleInk: "#8b78b7",
        bloomOne: "rgba(255, 255, 255, 0.64)",
        bloomTwo: "rgba(185, 167, 208, 0.32)",
        bloomThree: "rgba(217, 204, 235, 0.28)",
        washTop: "rgba(241, 234, 247, 0.98)",
        washBottom: "rgba(221, 210, 235, 0.99)",
        hazeColor: "rgba(250, 246, 252, 0.16)",
        mistColor: "rgba(255, 255, 255, 0.045)",
    }),
    "wallpaper-8": createMistBloomTheme("wallpaper-8", "Peach Dawn", {
        base: "#f3ddd3",
        titleInk: "#cf8f72",
        bloomOne: "rgba(255, 250, 247, 0.66)",
        bloomTwo: "rgba(230, 175, 152, 0.30)",
        bloomThree: "rgba(246, 214, 198, 0.26)",
        washTop: "rgba(249, 234, 228, 0.98)",
        washBottom: "rgba(236, 208, 196, 0.99)",
        hazeColor: "rgba(255, 247, 243, 0.16)",
        mistColor: "rgba(255, 255, 255, 0.04)",
    }),
    "wallpaper-9": createOrganicAccentTheme("wallpaper-9", "Rose Dust", {
        base: "#edd5dc",
        titleInk: "#bc6f8c",
        canopyOne: "rgba(255, 246, 249, 0.58)",
        canopyTwo: "rgba(193, 135, 153, 0.26)",
        bloomAccent: "rgba(223, 173, 188, 0.20)",
        washTop: "rgba(244, 229, 234, 0.98)",
        washBottom: "rgba(228, 202, 211, 0.99)",
        speckleColor: "rgba(255, 250, 252, 0.14)",
        driftColor: "rgba(157, 93, 112, 0.055)",
    }),
    "wallpaper-10": createOrganicAccentTheme("wallpaper-10", "Ink Navy", {
        base: "#24384e",
        titleInk: "#8aa6d0",
        canopyOne: "rgba(113, 149, 189, 0.24)",
        canopyTwo: "rgba(10, 18, 31, 0.38)",
        bloomAccent: "rgba(78, 113, 149, 0.18)",
        washTop: "rgba(49, 73, 98, 0.99)",
        washBottom: "rgba(26, 42, 59, 1)",
        speckleColor: "rgba(212, 226, 246, 0.10)",
        driftColor: "rgba(14, 24, 36, 0.16)",
    }),
    "wallpaper-11": createOrganicAccentTheme("wallpaper-11", "Deep Teal", {
        base: "#234b54",
        titleInk: "#73b2b7",
        canopyOne: "rgba(111, 177, 183, 0.24)",
        canopyTwo: "rgba(9, 24, 29, 0.34)",
        bloomAccent: "rgba(64, 132, 137, 0.18)",
        washTop: "rgba(42, 92, 101, 0.99)",
        washBottom: "rgba(23, 54, 61, 1)",
        speckleColor: "rgba(213, 238, 237, 0.10)",
        driftColor: "rgba(12, 30, 34, 0.14)",
    }),
    "wallpaper-12": createMistBloomTheme("wallpaper-12", "Smoky Plum", {
        base: "#4f4154",
        titleInk: "#b895be",
        bloomOne: "rgba(191, 168, 195, 0.20)",
        bloomTwo: "rgba(43, 28, 48, 0.26)",
        bloomThree: "rgba(126, 102, 134, 0.22)",
        washTop: "rgba(97, 79, 101, 0.98)",
        washBottom: "rgba(61, 48, 64, 0.99)",
        hazeColor: "rgba(223, 212, 226, 0.10)",
        mistColor: "rgba(255, 255, 255, 0.028)",
    }),
};

export const WALLPAPER_STYLE_OPTIONS = Object.keys(WALLPAPER_THEMES);

export const WALLPAPER_STYLE_LABELS = Object.fromEntries(
    Object.values(WALLPAPER_THEMES).map((theme) => [theme.id, theme.name])
) as Record<string, string>;

export const getWallpaperTheme = (style?: string): WallpaperTheme => {
    if (style && WALLPAPER_THEMES[style]) {
        return WALLPAPER_THEMES[style];
    }

    return WALLPAPER_THEMES["wallpaper-1"];
};
