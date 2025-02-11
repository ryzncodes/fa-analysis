# Fundamental Analysis Webapp

A modern web application that provides data-driven fundamental analysis for stocks. The system fetches financial data from multiple sources including Yahoo Finance, standardizes and processes the information with robust error handling and efficient caching, and leverages a Retrieval-Augmented Generation (RAG) approach with an LLM for comprehensive analysis.

## Features

- 📊 Real-time stock data fetching from Yahoo Finance
- 💰 Comprehensive financial metrics including company profiles, key statistics, dividend information, and news feeds
- ⚙️ Robust error handling with custom error types, retry mechanisms, and structured logging
- 🔄 Efficient caching system using both in-memory and file-based strategies for faster data retrieval
- 🧮 Data Standardization utilities such as date normalization, number formatting, and currency formatting
- 🤖 RAG-powered analysis (In Progress)
- 🎨 Responsive UI with ongoing improvements for enhanced user experience

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
- **Data Source:** Yahoo Finance API
- **Caching:** Efficient in-memory and file-based caching system
- **Error Handling:** Custom error classes with retry logic and detailed logging

### LLM Integration (In Progress)
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

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### GET /api/stock/[ticker]
Fetches comprehensive stock data including:
- Current market data such as symbol, price, and volume.
- Company profile & key statistics.
- Dividend information.
- Latest news with full article content.
- Additional financial metrics such as income statements, balance sheets, cash flows, and earnings data.

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
  }
  // ... additional financial data, news, etc.
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
│   ├── stock-service.ts
│   └── utils/
│       ├── errorHandler.ts
│       ├── standardize.ts
│       └── inMemoryCache.ts
├── public/
├── .next/
├── node_modules/
├── .env.local
├── package.json
├── package-lock.json
└── [other configuration files]
```

## Future Enhancements

- [ ] RAG-powered analysis improvements
- [ ] Enhanced UI with better data visualization and responsive design
- [ ] Integration with additional financial data sources
- [ ] User authentication and personalized reporting
- [ ] Advanced caching strategies and performance optimizations
- [ ] Comprehensive integration and end-to-end testing

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
