const { StateGraph, START, END, Annotation } = require('@langchain/langgraph');
const { ChatGroq } = require('@langchain/groq');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const axios = require('axios');
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
const AgentState = Annotation.Root({
  company: Annotation({
    reducer: (x, y) => y ? y : x,
    default: () => ""
  }),
  overview: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({})
  }),
  financials: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({})
  }),
  news: Annotation({
    reducer: (x, y) => y ? y : x,
    default: () => []
  }),
  analysis: Annotation({
    reducer: (x, y) => y ? y : x,
    default: () => null
  })
});

async function researchNode(state, config) {
  const { company } = state;
  const { tavilyKey } = config.configurable;
  
  let overview = { industry: 'Unknown', headquarters: 'Unknown', description: 'No data' };
  
  if (tavilyKey && tavilyKey !== 'your_tavily_api_key_here' && tavilyKey !== '') {
    try {
      const response = await axios.post('https://api.tavily.com/search', {
        api_key: tavilyKey,
        query: `Company overview, business model, products, CEO, industry, headquarters, competitors of ${company}`,
        search_depth: 'basic'
      });
      overview.description = response.data.results.map(r => r.content).join(' ');
      // We will rely on Gemini to extract CEO and industry later or just use the description
    } catch (e) {
      console.warn("Tavily search failed:", e.message);
      overview.description = `Stubbed overview for ${company}. Needs Tavily API key. ${company} is a leading global company.`;
    }
  } else {
    overview.description = `Stubbed overview for ${company}. Needs Tavily API key. ${company} is a leading global company.`;
  }
  
  return { overview };
}

