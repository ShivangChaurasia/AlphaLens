# AlphaLens AI 🔍

> **AI-Powered Investment Intelligence**

AlphaLens AI is a premium, production-quality AI Investment Research Agent. It takes a company name, orchestrates a deep-dive research pipeline using live internet search and financial data, and leverages a Large Language Model (Gemini) to output a structured investment report with a recommendation to either **INVEST** or **PASS**.

## 🚀 Project Overview

Designed to mimic professional platforms like Bloomberg or PitchBook, AlphaLens AI doesn't feel like a chatbot—it feels like a dashboard. It executes a multi-step LangGraph workflow to aggregate data and synthesize it into actionable intelligence.

## 🏗️ Architecture

The application is built as a modern monorepo:
- **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion, Recharts, React Router
- **Backend**: Node.js, Express.js
- **AI Engine**: LangGraph.js, LangChain.js, Gemini 2.5 Flash
- **External APIs**: Tavily Search API, Financial Modeling Prep API

## 🔄 Workflow

1. **User Input**: User enters a company name on the Landing Page.
2. **Backend Execution**: Express receives the request and starts the LangGraph pipeline.
3. **Company Research Node**: Uses Tavily Search to gather overview, business model, and competitors.
4. **Financial Node**: Fetches live metrics (Revenue, Market Cap, P/E, EPS) via Financial Modeling Prep API.
5. **News Node**: Gathers latest news, catalysts, and sentiment via Tavily.
6. **AI Analysis Node**: Gemini 2.5 Flash analyzes the combined context and generates a structured JSON report.
7. **Result Dashboard**: The React frontend elegantly renders the result using glassmorphism, animations, and charts.

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- API Keys for Gemini, Tavily, and Financial Modeling Prep

### 1. Clone & Install

**Backend:**
```bash
cd backend
npm install
npm start
```
*Runs on http://localhost:3001*

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*Runs on http://localhost:5173*

### 2. Configure API Keys
You do not need to configure `.env` files for the API keys. 
1. Open the application in your browser.
2. Click the **Settings (Gear Icon)** in the Navbar.
3. Enter your Gemini, Tavily, and FMP API Keys securely. They are stored in your browser's Local Storage.

## 📂 Folder Structure

```
/
├── backend/
│   ├── agents/          # LangGraph workflows and AI logic
│   ├── controllers/     # Express route controllers
│   ├── routes/          # API route definitions
│   ├── index.js         # Server entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components (Navbar, LoadingScreen)
    │   ├── pages/       # Page components (Landing, Dashboard, Settings)
    │   ├── App.jsx      # Main router and layout
    │   ├── main.jsx     # React entry point
    │   └── index.css    # Tailwind v4 configuration and global styles
    ├── index.html
    └── package.json
```

## ⚖️ Tradeoffs
- **In-Memory Processing**: To avoid database complexity and focus on the AI agent, all processing is done in-memory on the backend per-request. History is not persisted on a server.
- **Local Storage API Keys**: For a seamless demo experience, API keys are passed from the client via headers rather than strictly held in a backend `.env`. In a true production app, keys would be kept strictly server-side, but this allows recruiters or testers to plug in their own keys easily.

## 🔮 Future Improvements
- Add multi-agent collaboration (e.g., a "Risk Analyst Agent" vs. a "Growth Analyst Agent" debating the stock).
- Connect a PostgreSQL/Supabase database to save user portfolios and watchlists.
- Export to PDF functionality refinement using headless browsers on the backend.
- Caching API responses using Redis to reduce latency on repeated searches.
