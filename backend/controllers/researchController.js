const { runResearchAgent } = require('../agents/researchAgent');

exports.researchCompany = async (req, res) => {
  try {
    const { company } = req.body;
    const geminiKey = req.headers['x-gemini-key'];
    const tavilyKey = req.headers['x-tavily-key'];
    const fmpKey = req.headers['x-fmp-key'];

    if (!company) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    if (!geminiKey) {
      return res.status(401).json({ error: 'Gemini API key is required' });
    }

    const result = await runResearchAgent(company, geminiKey, tavilyKey, fmpKey);
    res.json(result);
  } catch (error) {
    console.error('Research Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
