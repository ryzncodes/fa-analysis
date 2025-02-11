export async function getMarketIndices() {
    try {
        const response = await fetch("/api/market?type=indices");
        if (!response.ok)
            throw new Error("Failed to fetch market indices");
        return response.json();
    }
    catch (error) {
        console.error("Error fetching market indices:", error);
        return [];
    }
}
export async function getTrendingStocks() {
    try {
        const response = await fetch("/api/market?type=trending");
        if (!response.ok)
            throw new Error("Failed to fetch trending stocks");
        return response.json();
    }
    catch (error) {
        console.error("Error fetching trending stocks:", error);
        return [];
    }
}
export async function getMarketSentiment() {
    try {
        const response = await fetch("/api/market?type=sentiment");
        if (!response.ok)
            throw new Error("Failed to fetch market sentiment");
        return response.json();
    }
    catch (error) {
        console.error("Error fetching market sentiment:", error);
        return {
            sentiment: 65,
            volume: "8.2B",
            volatility: 14.2
        };
    }
}
