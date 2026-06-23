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

const navyFlowerTheme = (image: string) =>
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

const greenForestTheme = (image: string) =>
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
        logoHaloInner: "rgba(246, 255, 248, 0.99)",
        logoHaloOuter: "rgba(176, 220, 172, 0.97)",
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
        headingBorder: "#4a2f39",
        burgerIcon: "#6d485a",
        burgerHover: "#563544",
        dragHandleIdle: "rgba(234, 197, 206, 0.88)",
        dragHandleHover: "rgba(190, 112, 136, 0.96)",
        guide: "rgba(239, 214, 205, 0.88)",
        guideHover: "rgba(255, 239, 230, 0.98)",
        logoHaloInner: "rgba(255, 244, 247, 0.99)",
        logoHaloOuter: "rgba(197, 133, 157, 0.96)",
        buttonSurface: "rgba(255, 239, 238, 0.95)",
        buttonSurfaceHover: "rgba(231, 177, 192, 0.96)",
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
        logoHaloInner: "rgba(255, 252, 239, 0.99)",
        logoHaloOuter: "rgba(246, 223, 156, 0.96)",
    });

const pinkBlossomTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(255, 249, 246, 0.16)",
        overlayBottom: "rgba(249, 238, 234, 0.1)",
        ink: "#6f4458",
        mutedInk: "#8e6072",
        border: "#8e6072",
        surface: "rgba(255, 252, 250, 0.95)",
        surfaceHover: "rgba(253, 232, 240, 0.98)",
        softSurface: "rgba(255, 252, 252, 0.93)",
        surfaceInk: "#5d3a4c",
        surfaceMutedInk: "#826071",
        surfaceBorder: "#775164",
        divider: "#775164",
        headingBorder: "#f4d5e5",
        burgerIcon: "#775164",
        burgerHover: "#5c3b4d",
        dragHandleIdle: "rgba(255, 249, 252, 0.97)",
        dragHandleHover: "rgba(255, 225, 239, 0.99)",
        guide: "rgba(206, 184, 193, 0.84)",
        guideHover: "rgba(150, 109, 125, 0.94)",
        logoHaloInner: "rgba(255, 248, 252, 0.99)",
        logoHaloOuter: "rgba(255, 220, 236, 0.96)",
    });

const daisyMeadowTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(254, 252, 241, 0.12)",
        overlayBottom: "rgba(248, 243, 221, 0.08)",
        ink: "#475118",
        mutedInk: "#5d6932",
        border: "#66743a",
        surface: "rgba(255, 253, 246, 0.94)",
        surfaceHover: "rgba(245, 240, 205, 0.98)",
        softSurface: "rgba(84, 113, 54, 0.97)",
        surfaceInk: "#d6df9c",
        surfaceMutedInk: "#616e40",
        surfaceBorder: "#54612b",
        divider: "#54612b",
        headingBorder: "#ebf0c9",
        burgerIcon: "rgba(56, 88, 37, 0.94)",
        burgerHover: "rgba(27, 56, 20, 0.98)",
        dragHandleIdle: "rgba(56, 88, 37, 0.94)",
        dragHandleHover: "rgba(27, 56, 20, 0.98)",
        guide: "rgba(203, 196, 160, 0.84)",
        guideHover: "rgba(126, 132, 80, 0.94)",
        logoHaloInner: "rgba(236, 245, 231, 0.98)",
        logoHaloOuter: "rgba(96, 128, 72, 0.96)",
        buttonSurface: "rgba(96, 128, 63, 0.94)",
        buttonSurfaceHover: "rgba(121, 153, 82, 0.97)",
        footerInk: "rgba(54, 81, 39, 0.96)",
    });

const starryNightTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(8, 14, 42, 0.24)",
        overlayBottom: "rgba(4, 9, 28, 0.18)",
        ink: "#2747b8",
        mutedInk: "#2747b8",
        border: "#f7e76b",
        surface: "rgba(255, 251, 238, 0.95)",
        surfaceHover: "rgba(245, 236, 185, 0.98)",
        softSurface: "rgba(244, 249, 255, 0.88)",
        surfaceInk: "#24345d",
        surfaceMutedInk: "#5d6887",
        surfaceBorder: "#f7e76b",
        divider: "#f7e76b",
        headingBorder: "#f7e76b",
        burgerIcon: "#3b4d82",
        burgerHover: "#29375f",
        dragHandleIdle: "rgba(206, 216, 248, 0.88)",
        dragHandleHover: "rgba(136, 152, 220, 0.96)",
        guide: "rgba(193, 213, 238, 0.84)",
        guideHover: "rgba(245, 229, 158, 0.96)",
        logoHaloInner: "rgba(255, 240, 120, 0.98)",
        logoHaloOuter: "rgba(35, 54, 112, 0.97)",
        footerInk: "#f7e76b",
    });

const jewelGlassTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(10, 22, 24, 0.34)",
        overlayBottom: "rgba(6, 14, 15, 0.28)",
        ink: "#fff6df",
        mutedInk: "#eedfc4",
        border: "#f0c97d",
        surface: "rgba(255, 249, 236, 0.96)",
        surfaceHover: "rgba(225, 243, 225, 0.98)",
        softSurface: "rgba(255, 246, 226, 0.88)",
        surfaceInk: "#233f5f",
        surfaceMutedInk: "#586674",
        surfaceBorder: "#35516f",
        divider: "#35516f",
        headingBorder: "#3f6b45",
        burgerIcon: "#35516f",
        burgerHover: "#243b52",
        dragHandleIdle: "rgba(231, 210, 181, 0.88)",
        dragHandleHover: "rgba(186, 140, 92, 0.96)",
        guide: "rgba(187, 204, 193, 0.82)",
        guideHover: "rgba(247, 221, 152, 0.97)",
        logoHaloInner: "rgba(237, 246, 234, 0.98)",
        logoHaloOuter: "rgba(171, 204, 163, 0.96)",
        buttonSurfaceHover: "rgba(220, 241, 217, 0.98)",
        toggleBorder: "#6fa06d",
    });

const redOrchardsTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(10, 8, 7, 0.34)",
        overlayBottom: "rgba(6, 5, 4, 0.28)",
        ink: "#fff4de",
        mutedInk: "#f3dcc0",
        border: "#ff5b5b",
        surface: "rgba(255, 249, 238, 0.96)",
        surfaceHover: "rgba(255, 235, 209, 0.99)",
        softSurface: "rgba(255, 247, 231, 0.88)",
        surfaceInk: "#5a3728",
        surfaceMutedInk: "#79604a",
        surfaceBorder: "#ff5b5b",
        divider: "#66462b",
        headingBorder: "#f08ca2",
        burgerIcon: "#66462b",
        burgerHover: "#4c321e",
        dragHandleIdle: "rgba(255, 233, 235, 0.92)",
        dragHandleHover: "rgba(255, 196, 202, 0.97)",
        guide: "rgba(223, 194, 156, 0.84)",
        guideHover: "rgba(248, 223, 181, 0.97)",
        logoHaloInner: "rgba(255, 214, 224, 0.97)",
        logoHaloOuter: "rgba(255, 123, 148, 0.97)",
    });

const glassRoseTheme = (image: string) =>
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

const auroraTidesTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(6, 27, 36, 0.34)",
        overlayBottom: "rgba(3, 17, 24, 0.28)",
        ink: "#f6d96a",
        mutedInk: "#d8c98e",
        border: "#7fd3c7",
        surface: "rgba(249, 255, 251, 0.95)",
        surfaceHover: "rgba(223, 247, 241, 0.98)",
        softSurface: "rgba(240, 252, 248, 0.88)",
        surfaceInk: "#123c4a",
        surfaceMutedInk: "#4c6f78",
        surfaceBorder: "#1f5d66",
        divider: "#1f5d66",
        headingBorder: "#1f5a60",
        burgerIcon: "#1f5d66",
        burgerHover: "#123f48",
        dragHandleIdle: "rgba(77, 196, 188, 0.9)",
        dragHandleHover: "rgba(28, 129, 136, 0.98)",
        guide: "rgba(188, 223, 219, 0.86)",
        guideHover: "rgba(246, 223, 121, 0.94)",
        logoHaloInner: "rgba(236, 255, 249, 0.99)",
        logoHaloOuter: "rgba(103, 210, 197, 0.96)",
        buttonSurface: "rgba(238, 253, 248, 0.92)",
        buttonSurfaceHover: "rgba(205, 240, 233, 0.98)",
        profileWrapperSurface: "rgba(236, 251, 247, 0.93)",
        footerInk: "#d8c98e",
        toggleBorder: "#6dc9bd",
    });

const lilacMistTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(255, 240, 249, 0.18)",
        overlayBottom: "rgba(241, 224, 249, 0.14)",
        ink: "#5b3f84",
        mutedInk: "#7c639f",
        border: "#7f67ad",
        surface: "rgba(255, 252, 255, 0.95)",
        surfaceHover: "rgba(241, 233, 255, 0.98)",
        softSurface: "rgba(250, 245, 255, 0.89)",
        surfaceInk: "#4f357a",
        surfaceMutedInk: "#79658d",
        surfaceBorder: "#6c5498",
        divider: "#6c5498",
        headingBorder: "#f0c8e7",
        burgerIcon: "#6c5498",
        burgerHover: "#533b7b",
        dragHandleIdle: "rgba(199, 170, 236, 0.9)",
        dragHandleHover: "rgba(148, 112, 202, 0.98)",
        guide: "rgba(212, 198, 232, 0.84)",
        guideHover: "rgba(255, 226, 242, 0.96)",
        logoHaloInner: "rgba(255, 247, 252, 0.99)",
        logoHaloOuter: "rgba(215, 190, 245, 0.96)",
        buttonSurface: "rgba(252, 247, 255, 0.93)",
        buttonSurfaceHover: "rgba(232, 220, 252, 0.98)",
        profileWrapperSurface: "rgba(250, 245, 255, 0.93)",
        footerInk: "#efe0fa",
        toggleBorder: "#caa9e7",
    });

const charcoalSummitTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(246, 246, 246, 0.12)",
        overlayBottom: "rgba(216, 216, 216, 0.08)",
        ink: "#f5f3ee",
        mutedInk: "#ddd8d2",
        border: "#d9d4cc",
        surface: "rgba(250, 250, 248, 0.96)",
        surfaceHover: "rgba(236, 236, 233, 0.99)",
        softSurface: "rgba(247, 247, 244, 0.89)",
        surfaceInk: "#222629",
        surfaceMutedInk: "#676e73",
        surfaceBorder: "#3a4045",
        divider: "#3a4045",
        headingBorder: "#7f878d",
        burgerIcon: "#3a4045",
        burgerHover: "#1f2428",
        dragHandleIdle: "rgba(174, 180, 186, 0.92)",
        dragHandleHover: "rgba(108, 113, 119, 0.98)",
        guide: "rgba(207, 211, 216, 0.84)",
        guideHover: "rgba(244, 244, 244, 0.96)",
        logoHaloInner: "rgba(255, 255, 255, 0.99)",
        logoHaloOuter: "rgba(205, 210, 215, 0.96)",
        buttonSurface: "rgba(249, 249, 247, 0.93)",
        buttonSurfaceHover: "rgba(230, 232, 234, 0.98)",
        profileWrapperSurface: "rgba(246, 246, 243, 0.92)",
        footerInk: "#ece7df",
        toggleBorder: "#8d959c",
    });

const verdantGlowTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(230, 255, 184, 0.16)",
        overlayBottom: "rgba(188, 235, 136, 0.12)",
        ink: "#effbb5",
        mutedInk: "#d8eca1",
        border: "#d8f090",
        surface: "rgba(245, 253, 239, 0.95)",
        surfaceHover: "rgba(228, 244, 216, 0.98)",
        softSurface: "rgba(56, 104, 82, 0.95)",
        surfaceInk: "#e6f4bd",
        surfaceMutedInk: "#bfd59e",
        surfaceBorder: "#3a6e59",
        divider: "#3a6e59",
        headingBorder: "#2f5b4e",
        burgerIcon: "#2e6b57",
        burgerHover: "#18493a",
        dragHandleIdle: "#2f5b4e",
        dragHandleHover: "rgba(110, 176, 68, 0.98)",
        guide: "rgba(188, 224, 179, 0.84)",
        guideHover: "rgba(227, 255, 180, 0.94)",
        logoHaloInner: "rgba(243, 255, 232, 0.99)",
        logoHaloOuter: "rgba(165, 223, 122, 0.96)",
        buttonSurface: "rgba(58, 114, 90, 0.95)",
        buttonSurfaceHover: "rgba(75, 139, 109, 0.98)",
        profileWrapperSurface: "rgba(49, 96, 77, 0.95)",
        footerInk: "#e4f6b6",
        toggleBorder: "#97cf75",
    });

const moltenAmberTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(255, 244, 213, 0.16)",
        overlayBottom: "rgba(255, 209, 125, 0.12)",
        ink: "#8b3d0d",
        mutedInk: "#a35a1f",
        border: "#bb6a2e",
        surface: "rgba(255, 251, 242, 0.95)",
        surfaceHover: "rgba(255, 237, 208, 0.99)",
        softSurface: "rgba(255, 247, 230, 0.9)",
        surfaceInk: "#7d3a10",
        surfaceMutedInk: "#9e6a36",
        surfaceBorder: "#ad5c1d",
        divider: "#ad5c1d",
        headingBorder: "#f2ba63",
        burgerIcon: "#ad5c1d",
        burgerHover: "#8a4308",
        dragHandleIdle: "rgba(255, 182, 83, 0.92)",
        dragHandleHover: "rgba(241, 104, 29, 0.98)",
        guide: "rgba(230, 193, 145, 0.84)",
        guideHover: "rgba(255, 224, 157, 0.97)",
        logoHaloInner: "rgba(255, 251, 231, 0.99)",
        logoHaloOuter: "rgba(255, 163, 66, 0.96)",
        buttonSurface: "rgba(255, 246, 224, 0.92)",
        buttonSurfaceHover: "rgba(255, 225, 176, 0.98)",
        profileWrapperSurface: "rgba(255, 245, 220, 0.93)",
        footerInk: "#a35a1f",
        toggleBorder: "#d8893b",
    });

const lavenderFieldTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(255, 241, 246, 0.18)",
        overlayBottom: "rgba(239, 222, 255, 0.14)",
        ink: "#604b95",
        mutedInk: "#7c6aa9",
        border: "#8b76c6",
        surface: "rgba(255, 252, 253, 0.95)",
        surfaceHover: "rgba(243, 235, 255, 0.98)",
        softSurface: "rgba(252, 246, 255, 0.9)",
        surfaceInk: "#5a468e",
        surfaceMutedInk: "#85729c",
        surfaceBorder: "#755fb0",
        divider: "#755fb0",
        headingBorder: "#efc7dd",
        burgerIcon: "#755fb0",
        burgerHover: "#5a448e",
        dragHandleIdle: "rgba(212, 180, 248, 0.9)",
        dragHandleHover: "rgba(165, 127, 214, 0.98)",
        guide: "rgba(219, 205, 235, 0.84)",
        guideHover: "rgba(255, 231, 242, 0.96)",
        logoHaloInner: "rgba(255, 248, 253, 0.99)",
        logoHaloOuter: "rgba(212, 188, 245, 0.96)",
        buttonSurface: "rgba(251, 246, 255, 0.93)",
        buttonSurfaceHover: "rgba(234, 221, 253, 0.98)",
        profileWrapperSurface: "rgba(248, 243, 255, 0.93)",
        footerInk: "#f2d9f7",
        toggleBorder: "#c5a7eb",
    });

const alpineSageTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(235, 244, 229, 0.14)",
        overlayBottom: "rgba(205, 224, 191, 0.1)",
        ink: "#f0f4e6",
        mutedInk: "#dbe3cf",
        border: "#c5d8b3",
        surface: "rgba(249, 252, 245, 0.95)",
        surfaceHover: "rgba(233, 241, 223, 0.98)",
        softSurface: "rgba(84, 121, 83, 0.95)",
        surfaceInk: "#eef5df",
        surfaceMutedInk: "#cedab8",
        surfaceBorder: "#466a48",
        divider: "#466a48",
        headingBorder: "#9bc483",
        burgerHover: "#2d4a2f",
        dragHandleIdle: "rgba(171, 207, 148, 0.9)",
        dragHandleHover: "rgba(99, 145, 86, 0.98)",
        guide: "rgba(203, 219, 192, 0.84)",
        guideHover: "rgba(229, 246, 209, 0.95)",
        logoHaloInner: "rgba(246, 255, 239, 0.99)",
        logoHaloOuter: "rgba(165, 203, 145, 0.96)",
        burgerIcon: "rgba(165, 203, 145, 0.96)",
        buttonSurface: "rgba(77, 118, 75, 0.95)",
        buttonSurfaceHover: "rgba(98, 144, 95, 0.98)",
        profileWrapperSurface: "rgba(72, 108, 69, 0.95)",
        footerInk: "#e7efd8",
        toggleBorder: "#8ab177",
    });

const sunsetLakeTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(255, 205, 141, 0.14)",
        overlayBottom: "rgba(255, 159, 87, 0.1)",
        ink: "#6a2518",
        mutedInk: "#90422d",
        border: "#8a3f2e",
        surface: "rgba(255, 248, 239, 0.95)",
        surfaceHover: "rgba(255, 232, 205, 0.98)",
        softSurface: "rgba(255, 247, 231, 0.89)",
        surfaceInk: "#63261d",
        surfaceMutedInk: "#856251",
        surfaceBorder: "#7c3324",
        divider: "#7c3324",
        headingBorder: "#efb46b",
        burgerIcon: "#7c3324",
        burgerHover: "#5f2417",
        dragHandleIdle: "rgba(245, 173, 119, 0.9)",
        dragHandleHover: "rgba(197, 87, 45, 0.98)",
        guide: "rgba(225, 188, 156, 0.84)",
        guideHover: "rgba(255, 216, 164, 0.95)",
        logoHaloInner: "rgba(255, 247, 229, 0.99)",
        logoHaloOuter: "rgba(243, 150, 90, 0.96)",
        buttonSurface: "rgba(255, 245, 224, 0.92)",
        buttonSurfaceHover: "rgba(255, 219, 188, 0.98)",
        profileWrapperSurface: "rgba(255, 243, 218, 0.92)",
        footerInk: "#8e422c",
        toggleBorder: "#c96d47",
    });

const frostPineTheme = (image: string) =>
    createTheme(image, {
        overlayTop: "rgba(245, 248, 248, 0.14)",
        overlayBottom: "rgba(218, 227, 234, 0.1)",
        ink: "#183246",
        mutedInk: "#496073",
        border: "#6a8296",
        surface: "rgba(252, 253, 252, 0.96)",
        surfaceHover: "rgba(234, 241, 246, 0.98)",
        softSurface: "rgba(247, 251, 253, 0.89)",
        surfaceInk: "#183246",
        surfaceMutedInk: "#617384",
        surfaceBorder: "#425c70",
        divider: "#425c70",
        headingBorder: "#d5dde2",
        burgerIcon: "#425c70",
        burgerHover: "#253e4f",
        dragHandleIdle: "rgba(168, 186, 201, 0.9)",
        dragHandleHover: "rgba(93, 116, 137, 0.98)",
        guide: "rgba(205, 214, 222, 0.84)",
        guideHover: "rgba(240, 245, 248, 0.96)",
        logoHaloInner: "rgba(255, 255, 255, 0.99)",
        logoHaloOuter: "rgba(197, 210, 220, 0.96)",
        buttonSurface: "rgba(248, 251, 253, 0.93)",
        buttonSurfaceHover: "rgba(227, 236, 242, 0.98)",
        profileWrapperSurface: "rgba(246, 250, 252, 0.93)",
        footerInk: "#d7e1e7",
        toggleBorder: "#8aa1b3",
    });

