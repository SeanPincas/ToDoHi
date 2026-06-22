import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuthContext } from "./AuthContext";
import {
    FALLBACK_QUOTE_TEXT,
    fetchRotatingQuoteText,
    getPreferredQuoteCategory,
    getQuoteRotationIntervalMs,
} from "../utils/quoteRotation";

interface QuoteContextType {
    currentQuote: string;
    refreshQuote: () => Promise<void>;
}

const QuoteContext = createContext<QuoteContextType | null>(null);

export const useQuote = () => {
    const ctx = useContext(QuoteContext);
    if (!ctx) {
        throw new Error("useQuote must be used inside <QuoteProvider>");
    }
    return ctx;
};

export const QuoteProvider = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuthContext();
    const [currentQuote, setCurrentQuote] = useState(FALLBACK_QUOTE_TEXT);

    const refreshQuote = async () => {
        if (!user) {
            setCurrentQuote(FALLBACK_QUOTE_TEXT);
            return;
        }

        try {
            const category = getPreferredQuoteCategory(user.preference?.quoteCategory);
            const quoteText = await fetchRotatingQuoteText(category);
            setCurrentQuote(quoteText);
        } catch (err) {
            console.error("[QuoteContext] Failed fetching quote:", err);
            setCurrentQuote(FALLBACK_QUOTE_TEXT);
        }
    };

    useEffect(() => {
        if (loading) return;

        if (!user) {
            setCurrentQuote(FALLBACK_QUOTE_TEXT);
            return;
        }

        refreshQuote();
        const rotationTimer = window.setInterval(
            refreshQuote,
            getQuoteRotationIntervalMs(user.preference?.quoteDelay)
        );

        return () => {
            window.clearInterval(rotationTimer);
        };
    }, [loading, user?._id, user?.preference?.quoteDelay, JSON.stringify(user?.preference?.quoteCategory)]);

    const value = useMemo(
        () => ({
            currentQuote,
            refreshQuote,
        }),
        [currentQuote]
    );

    return (
        <QuoteContext.Provider value={value}>
            {children}
        </QuoteContext.Provider>
    );
};
