const { runResearchAgent } = require('../agents/researchAgent');

exports.researchCompany = async (req, res) => {
  try {
    const { company } = req.body;
    
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const tavilyKey = process.env.TAVILY_API_KEY;
    const fmpKey = process.env.FMP_API_KEY;
    const aiProvider = req.headers['x-ai-provider'] || 'groq';

    if (!company) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    if (!groqKey && !geminiKey) {
      return res.status(401).json({ error: 'Server configuration error: No AI API keys are configured.' });
    }

    const result = await runResearchAgent(company, groqKey, geminiKey, tavilyKey, fmpKey, aiProvider);
    res.json(result);
  } catch (error) {
    console.error('Research Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
