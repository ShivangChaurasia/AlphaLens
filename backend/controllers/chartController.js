const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

exports.getChartData = async (req, res) => {
  const { ticker } = req.params;
  const { range = '1y' } = req.query;

  try {
    let interval = '1d';
    let period1 = new Date();
    
    if (range === '1d') {
      interval = '5m';
      period1.setDate(period1.getDate() - 1);
    } else if (range === '1wk') {
      interval = '15m';
      period1.setDate(period1.getDate() - 7);
    } else if (range === '1mo') {
      interval = '1d';
      period1.setMonth(period1.getMonth() - 1);
    } else if (range === '1y') {
      interval = '1d';
      period1.setFullYear(period1.getFullYear() - 1);
    } else if (range === '5y') {
      interval = '1wk';
      period1.setFullYear(period1.getFullYear() - 5);
    } else if (range === 'max') {
      interval = '1mo';
      period1 = new Date('1970-01-01');
    }

    const result = await yahooFinance.chart(ticker, {
      period1: period1.toISOString(),
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
