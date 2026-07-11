const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

exports.getChartData = async (req, res) => {
  const { ticker } = req.params;
  const { range = '1y' } = req.query;

  try {
    // Define intervals based on range to optimize data points
    let interval = '1d';
    if (range === '1d') interval = '5m';
    else if (range === '1wk' || range === '5d') interval = '15m';
    else if (range === '1mo') interval = '1d';
    else if (range === '1y') interval = '1d';
    else if (range === '5y') interval = '1wk';
    else if (range === 'max') interval = '1mo';

    const result = await yahooFinance.chart(ticker, {
      period1: range, 
      interval: interval,
    });

    if (result && result.quotes) {
      // Clean data for Recharts (remove nulls)
      const data = result.quotes
        .filter(q => q.close !== null)
        .map(q => ({
          date: q.date,
          price: parseFloat(q.close.toFixed(2))
        }));
      res.json(data);
    } else {
      res.status(404).json({ error: 'No chart data found' });
    }
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
};
