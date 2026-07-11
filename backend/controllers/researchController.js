const { runResearchAgent } = require('../agents/researchAgent');

exports.researchCompany = async (req, res) => {
  try {
    const { company } = req.body;
    const groqKey = req.headers['x-groq-key'];
    const tavilyKey = req.headers['x-tavily-key'];
    const fmpKey = req.headers['x-fmp-key'];

    if (!company) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    if (!groqKey) {
      return res.status(401).json({ error: 'Groq API key is required' });
    }

    const result = await runResearchAgent(company, groqKey, tavilyKey, fmpKey);
    res.json(result);
  } catch (error) {
    console.error('Research Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
