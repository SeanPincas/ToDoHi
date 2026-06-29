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
        base: "#ede2cc",
        titleInk: "#7f5828",
        topGlow: "rgba(255, 252, 244, 0.72)",
        sideTint: "rgba(214, 183, 128, 0.38)",
        paperTop: "rgba(244, 234, 216, 0.99)",
        paperBottom: "rgba(222, 205, 174, 0.99)",
        fiberColor: "rgba(177, 148, 103, 0.14)",
        grainColor: "rgba(255, 248, 236, 0.10)",
        accentColor: "#cfa666",
        accentOpacity: 22,
    }),
    "wallpaper-2": createMistBloomTheme("wallpaper-2", "Mist Blue Wash", {
        base: "#d3e3ef",
        titleInk: "#5e84a8",
        bloomOne: "rgba(245, 251, 255, 0.56)",
        bloomTwo: "rgba(141, 180, 212, 0.42)",
        bloomThree: "rgba(174, 204, 226, 0.34)",
        washTop: "rgba(217, 233, 244, 0.99)",
        washBottom: "rgba(184, 206, 223, 1)",
        hazeColor: "rgba(236, 245, 250, 0.24)",
        mistColor: "rgba(233, 242, 250, 0.08)",
    }),
    "wallpaper-3": createPaperWashTheme("wallpaper-3", "Soft Sage Paper", {
        base: "#dce6d3",
        titleInk: "#5f7c54",
        topGlow: "rgba(248, 252, 244, 0.68)",
        sideTint: "rgba(153, 184, 140, 0.36)",
        paperTop: "rgba(229, 239, 222, 0.99)",
        paperBottom: "rgba(203, 218, 191, 0.99)",
        fiberColor: "rgba(128, 151, 116, 0.15)",
        grainColor: "rgba(247, 250, 243, 0.09)",
        accentColor: "#8fa97d",
        accentOpacity: 22,
    }),
    "wallpaper-4": createOrganicAccentTheme("wallpaper-4", "Moss Garden", {
        base: "#cfdac3",
        titleInk: "#5f7f49",
        canopyOne: "rgba(215, 229, 198, 0.54)",
        canopyTwo: "rgba(101, 135, 88, 0.34)",
        bloomAccent: "rgba(150, 179, 118, 0.28)",
        washTop: "rgba(212, 227, 199, 0.99)",
        washBottom: "rgba(179, 198, 164, 1)",
        speckleColor: "rgba(243, 247, 234, 0.18)",
        driftColor: "rgba(78, 108, 68, 0.08)",
    }),
    "wallpaper-5": createPaperWashTheme("wallpaper-5", "Rice Field Beige", {
        base: "#e7d4ac",
        titleInk: "#966d1f",
        topGlow: "rgba(252, 246, 230, 0.72)",
        sideTint: "rgba(194, 166, 98, 0.36)",
        paperTop: "rgba(238, 225, 191, 0.99)",
        paperBottom: "rgba(216, 194, 143, 0.99)",
        fiberColor: "rgba(161, 132, 65, 0.14)",
        grainColor: "rgba(255, 247, 223, 0.09)",
        accentColor: "#b98d34",
        accentOpacity: 21,
    }),
    "wallpaper-6": createPaperWashTheme("wallpaper-6", "Floral Linen", {
        base: "#ead9d2",
        titleInk: "#a76f84",
        topGlow: "rgba(255, 248, 245, 0.70)",
        sideTint: "rgba(204, 162, 154, 0.34)",
        paperTop: "rgba(242, 228, 222, 0.99)",
        paperBottom: "rgba(222, 201, 194, 0.99)",
        fiberColor: "rgba(170, 137, 128, 0.14)",
        grainColor: "rgba(255, 246, 243, 0.09)",
        accentColor: "#c991a3",
        accentOpacity: 20,
    }),
    "wallpaper-7": createMistBloomTheme("wallpaper-7", "Lavender Mist", {
        base: "#ddd1ea",
        titleInk: "#7762a7",
        bloomOne: "rgba(250, 245, 255, 0.56)",
        bloomTwo: "rgba(168, 145, 202, 0.38)",
        bloomThree: "rgba(201, 185, 226, 0.34)",
        washTop: "rgba(231, 221, 243, 0.99)",
        washBottom: "rgba(207, 192, 228, 1)",
        hazeColor: "rgba(246, 240, 251, 0.20)",
        mistColor: "rgba(244, 237, 252, 0.07)",
    }),
    "wallpaper-8": createMistBloomTheme("wallpaper-8", "Peach Dawn", {
        base: "#eccdc0",
        titleInk: "#c27958",
        bloomOne: "rgba(255, 245, 239, 0.58)",
        bloomTwo: "rgba(223, 155, 126, 0.38)",
        bloomThree: "rgba(239, 194, 170, 0.34)",
        washTop: "rgba(243, 222, 213, 0.99)",
        washBottom: "rgba(226, 189, 172, 1)",
        hazeColor: "rgba(253, 240, 234, 0.20)",
        mistColor: "rgba(255, 245, 240, 0.06)",
    }),
    "wallpaper-9": createOrganicAccentTheme("wallpaper-9", "Rose Dust", {
        base: "#e6c8d1",
        titleInk: "#a75f79",
        canopyOne: "rgba(253, 242, 246, 0.52)",
        canopyTwo: "rgba(179, 110, 132, 0.32)",
        bloomAccent: "rgba(212, 152, 171, 0.26)",
        washTop: "rgba(237, 217, 224, 0.99)",
        washBottom: "rgba(217, 185, 197, 1)",
        speckleColor: "rgba(255, 246, 249, 0.16)",
        driftColor: "rgba(144, 79, 99, 0.07)",
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
