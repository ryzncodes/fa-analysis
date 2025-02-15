# Fundamental Analysis Webapp

A modern web application that provides data-driven fundamental analysis for stocks. The system fetches financial data from multiple sources including Yahoo Finance and Alpha Vantage, standardizes and processes the information with robust error handling and efficient caching, and leverages OpenAI for comprehensive analysis.

## Features

- 📊 Real-time stock data fetching from Yahoo Finance and Alpha Vantage
- 💰 Comprehensive financial metrics including:
  - Company profiles and key statistics
  - Real-time market data
  - Historical price data with interactive charts
  - Dividend information
  - News feeds with full article content
- 📈 Interactive price charts with multiple timeframes (1D, 1W, 1M, 3M, 1Y, 5Y)
- ⚙️ Robust error handling with custom error types and structured logging
- 🔄 Efficient caching system using both in-memory and file-based strategies
- 🧮 Data standardization utilities for dates, numbers, and currencies
- 🤖 OpenAI-powered analysis integration
- 🎨 Modern, responsive UI with dark mode support

## Tech Stack

### Frontend

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **UI Components:** shadcn/ui (based on Radix UI primitives)
- **Styling:** Tailwind CSS
- **Charts:** Lightweight Charts
- **Icons:** Lucide React

### Backend

- **Framework:** Next.js API Routes (serverless functions)
- **Language:** TypeScript
- **Data Sources:**
  - Yahoo Finance API
  - Alpha Vantage API
- **Caching:** Hybrid in-memory and file-based caching system
- **Error Handling:** Custom error classes with detailed logging

### AI Integration

- **Provider:** OpenAI
- **Purpose:** Enhanced financial analysis and insights
- **Integration:** Direct API integration via Next.js API routes

## Getting Started

1. Clone the repository:

```bash
git clone [repository-url]
cd [repository-name]
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file with:

```env
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### GET /api/market

Fetches market data with support for:

- Real-time quotes
- Historical price data with customizable timeframes
- Volume data

### GET /api/stock/[ticker]

Fetches comprehensive stock data including:

- Current market data (price, volume, etc.)
- Company profile & key statistics
- Dividend information
- Latest news with full article content
- Financial metrics (income statements, balance sheets, cash flows)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── market/
│   │   └── stock/
│   ├── stock/
│   │   └── [ticker]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── stock/
│   │   ├── PriceChart.tsx
│   │   └── [other components]
│   └── ui/
├── lib/
│   ├── market-service.ts
│   ├── stock-service.ts
│   ├── openai-service.ts
│   ├── alpha-vantage-service.ts
│   ├── stock-news-service.ts
│   ├── cache.ts
│   └── utils/
├── types/
├── public/
└── [configuration files]
```

## Future Enhancements

- [ ] Enhanced AI-powered analysis features
- [ ] Portfolio tracking and management
- [ ] Advanced technical analysis tools
- [ ] Real-time price alerts and notifications
- [ ] User authentication and personalized watchlists
- [ ] Additional data sources integration
- [ ] Performance optimizations and caching improvements
- [ ] Comprehensive testing suite

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
