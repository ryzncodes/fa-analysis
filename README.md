# Fundamental Analysis Webapp

A modern web application that provides data-driven fundamental analysis for stocks. The system fetches financial data from Yahoo Finance, standardizes the information, and leverages a Retrieval-Augmented Generation (RAG) approach with an LLM for comprehensive analysis.

## Features

- 📊 Real-time stock data fetching
- 📈 Comprehensive financial metrics
- 📑 Company profiles and key statistics
- 📰 Latest news with full article content
- 💹 Dividend information and analysis
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
- **Data Source:** Yahoo Finance API

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

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## API Endpoints

### GET /api/stock/[ticker]
Fetches comprehensive stock data including:
- Current market data
- Company profile
- Financial metrics
- Key statistics
- Dividend information
- Latest news with full article content

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
  // ... financial data, news, etc.
}
```

## Project Structure
```
├── app/
│   ├── api/
│   │   └── stock/
│   │       └── [ticker]/
│   │           └── route.ts
│   └── page.tsx
├── lib/
│   ├── types/
│   │   └── stock.ts
│   ├── news-fetcher.ts
│   └── yahoo-finance.ts
└── components/
    └── ui/
```

## Future Enhancements

- [ ] RAG Integration for AI-powered analysis
- [ ] Multiple financial data sources
- [ ] Advanced data visualization
- [ ] User authentication
- [ ] Saved analysis reports
- [ ] Portfolio tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
