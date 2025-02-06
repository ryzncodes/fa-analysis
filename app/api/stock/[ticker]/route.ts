import { NextRequest, NextResponse } from 'next/server';
import { getStockData } from '../../../../lib/stock-service';

export const dynamic = 'force-dynamic'; // Ensure the route is dynamic
export const dynamicParams = true;

export async function GET(
  _request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    // In Next.js 15, we need to await params to access its properties
    const { ticker } = await params;

    if (!ticker) {
      return NextResponse.json(
        { error: 'Stock ticker is required' },
        { status: 400 }
      );
    }

    // Get stock data
    const stockData = await getStockData(ticker.toUpperCase());

    // Check for errors
    if (stockData.error) {
      return NextResponse.json(
        { error: stockData.error },
        { status: 500 }
      );
    }

    // Return the stock data
    return NextResponse.json(stockData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
} 