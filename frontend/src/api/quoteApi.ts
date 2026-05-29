// ============================================================================
// quoteApi.ts
// Frontend ↔ Backend bridge for QUOTES
// Handles fetching random quotes + saving preferences
// ============================================================================

import axios from "axios";
import { authHeaders } from "../utils/authHeaders";

// ---------------------------------------------------------------------------
// BASE ROUTE
// ---------------------------------------------------------------------------

const BASE = "http://localhost:3500/api/quotes";

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export interface QuoteItem {
    text: string;
    author?: string;
    category: string;
}

// ---------------------------------------------------------------------------
// UPDATE USER QUOTE PREFERENCES
// PUT /api/quotes/preferences
// Body: { preferences: ["Motivation"] }
// ---------------------------------------------------------------------------

export const updateQuotePreferencesApi = async (
    preferences: string[]
) => {
    const res = await axios.put(
        `${BASE}/preferences`,
        { preferences },
        authHeaders()
    );

    return res.data;
};

// ---------------------------------------------------------------------------
// GET RANDOM QUOTE (BASED ON USER PREFS)
// GET /api/quotes/random
// ---------------------------------------------------------------------------

export const getRandomQuoteApi = async (): Promise<{ quote: QuoteItem }> => {
    const res = await axios.get(
        `${BASE}/random`,
        authHeaders()
    );

    return res.data;
};

// ---------------------------------------------------------------------------
// GET QUOTES BY CATEGORY
// GET /api/quotes/category/:category
// ---------------------------------------------------------------------------

export const getQuotesByCategoryApi = async (
    category: string
): Promise<{ quotes: QuoteItem[] }> => {
    const res = await axios.get(
        `${BASE}/category/${category}`,
        authHeaders()
    );

    return res.data;
};