export const BOOKMARK_THEME_MAP: Record<string, BookmarkTheme> = {
    default: navyFlowerTheme(""),
    "bookmark-1": navyFlowerTheme(""),
    "bookmark-2": airyBlueTheme(""),
    "bookmark-3": greenForestTheme(""),
    "bookmark-4": deepRoseTheme(""),
    "bookmark-5": sunflowerTheme(""),
    "bookmark-6": pinkBlossomTheme(""),
    "bookmark-7": daisyMeadowTheme(""),
    "bookmark-8": starryNightTheme(""),
    "bookmark-9": redOrchardsTheme(""),
    "bookmark-10": jewelGlassTheme(""),
    "bookmark-11": glassRoseTheme(""),
    "bookmark-12": auroraTidesTheme(""),
    "bookmark-13": lilacMistTheme(""),
    "bookmark-14": charcoalSummitTheme(""),
    "bookmark-15": verdantGlowTheme(""),
    "bookmark-16": moltenAmberTheme(""),
    "bookmark-17": lavenderFieldTheme(""),
    "bookmark-18": alpineSageTheme(""),
    "bookmark-19": sunsetLakeTheme(""),
    "bookmark-20": frostPineTheme(""),
};

const BOOKMARK_IMAGE_LOADERS: Record<string, () => Promise<{ default: string }>> = {
    "bookmark-1": () => import("../assets/bookmark/bookmark-1.webp"),
    "bookmark-2": () => import("../assets/bookmark/bookmark-2.webp"),
    "bookmark-3": () => import("../assets/bookmark/bookmark-3.webp"),
    "bookmark-4": () => import("../assets/bookmark/bookmark-4.webp"),
    "bookmark-5": () => import("../assets/bookmark/bookmark-5.webp"),
    "bookmark-6": () => import("../assets/bookmark/bookmark-6.webp"),
    "bookmark-7": () => import("../assets/bookmark/bookmark-7.webp"),
    "bookmark-8": () => import("../assets/bookmark/bookmark-8.webp"),
    "bookmark-9": () => import("../assets/bookmark/bookmark-9.webp"),
    "bookmark-10": () => import("../assets/bookmark/bookmark-10.webp"),
    "bookmark-11": () => import("../assets/bookmark/bookmark-11.webp"),
    "bookmark-12": () => import("../assets/bookmark/bookmark-12.webp"),
    "bookmark-13": () => import("../assets/bookmark/bookmark-13.webp"),
    "bookmark-14": () => import("../assets/bookmark/bookmark-14.webp"),
    "bookmark-15": () => import("../assets/bookmark/bookmark-15.webp"),
    "bookmark-16": () => import("../assets/bookmark/bookmark-16.webp"),
    "bookmark-17": () => import("../assets/bookmark/bookmark-17.webp"),
    "bookmark-18": () => import("../assets/bookmark/bookmark-18.webp"),
    "bookmark-19": () => import("../assets/bookmark/bookmark-19.webp"),
    "bookmark-20": () => import("../assets/bookmark/bookmark-20.webp"),
};

export const BOOKMARK_STYLE_OPTIONS = Object.keys(BOOKMARK_THEME_MAP).filter(
    (style) => style !== "default"
);

export const BOOKMARK_STYLE_LABELS: Record<string, string> = {
    "bookmark-1": "Navy Flower",
    "bookmark-2": "Airy Blue",
    "bookmark-3": "Green Forest",
    "bookmark-4": "Deep Rose",
    "bookmark-5": "Sunflower",
    "bookmark-6": "Pink Blossom",
    "bookmark-7": "Daisy Meadow",
    "bookmark-8": "Starry Night",
    "bookmark-9": "Red Orchards",
    "bookmark-10": "Jewel Glass",
    "bookmark-11": "Glass Rose",
    "bookmark-12": "Aurora Tides",
    "bookmark-13": "Lilac Mist",
    "bookmark-14": "Charcoal Summit",
    "bookmark-15": "Verdant Glow",
    "bookmark-16": "Molten Amber",
    "bookmark-17": "Lavender Field",
    "bookmark-18": "Alpine Sage",
    "bookmark-19": "Sunset Lake",
    "bookmark-20": "Frost Pine",
};

export const getBookmarkTheme = (style?: string) => {
    if (!style) return BOOKMARK_THEME_MAP["bookmark-1"];
    return BOOKMARK_THEME_MAP[style] ?? BOOKMARK_THEME_MAP["bookmark-1"];
};

export const loadBookmarkThemeImage = async (style?: string) => {
    const normalizedStyle = style && BOOKMARK_IMAGE_LOADERS[style] ? style : "bookmark-1";
    const module = await BOOKMARK_IMAGE_LOADERS[normalizedStyle]();
    return module.default;
};
