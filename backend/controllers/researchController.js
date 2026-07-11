const { runResearchAgent } = require('../agents/researchAgent');

exports.researchCompany = async (req, res) => {
  try {
    const { company } = req.body;
    const groqKey = req.headers['x-groq-key'];
    const geminiKey = req.headers['x-gemini-key'];
    const tavilyKey = req.headers['x-tavily-key'];
    const fmpKey = req.headers['x-fmp-key'];
    const aiProvider = req.headers['x-ai-provider'] || 'groq';

    if (!company) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    if (!groqKey && !geminiKey) {
      return res.status(401).json({ error: 'At least one AI API key (Groq or Gemini) is required' });
    }

    const result = await runResearchAgent(company, groqKey, geminiKey, tavilyKey, fmpKey, aiProvider);
    res.json(result);
  } catch (error) {
    console.error('Research Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
