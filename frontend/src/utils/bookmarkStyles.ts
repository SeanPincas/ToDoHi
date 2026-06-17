import bookmark1 from "../assets/bookmark/bookmark-1.webp";
import bookmark2 from "../assets/bookmark/bookmark-2.webp";
import bookmark3 from "../assets/bookmark/bookmark-3.webp";
import bookmark4 from "../assets/bookmark/bookmark-4.webp";
import bookmark5 from "../assets/bookmark/bookmark-5.webp";
import bookmark6 from "../assets/bookmark/bookmark-6.webp";
import bookmark7 from "../assets/bookmark/bookmark-7.webp";
import bookmark8 from "../assets/bookmark/bookmark-8.webp";
import bookmark9 from "../assets/bookmark/bookmark-9.webp";
import bookmark10 from "../assets/bookmark/bookmark-10.webp";
import bookmark11 from "../assets/bookmark/bookmark-11.webp";

export type BookmarkTheme = {
    image: string;
    overlayTop: string;
    overlayBottom: string;
    ink: string;
    mutedInk: string;
    border: string;
    surface: string;
    surfaceHover: string;
    softSurface: string;
    surfaceInk: string;
    surfaceMutedInk: string;
    surfaceBorder: string;
    divider: string;
    headingBorder: string;
    burgerIcon: string;
    burgerHover: string;
    dragHandleIdle: string;
    dragHandleHover: string;
    guide: string;
    guideHover: string;
    logoHaloInner: string;
    logoHaloOuter: string;
    buttonSurface: string;
    buttonSurfaceHover: string;
    profileWrapperSurface: string;
    footerInk: string;
    toggleBorder: string;
};

type BookmarkThemeInput = Omit<
    BookmarkTheme,
    "image" | "logoHaloInner" | "logoHaloOuter" | "buttonSurface" | "buttonSurfaceHover" | "profileWrapperSurface" | "footerInk" | "toggleBorder"
> & Partial<
    Pick<
        BookmarkTheme,
        "logoHaloInner" | "logoHaloOuter" | "buttonSurface" | "buttonSurfaceHover" | "profileWrapperSurface" | "footerInk" | "toggleBorder"
    >
>;

const createTheme = (
    image: string,
    theme: BookmarkThemeInput
): BookmarkTheme => ({
    image,
    logoHaloInner: "rgba(255, 255, 255, 0.98)",
    logoHaloOuter: "rgba(241, 238, 231, 0.94)",
    buttonSurface: theme.softSurface,
    buttonSurfaceHover: theme.surfaceHover,
    profileWrapperSurface: theme.softSurface,
    footerInk: theme.mutedInk,
    toggleBorder: theme.surfaceBorder,
    ...theme,
});

const darkNavyTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(246, 244, 238, 0.18)",
        overlayBottom: "rgba(233, 227, 214, 0.12)",
        ink: "#f2c85b",
        mutedInk: "#e1bf6e",
        border: "#f2d58f",
        surface: "rgba(255, 250, 241, 0.96)",
        surfaceHover: "rgba(242, 233, 214, 0.98)",
        softSurface: "rgba(255, 249, 238, 0.9)",
        surfaceInk: "#17375b",
        surfaceMutedInk: "#49617d",
        surfaceBorder: "#27496b",
        divider: "rgba(255, 250, 241, 0.96)",
        headingBorder: "#0f2946",
        burgerIcon: "#163a61",
        burgerHover: "#0f2946",
        dragHandleIdle: "rgba(28, 58, 94, 0.92)",
        dragHandleHover: "rgba(14, 34, 58, 0.98)",
        guide: "rgba(223, 229, 238, 0.86)",
        guideHover: "rgba(247, 250, 255, 0.96)",
        logoHaloInner: "rgba(246, 251, 255, 0.99)",
        logoHaloOuter: "rgba(214, 229, 245, 0.95)",
        buttonSurface: "rgba(244, 250, 255, 0.95)",
        buttonSurfaceHover: "rgba(219, 234, 247, 0.98)",
        profileWrapperSurface: "rgba(242, 249, 255, 0.95)",
    });

const airyBlueTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(245, 251, 255, 0.2)",
        overlayBottom: "rgba(236, 245, 251, 0.16)",
        ink: "#13385f",
        mutedInk: "#33597e",
        border: "#33597e",
        surface: "rgba(255, 255, 255, 0.94)",
        surfaceHover: "rgba(225, 241, 252, 0.98)",
        softSurface: "rgba(246, 252, 255, 0.86)",
        surfaceInk: "#183a5e",
        surfaceMutedInk: "#49627f",
        surfaceBorder: "#264a70",
        divider: "#264a70",
        headingBorder: "#dfeaf7",
        burgerIcon: "#264a70",
        burgerHover: "#173654",
        dragHandleIdle: "rgba(112, 161, 204, 0.96)",
        dragHandleHover: "rgba(63, 111, 156, 0.98)",
        guide: "rgba(178, 192, 207, 0.86)",
        guideHover: "rgba(119, 141, 166, 0.96)",
        footerInk: "rgba(189, 220, 242, 0.88)",
    });

const forestTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(248, 251, 241, 0.16)",
        overlayBottom: "rgba(236, 243, 225, 0.1)",
        ink: "#133f2e",
        mutedInk: "#355e4d",
        border: "#274f3e",
        surface: "rgba(251, 252, 245, 0.95)",
        surfaceHover: "rgba(225, 240, 217, 0.98)",
        softSurface: "rgba(246, 250, 240, 0.84)",
        surfaceInk: "#18392d",
        surfaceMutedInk: "#486054",
        surfaceBorder: "#285144",
        divider: "#285144",
        headingBorder: "#d7ead1",
        burgerIcon: "#285144",
        burgerHover: "#1a382d",
        dragHandleIdle: "rgba(34, 94, 50, 0.94)",
        dragHandleHover: "rgba(18, 58, 31, 0.98)",
        guide: "rgba(173, 188, 171, 0.84)",
        guideHover: "rgba(112, 133, 118, 0.94)",
        logoHaloInner: "rgba(248, 255, 244, 0.99)",
        logoHaloOuter: "rgba(196, 232, 187, 0.96)",
        footerInk: "rgba(255, 255, 255, 0.97)",
        toggleBorder: "#c2e6b8",
    });

const deepRoseTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(20, 7, 8, 0.34)",
        overlayBottom: "rgba(12, 5, 6, 0.26)",
        ink: "#fff7ee",
        mutedInk: "#f2ddd2",
        border: "#f6dcc8",
        surface: "rgba(255, 249, 242, 0.97)",
        surfaceHover: "rgba(255, 236, 224, 0.99)",
        softSurface: "rgba(255, 247, 238, 0.9)",
        surfaceInk: "#4a2f39",
        surfaceMutedInk: "#765766",
        surfaceBorder: "#6d485a",
        divider: "#6d485a",
        headingBorder: "#f6dcc8",
        burgerIcon: "#6d485a",
        burgerHover: "#563544",
        dragHandleIdle: "rgba(234, 197, 206, 0.88)",
        dragHandleHover: "rgba(190, 112, 136, 0.96)",
        guide: "rgba(239, 214, 205, 0.88)",
        guideHover: "rgba(255, 239, 230, 0.98)",
    });

const sunflowerTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(255, 249, 232, 0.18)",
        overlayBottom: "rgba(248, 238, 208, 0.12)",
        ink: "#614112",
        mutedInk: "#7f5d27",
        border: "#7b5928",
        surface: "rgba(255, 252, 245, 0.95)",
        surfaceHover: "rgba(255, 240, 201, 0.98)",
        softSurface: "rgba(255, 250, 239, 0.88)",
        surfaceInk: "#4e3815",
        surfaceMutedInk: "#75592d",
        surfaceBorder: "#684b1e",
        divider: "#684b1e",
        headingBorder: "#f1d188",
        burgerIcon: "#684b1e",
        burgerHover: "#4d3614",
        dragHandleIdle: "rgba(239, 221, 168, 0.9)",
        dragHandleHover: "rgba(203, 160, 63, 0.97)",
        guide: "rgba(202, 181, 142, 0.84)",
        guideHover: "rgba(155, 121, 50, 0.94)",
    });

const blossomTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(255, 249, 246, 0.16)",
        overlayBottom: "rgba(249, 238, 234, 0.1)",
        ink: "#6f4458",
        mutedInk: "#8e6072",
        border: "#8e6072",
        surface: "rgba(255, 252, 250, 0.95)",
        surfaceHover: "rgba(253, 232, 240, 0.98)",
        softSurface: "rgba(255, 248, 247, 0.88)",
        surfaceInk: "#5d3a4c",
        surfaceMutedInk: "#826071",
        surfaceBorder: "#775164",
        divider: "#775164",
        headingBorder: "#f4d5e5",
        burgerIcon: "#775164",
        burgerHover: "#5c3b4d",
        dragHandleIdle: "rgba(236, 206, 223, 0.88)",
        dragHandleHover: "rgba(191, 118, 158, 0.96)",
        guide: "rgba(206, 184, 193, 0.84)",
        guideHover: "rgba(150, 109, 125, 0.94)",
    });

const meadowTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(254, 252, 241, 0.12)",
        overlayBottom: "rgba(248, 243, 221, 0.08)",
        ink: "#475118",
        mutedInk: "#5d6932",
        border: "#66743a",
        surface: "rgba(255, 253, 246, 0.94)",
        surfaceHover: "rgba(245, 240, 205, 0.98)",
        softSurface: "rgba(255, 252, 241, 0.86)",
        surfaceInk: "#3f4b1d",
        surfaceMutedInk: "#616e40",
        surfaceBorder: "#54612b",
        divider: "#54612b",
        headingBorder: "#ebf0c9",
        burgerIcon: "#54612b",
        burgerHover: "#3f491f",
        dragHandleIdle: "rgba(214, 226, 174, 0.88)",
        dragHandleHover: "rgba(145, 170, 76, 0.96)",
        guide: "rgba(203, 196, 160, 0.84)",
        guideHover: "rgba(126, 132, 80, 0.94)",
    });

const midnightStarTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(8, 14, 42, 0.24)",
        overlayBottom: "rgba(4, 9, 28, 0.18)",
        ink: "#fff9e8",
        mutedInk: "#e9edff",
        border: "#f7e7a7",
        surface: "rgba(255, 251, 238, 0.95)",
        surfaceHover: "rgba(245, 236, 185, 0.98)",
        softSurface: "rgba(244, 249, 255, 0.88)",
        surfaceInk: "#24345d",
        surfaceMutedInk: "#5d6887",
        surfaceBorder: "#3b4d82",
        divider: "#3b4d82",
        headingBorder: "#f7e7a7",
        burgerIcon: "#3b4d82",
        burgerHover: "#29375f",
        dragHandleIdle: "rgba(206, 216, 248, 0.88)",
        dragHandleHover: "rgba(136, 152, 220, 0.96)",
        guide: "rgba(193, 213, 238, 0.84)",
        guideHover: "rgba(245, 229, 158, 0.96)",
    });

const jewelGlassTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(10, 22, 24, 0.34)",
        overlayBottom: "rgba(6, 14, 15, 0.28)",
        ink: "#fff6df",
        mutedInk: "#eedfc4",
        border: "#f0c97d",
        surface: "rgba(255, 249, 236, 0.96)",
        surfaceHover: "rgba(235, 245, 250, 0.98)",
        softSurface: "rgba(255, 246, 226, 0.88)",
        surfaceInk: "#233f5f",
        surfaceMutedInk: "#586674",
        surfaceBorder: "#35516f",
        divider: "#35516f",
        headingBorder: "#f0c97d",
        burgerIcon: "#35516f",
        burgerHover: "#243b52",
        dragHandleIdle: "rgba(231, 210, 181, 0.88)",
        dragHandleHover: "rgba(186, 140, 92, 0.96)",
        guide: "rgba(187, 204, 193, 0.82)",
        guideHover: "rgba(247, 221, 152, 0.97)",
    });

const orchardNightTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(10, 8, 7, 0.34)",
        overlayBottom: "rgba(6, 5, 4, 0.28)",
        ink: "#fff4de",
        mutedInk: "#f3dcc0",
        border: "#efc787",
        surface: "rgba(255, 249, 238, 0.96)",
        surfaceHover: "rgba(255, 235, 209, 0.99)",
        softSurface: "rgba(255, 247, 231, 0.88)",
        surfaceInk: "#4a331d",
        surfaceMutedInk: "#79604a",
        surfaceBorder: "#66462b",
        divider: "#66462b",
        headingBorder: "#efc787",
        burgerIcon: "#66462b",
        burgerHover: "#4c321e",
        dragHandleIdle: "rgba(206, 225, 204, 0.88)",
        dragHandleHover: "rgba(120, 172, 151, 0.96)",
        guide: "rgba(223, 194, 156, 0.84)",
        guideHover: "rgba(248, 223, 181, 0.97)",
    });

const roseGlassTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(18, 10, 24, 0.3)",
        overlayBottom: "rgba(10, 6, 16, 0.24)",
        ink: "#fff3df",
        mutedInk: "#f0d8cf",
        border: "#f2c37b",
        surface: "rgba(255, 248, 238, 0.96)",
        surfaceHover: "rgba(255, 235, 221, 0.99)",
        softSurface: "rgba(255, 244, 233, 0.88)",
        surfaceInk: "#4e3048",
        surfaceMutedInk: "#7d5c70",
        surfaceBorder: "#6b4a62",
        divider: "#6b4a62",
        headingBorder: "#f2c37b",
        burgerIcon: "#6b4a62",
        burgerHover: "#523549",
        dragHandleIdle: "rgba(234, 210, 226, 0.88)",
        dragHandleHover: "rgba(181, 132, 176, 0.96)",
        guide: "rgba(223, 191, 160, 0.84)",
        guideHover: "rgba(245, 203, 132, 0.97)",
    });

export const BOOKMARK_THEME_MAP: Record<string, BookmarkTheme> = {
    default: darkNavyTheme(bookmark1),
    "bookmark-1": darkNavyTheme(bookmark1),
    "bookmark-2": airyBlueTheme(bookmark2),
    "bookmark-3": forestTheme(bookmark3),
    "bookmark-4": deepRoseTheme(bookmark4),
    "bookmark-5": sunflowerTheme(bookmark5),
    "bookmark-6": blossomTheme(bookmark6),
    "bookmark-7": meadowTheme(bookmark7),
    "bookmark-8": midnightStarTheme(bookmark8),
    "bookmark-9": orchardNightTheme(bookmark9),
    "bookmark-10": jewelGlassTheme(bookmark10),
    "bookmark-11": roseGlassTheme(bookmark11),
};

export const BOOKMARK_STYLE_OPTIONS = Object.keys(BOOKMARK_THEME_MAP).filter(
    (style) => style !== "default"
);

export const getBookmarkTheme = (style?: string) => {
    if (!style) return BOOKMARK_THEME_MAP["bookmark-1"];
    return BOOKMARK_THEME_MAP[style] ?? BOOKMARK_THEME_MAP["bookmark-1"];
};
