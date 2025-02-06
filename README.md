# Fundamental Analysis Webapp

A modern web application that provides data-driven fundamental analysis for stocks. The system fetches financial data from multiple sources including Yahoo Finance and Alpha Vantage, standardizes the information, and leverages a Retrieval-Augmented Generation (RAG) approach with an LLM for comprehensive analysis.

## Features

- 📊 Real-time stock data fetching from multiple sources
- 📈 Comprehensive financial metrics
- 📑 Company profiles and key statistics
- 📰 Latest news with full article content
- 💹 Dividend information and analysis
- 🔄 Efficient data caching
- 🤖 RAG-powered analysis (Coming Soon)

## Tech Stack

### Frontend
- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **UI Components:** shadcn/ui (based on Radix UI primitives)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

### Backend
- **Framework:** Next.js API Routes (serverless functions)
- **Language:** TypeScript
- **Data Sources:** 
  - Yahoo Finance API
  - Alpha Vantage API
- **Caching:** In-memory caching system

### LLM Integration (Coming Soon)
- **Language:** Python
- **Purpose:** Wrapper for LLM interaction
- **Integration:** API endpoint to connect frontend with Python backend

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
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## API Endpoints

### GET /api/stock/[ticker]
Fetches comprehensive stock data including:
- Current market data
- Company profile
- Financial metrics
- Key statistics
- Dividend information
- Latest news with full article content
- Income statements
- Balance sheets
- Cash flow statements
- Earnings data

Example response:
```json
{
  "quote": {
    "symbol": "AAPL",
    "regularMarketPrice": 232.8,
    // ... more market data
  },
  "profile": {
    "longName": "Apple Inc.",
    "industry": "Consumer Electronics",
    // ... more company info
  },
  "fundamentals": {
    "incomeStatements": [...],
    "balanceSheets": [...],
    "cashFlows": [...],
    "earnings": [...]
  },
  // ... financial data, news, etc.
}
```

## Project Structure
```
├── app/
│   ├── api/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── favicon.ico
├── lib/
│   ├── types/
│   ├── stock-news-service.ts
│   ├── alpha-vantage-service.ts
│   ├── alpha-vantage.ts
│   ├── cache.ts
│   └── stock-service.ts
├── public/
├── .next/
├── node_modules/
├── .env.local
├── package.json
├── package-lock.json
└── [configuration files]
```

## Future Enhancements

- [ ] RAG Integration for AI-powered analysis
- [ ] Additional financial data sources
- [ ] Advanced data visualization
- [ ] User authentication
- [ ] Saved analysis reports
- [ ] Portfolio tracking
- [ ] Enhanced caching strategies
- [ ] Performance optimization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
