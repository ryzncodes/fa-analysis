import axios from 'axios';
import { getCachedData, getCacheKey } from './cache';
import { IncomeStatementItem, BalanceSheetItem, CashFlowItem, EarningsItem } from './types/stock';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const BASE_URL = 'https://www.alphavantage.co/query';

const TTL = {
  FUNDAMENTAL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

interface CompanyOverview {
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  Address: string;
  FiscalYearEnd: string;
  LatestQuarter: string;
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  DilutedEPSTTM: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  WeekHigh52: string;
  WeekLow52: string;
  DayMovingAverage50: string;
  DayMovingAverage200: string;
  SharesOutstanding: string;
  SharesFloat: string;
  SharesShort: string;
  SharesShortPriorMonth: string;
  ShortRatio: string;
  ShortPercentOutstanding: string;
  ShortPercentFloat: string;
  PercentInsiders: string;
  PercentInstitutions: string;
  ForwardAnnualDividendRate: string;
  ForwardAnnualDividendYield: string;
  PayoutRatio: string;
  DividendDate: string;
  ExDividendDate: string;
  LastSplitFactor: string;
  LastSplitDate: string;
}

export async function getCompanyOverview(symbol: string): Promise<CompanyOverview | null> {
  return getCachedData(
    getCacheKey('overview', symbol),
    TTL.FUNDAMENTAL,
    async () => {
      try {
        const response = await axios.get<CompanyOverview>(BASE_URL, {
          params: {
            function: 'OVERVIEW',
            symbol,
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });

        return response.data;
      } catch (error) {
        console.error('Error fetching company overview:', error);
        return null;
      }
    }
  );
}

export async function getIncomeStatement(symbol: string): Promise<IncomeStatementItem[]> {
  return getCachedData(
    getCacheKey('income', symbol),
    TTL.FUNDAMENTAL,
    async () => {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'INCOME_STATEMENT',
            symbol,
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });

        return response.data.annualReports || [];
      } catch (error) {
        console.error('Error fetching income statement:', error);
        return [];
      }
    }
  );
}

export async function getBalanceSheet(symbol: string): Promise<BalanceSheetItem[]> {
  return getCachedData(
    getCacheKey('balance', symbol),
    TTL.FUNDAMENTAL,
    async () => {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'BALANCE_SHEET',
            symbol,
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });

        return response.data.annualReports || [];
      } catch (error) {
        console.error('Error fetching balance sheet:', error);
        return [];
      }
    }
  );
}

export async function getCashFlow(symbol: string): Promise<CashFlowItem[]> {
  return getCachedData(
    getCacheKey('cashflow', symbol),
    TTL.FUNDAMENTAL,
    async () => {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'CASH_FLOW',
            symbol,
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });

        return response.data.annualReports || [];
      } catch (error) {
        console.error('Error fetching cash flow:', error);
        return [];
      }
    }
  );
}

export async function getEarnings(symbol: string): Promise<EarningsItem[]> {
  return getCachedData(
    getCacheKey('earnings', symbol),
    TTL.FUNDAMENTAL,
    async () => {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'EARNINGS',
            symbol,
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });

        return response.data.quarterlyEarnings || [];
      } catch (error) {
        console.error('Error fetching earnings data:', error);
        return [];
      }
    }
  );
} 