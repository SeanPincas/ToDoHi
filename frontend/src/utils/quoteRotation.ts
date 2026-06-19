import { getQuotesByCategoryApi, getRandomQuoteApi } from "../api/quoteApi";
import type { QuoteCategory } from "./quoteUtils";

export const FALLBACK_QUOTE_TEXT = "Stay productive today.";
export const QUOTE_ROTATION_INTERVAL_MS = 45_000;

export function getPreferredQuoteCategory(preferences?: string[] | null): QuoteCategory {
    const preferred = Array.isArray(preferences) ? preferences[0] : undefined;
    return (preferred ? preferred : "Random") as QuoteCategory;
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
