import axios from 'axios';
import { getCachedData, getCacheKey } from './cache';
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const BASE_URL = 'https://www.alphavantage.co/query';
const TTL = {
    FUNDAMENTAL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};
export async function getCompanyOverview(symbol) {
    return getCachedData(getCacheKey('overview', symbol), TTL.FUNDAMENTAL, async () => {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    function: 'OVERVIEW',
                    symbol,
                    apikey: ALPHA_VANTAGE_API_KEY
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching company overview:', error);
            return null;
        }
    });
}
export async function getIncomeStatement(symbol) {
    return getCachedData(getCacheKey('income', symbol), TTL.FUNDAMENTAL, async () => {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    function: 'INCOME_STATEMENT',
                    symbol,
                    apikey: ALPHA_VANTAGE_API_KEY
                }
            });
            return response.data.annualReports || [];
        }
        catch (error) {
            console.error('Error fetching income statement:', error);
            return [];
        }
    });
}
export async function getBalanceSheet(symbol) {
    return getCachedData(getCacheKey('balance', symbol), TTL.FUNDAMENTAL, async () => {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    function: 'BALANCE_SHEET',
                    symbol,
                    apikey: ALPHA_VANTAGE_API_KEY
                }
            });
            return response.data.annualReports || [];
        }
        catch (error) {
            console.error('Error fetching balance sheet:', error);
            return [];
        }
    });
}
export async function getCashFlow(symbol) {
    return getCachedData(getCacheKey('cashflow', symbol), TTL.FUNDAMENTAL, async () => {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    function: 'CASH_FLOW',
                    symbol,
                    apikey: ALPHA_VANTAGE_API_KEY
                }
            });
            return response.data.annualReports || [];
        }
        catch (error) {
            console.error('Error fetching cash flow:', error);
            return [];
        }
    });
}
export async function getEarnings(symbol) {
    return getCachedData(getCacheKey('earnings', symbol), TTL.FUNDAMENTAL, async () => {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    function: 'EARNINGS',
                    symbol,
                    apikey: ALPHA_VANTAGE_API_KEY
                }
            });
            return response.data.quarterlyEarnings || [];
        }
        catch (error) {
            console.error('Error fetching earnings data:', error);
            return [];
        }
    });
}
