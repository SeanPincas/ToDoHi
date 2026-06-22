import { getQuotesByCategoryApi, getRandomQuoteApi } from "../api/quoteApi";
import { QUOTE_DELAY_OPTIONS, type QuoteCategory, type QuoteDelayMinutes } from "./quoteUtils";

export const FALLBACK_QUOTE_TEXT = "Stay productive today.";
const DEFAULT_QUOTE_DELAY_MINUTES: QuoteDelayMinutes = 10;

export function getPreferredQuoteCategory(preferences?: string[] | null): QuoteCategory {
    const preferred = Array.isArray(preferences) ? preferences[0] : undefined;
    return (preferred ? preferred : "Random") as QuoteCategory;
}

export function getPreferredQuoteDelayMinutes(delay?: number | null): QuoteDelayMinutes {
    return QUOTE_DELAY_OPTIONS.includes(delay as QuoteDelayMinutes)
        ? (delay as QuoteDelayMinutes)
        : DEFAULT_QUOTE_DELAY_MINUTES;
}

export function getQuoteRotationIntervalMs(delay?: number | null): number {
    return getPreferredQuoteDelayMinutes(delay) * 60_000;
}

export async function fetchRotatingQuoteText(category: QuoteCategory): Promise<string> {
    if (category === "Random") {
        const res = await getRandomQuoteApi();
        return res.quote?.text || FALLBACK_QUOTE_TEXT;
    }

    const res = await getQuotesByCategoryApi(category);

    if (!Array.isArray(res.quotes) || res.quotes.length === 0) {
        return FALLBACK_QUOTE_TEXT;
    }

    const randomIndex = Math.floor(Math.random() * res.quotes.length);
    return res.quotes[randomIndex]?.text || FALLBACK_QUOTE_TEXT;
}