async function financialNode(state, config) {
  const { company } = state;
  const { fmpKey } = config.configurable;
  
  let financials = {
    revenue: 0,
    netIncome: 0,
    eps: 0,
    peRatio: 0,
    marketCap: 0,
    debt: 0,
    cashFlow: 0,
    revenueGrowth: 0,
    profitMargin: 0,
    dividend: 0
  };
  
  try {
    // Try appending NSE to the search if it's not already there to prioritize Indian stocks
    const searchQuery = company.toLowerCase().includes('nse') || company.toLowerCase().includes('bse') 
      ? company 
      : `${company} NSE`;

    const searchRes = await yahooFinance.search(searchQuery, { quotesCount: 10 });
    let indianTicker = searchRes.quotes.find(q => q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO'));
    
    // If appending NSE didn't yield an Indian ticker, try searching normally for .NS or .BO
    if (!indianTicker) {
      const fallbackSearch = await yahooFinance.search(company, { quotesCount: 10 });
      indianTicker = fallbackSearch.quotes.find(q => q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO'));
    }

    const ticker = indianTicker ? indianTicker.symbol : null;

    if (ticker) {
      const quote = await yahooFinance.quoteSummary(ticker, { modules: ['price', 'defaultKeyStatistics', 'financialData', 'summaryProfile'] });
      
      financials.ticker = ticker;
      financials.marketCap = quote.price?.marketCap || 0;
      financials.industry = quote.summaryProfile?.industry || 'Unknown';
      financials.currentPrice = quote.price?.regularMarketPrice || 0;
      financials.priceChange = quote.price?.regularMarketChangePercent ? (quote.price.regularMarketChangePercent * 100).toFixed(2) : 0;
      financials.eps = quote.defaultKeyStatistics?.trailingEps || 0;
      financials.peRatio = quote.summaryProfile?.trailingPE || (quote.defaultKeyStatistics?.forwardPE || 0);
      financials.revenue = quote.financialData?.totalRevenue || 0;
      financials.netIncome = quote.financialData?.netIncomeToCommon || 0;
      financials.revenueGrowth = quote.financialData?.revenueGrowth ? (quote.financialData.revenueGrowth * 100).toFixed(1) : 0;
      financials.profitMargin = quote.financialData?.profitMargins ? (quote.financialData.profitMargins * 100).toFixed(1) : 0;
      financials.stopLoss = (financials.currentPrice * 0.92).toFixed(2);
    } else {
      throw new Error("Ticker not found on Yahoo Finance");
    }
  } catch (e) {
    console.error("Yahoo Finance API failed:", e.message);
    if (e.message === "Ticker not found on Yahoo Finance" || e.message.includes("Could not find any stock data")) {
      throw new Error(`Could not find any stock data for "${company}". Please check the spelling and try again.`);
    }
    throw new Error("Server seems busy, try again later...");
  }
  
  return { financials };
}

async function newsNode(state, config) {
  const { company } = state;
  const { tavilyKey } = config.configurable;
  
  let news = [];
  
  if (tavilyKey && tavilyKey !== 'your_tavily_api_key_here' && tavilyKey !== '') {
    try {
       const response = await axios.post('https://api.tavily.com/search', {
        api_key: tavilyKey,
        query: `Latest news, positive events, negative events, lawsuits, quarterly earnings for ${company}`,
        search_depth: 'basic'
      });
      news = response.data.results.map(r => ({
        title: r.title,
        content: r.content,
        sentiment: 'neutral' // To be improved by LLM later
      })).slice(0, 3);
    } catch (e) {
      console.warn("Tavily news failed:", e.message);
      news = [
        { title: `${company} announces new product lineup`, content: "Innovation drives stock up.", sentiment: 'positive' },
        { title: `Analysts upgrade ${company} stock`, content: "Market sentiment improves.", sentiment: 'positive' },
        { title: `${company} faces supply chain issues`, content: "Logistics impact quarterly outlook.", sentiment: 'negative' }
      ];
    }
  } else {
    news = [
      { title: `${company} announces new product lineup`, content: "Innovation drives stock up.", sentiment: 'positive' },
      { title: `Analysts upgrade ${company} stock`, content: "Market sentiment improves.", sentiment: 'positive' },
      { title: `${company} faces supply chain issues`, content: "Logistics impact quarterly outlook.", sentiment: 'negative' }
    ];
  }
  
  return { news };
}

async function analysisNode(state, config) {
  const { company, overview, financials, news } = state;
  const { groqKey, geminiKey, aiProvider } = config.configurable;
  
  let llm;
  if (aiProvider === 'gemini' && geminiKey) {
    llm = new ChatGoogleGenerativeAI({
      modelName: "gemini-2.5-flash",
      apiKey: geminiKey,
      temperature: 0.2,
    });
  } else if (groqKey) {
    llm = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      apiKey: groqKey,
      temperature: 0.2,
    });
  } else {
    throw new Error("No valid AI provider key provided.");
  }

  const prompt = `
  You are an expert financial analyst strictly following SEBI, BSE, and NSE guidelines. 
  Analyze the following information for ${company} with a focus on the Indian market.
  IMPORTANT: All financial figures must be reported in Indian Rupees (₹) and formatted in Crores (Cr) or Lakhs where appropriate.
  
  OVERVIEW:
  ${JSON.stringify(overview)}
  
  FINANCIALS:
  ${JSON.stringify(financials)}
  
  NEWS:
  ${JSON.stringify(news)}
  
  Generate a final JSON response exactly in this format, NO markdown formatting:
  {
      "summary": "Executive summary...",
      "businessQuality": 9,
      "financialHealth": 8,
      "growth": 10,
      "risk": 6,
      "swot": {
          "strengths": ["..."],
          "weaknesses": ["..."],
          "opportunities": ["..."],
          "threats": ["..."]
      },
      "recommendation": "INVEST",
      "confidence": 91,
      "reasoning": "Detailed reasoning..."
  }
  
  Ensure recommendation is either "INVEST" or "PASS". Confidence is 0-100.
  `;

  try {
    let res;
    try {
      res = await llm.invoke(prompt);
    } catch (e) {
      console.warn(`Primary LLM (${aiProvider}) failed:`, e.message);
      // Fallback to the other provider if available
      if (aiProvider === 'groq' && geminiKey) {
        console.warn("Falling back to Gemini...");
        const fallbackLlm = new ChatGoogleGenerativeAI({
          modelName: "gemini-2.5-flash",
          apiKey: geminiKey,
          temperature: 0.2,
        });
        res = await fallbackLlm.invoke(prompt);
      } else if (aiProvider === 'gemini' && groqKey) {
        console.warn("Falling back to Groq...");
        const fallbackLlm = new ChatGroq({
          model: "llama-3.3-70b-versatile",
          apiKey: groqKey,
          temperature: 0.2,
        });
        res = await fallbackLlm.invoke(prompt);
      } else {
        throw e; // No fallback possible
      }
    }
    
    let text = res.content;
    text = text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    const analysisObj = JSON.parse(text);
    return { analysis: analysisObj };
  } catch (e) {
    console.error("LLM Analysis Failed after all attempts:", e.message);
    throw new Error("Server is busy, please try again later...");
  }
}

const builder = new StateGraph(AgentState)
  .addNode('researchNode', researchNode)
  .addNode('financialNode', financialNode)
  .addNode('newsNode', newsNode)
  .addNode('analysisNode', analysisNode)
  .addEdge(START, 'researchNode')
  .addEdge('researchNode', 'financialNode')
  .addEdge('financialNode', 'newsNode')
  .addEdge('newsNode', 'analysisNode')
  .addEdge('analysisNode', END);

const graph = builder.compile();

async function runResearchAgent(company, groqKey, geminiKey, tavilyKey, fmpKey, aiProvider = 'groq') {
  const result = await graph.invoke(
    { company },
    { configurable: { groqKey, geminiKey, tavilyKey, fmpKey, aiProvider } }
  );
  
  return {
    company: result.company,
    overview: result.overview,
    financials: result.financials,
    news: result.news,
    analysis: result.analysis
  };
}

module.exports = { runResearchAgent };
