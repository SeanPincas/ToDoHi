// ============================================================================
// memoBoardMetrics.ts
// Shared responsive metrics for memo card / pin / boundary math.
// ============================================================================

const parseCssPixelVar = (
    styles: CSSStyleDeclaration,
    variableName: string,
    fallback: number
) => {
    const raw = styles.getPropertyValue(variableName).trim();
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export interface MemoBoardMetrics {
    pinSize: number;
    pinTopOffset: number;
    boundaryStroke: number;
    boundaryPadding: number;
}

export const getMemoBoardMetrics = (element: Element | null): MemoBoardMetrics => {
    if (!element) {
        return {
            pinSize: 14,
            pinTopOffset: 5,
            boundaryStroke: 4,
            boundaryPadding: 11,
        };
    }

    const styles = window.getComputedStyle(element);
    const pinSize = parseCssPixelVar(styles, "--memo-pin-size", 14);
    const pinTopOffset = parseCssPixelVar(styles, "--memo-pin-top-offset", 5);
    const boundaryStroke = parseCssPixelVar(styles, "--memo-boundary-stroke", 4);

    return {
        pinSize,
        pinTopOffset,
        boundaryStroke,
        // Clamp using the visible red line + the full pin radius.
        boundaryPadding: Math.ceil(boundaryStroke + pinSize / 2),
    };
};
