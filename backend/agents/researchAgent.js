const { StateGraph, START, END, Annotation } = require('@langchain/langgraph');
const { ChatGroq } = require('@langchain/groq');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const axios = require('axios');

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
  
  const generateFakeData = () => {
    const currentPrice = Math.random() * 5000 + 100;
    return {
      revenue: Math.random() * 500000 * 10000000, // up to 5 lakh crores (absolute)
      netIncome: Math.random() * 50000 * 10000000, // (absolute)
      eps: (Math.random() * 100).toFixed(2),
      peRatio: (Math.random() * 80).toFixed(2),
      marketCap: Math.random() * 2000000 * 10000000, // up to 20 lakh crores (absolute)
      revenueGrowth: (Math.random() * 30).toFixed(1),
      profitMargin: (Math.random() * 25).toFixed(1),
      currentPrice: currentPrice,
      priceChange: (Math.random() * 10 - 5).toFixed(2), // random -5% to +5%
      stopLoss: (currentPrice * 0.92).toFixed(2) // 8% trailing stop loss
    };
  };

  if (fmpKey && fmpKey !== 'your_financial_modeling_prep_api_key_here' && fmpKey !== '') {
    try {
      // Step 1: Search for the company ticker on NSE/BSE
      let ticker = company;
      const searchRes = await axios.get(`https://financialmodelingprep.com/api/v3/search?query=${company}&exchange=NSE&apikey=${fmpKey}`);
      if (searchRes.data && searchRes.data.length > 0) {
        ticker = searchRes.data[0].symbol;
      } else {
        // Fallback to BSE if NSE not found
        const bseSearch = await axios.get(`https://financialmodelingprep.com/api/v3/search?query=${company}&exchange=BSE&apikey=${fmpKey}`);
        if (bseSearch.data && bseSearch.data.length > 0) {
          ticker = bseSearch.data[0].symbol;
        }
      }

      const profile = await axios.get(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${fmpKey}`);
      if (profile.data && profile.data.length > 0) {
        const p = profile.data[0];
        financials.marketCap = p.mktCap;
        financials.industry = p.industry;
        financials.eps = p.price / (p.mktCap / (p.mktCap / p.price)); // rough approximation if eps not in profile
        financials.currentPrice = p.price;
        financials.priceChange = p.changes;
        financials.stopLoss = (p.price * 0.92).toFixed(2);
      }
      
      const metrics = await axios.get(`https://financialmodelingprep.com/api/v3/key-metrics/${ticker}?limit=1&apikey=${fmpKey}`);
      if (metrics.data && metrics.data.length > 0) {
        const m = metrics.data[0];
        financials.peRatio = m.peRatio;
        financials.revenue = m.revenuePerShare * (financials.marketCap / (profile.data[0]?.price || 1));
        financials.netIncome = m.netIncomePerShare * (financials.marketCap / (profile.data[0]?.price || 1));
      }
    } catch (e) {
      console.warn("FMP API failed:", e.message, "- Falling back to fake data");
      financials = { ...financials, ...generateFakeData() };
    }
  } else {
    // Generate some fake financial data for demo purposes (scaled for INR / Indian Market - Crores)
    financials = { ...financials, ...generateFakeData() };
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
    const res = await llm.invoke(prompt);
    
    let text = res.content;
    text = text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    const analysisObj = JSON.parse(text);
    return { analysis: analysisObj };
  } catch (e) {
    console.error("LLM Analysis Failed:", e);
    return { 
      analysis: {
        summary: "Analysis failed due to error: " + e.message,
        recommendation: "PASS",
        confidence: 0,
        reasoning: "Error generating analysis.",
        swot: {}
      }
    };
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
