import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen';
import { AlertCircle, Download, FileText, ArrowLeft, Building2, TrendingUp, DollarSign, Brain } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import StockChart from '../components/StockChart';

const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const companyName = queryParams.get('company');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!companyName) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const aiProvider = localStorage.getItem('AI_PROVIDER') || 'groq';

        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
        const response = await fetch(`${API_BASE}/api/research`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-ai-provider': aiProvider
          },
          body: JSON.stringify({ company: companyName })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to analyze company');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyName, navigate]);

  if (loading) return <LoadingScreen companyName={companyName} />;

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-8 max-w-md w-full text-center border-red-500/20"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-[var(--color-text-main)]">Analysis Failed</h2>
          <p className="text-[var(--color-text-muted)] mb-6">{error}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/settings')}
              className="flex-1 bg-[var(--color-overlay)] hover:bg-white/10 text-[var(--color-text-main)] px-4 py-2 rounded-lg transition-colors border border-[var(--color-glass-border)]"
            >
              Check Settings
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex-1 bg-primary hover:bg-blue-600 text-[var(--color-text-main)] px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </button>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-[var(--color-glass-border)] shadow-xl">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-main)] tracking-tight">{data.company}</h1>
                <p className="text-[var(--color-text-muted)] mt-1">{data.overview?.industry || 'Technology'} • {data.overview?.headquarters || 'USA'}</p>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-12 bg-[var(--color-border-subtle)] mx-2"></div>
            
            <div className="bg-[var(--color-overlay)] p-3 rounded-xl border border-[var(--color-glass-border)]">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[var(--color-text-main)]">
                  ₹{Number(data.financials?.currentPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${Number(data.financials?.priceChange) >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {Number(data.financials?.priceChange) >= 0 ? '▲' : '▼'} {Math.abs(Number(data.financials?.priceChange || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Strict Stop Loss:</span>
                <span className="text-sm font-bold text-red-400">
                  ₹{Number(data.financials?.stopLoss || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <div className={`px-6 py-3 rounded-2xl border font-bold text-lg shadow-lg flex items-center gap-3
            ${data.analysis?.recommendation === 'INVEST' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {data.analysis?.recommendation === 'INVEST' ? <TrendingUp className="w-6 h-6" /> : <TrendingUp className="w-6 h-6 rotate-180" />}
            {data.analysis?.recommendation || 'PASS'}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => window.print()}
              className="p-3 rounded-xl bg-[var(--color-overlay)] hover:bg-white/10 border border-[var(--color-glass-border)] text-[var(--color-text-main)] transition-colors tooltip"
              title="Export to PDF"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Recommendation Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-8 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] pointer-events-none rounded-full animate-blob
              ${data.analysis?.recommendation === 'INVEST' ? 'bg-green-500/20' : 'bg-red-500/20'}`} />
            
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" /> Investment Thesis
            </h2>
            <div className="prose prose-invert max-w-none text-[var(--color-text-main)]">
              <p className="text-lg leading-relaxed">{data.analysis?.summary}</p>
              <div className="mt-6 p-6 rounded-2xl bg-[var(--color-overlay-hover)] border border-[var(--color-border-subtle)] relative">
                <p className="text-[var(--color-text-main)] italic">"{data.analysis?.reasoning}"</p>
              </div>
            </div>
          </motion.div>

          {/* Charts / Financials */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="h-[400px]">
              {data.financials?.ticker ? (
                <StockChart ticker={data.financials.ticker} />
              ) : (
                <div className="glass-card rounded-3xl p-6 h-full flex items-center justify-center text-[var(--color-text-muted)]">
                  Loading chart data...
                </div>
              )}
            </div>

            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-semibold mb-6 text-[var(--color-text-main)]">Risk Assessment</h3>
              <div className="space-y-4">
                <RiskBar label="Market Risk" score={data.analysis?.risk || 5} />
                <RiskBar label="Financial Risk" score={10 - (data.analysis?.financialHealth || 5)} />
                <RiskBar label="Execution Risk" score={10 - (data.analysis?.businessQuality || 5)} />
              </div>
            </div>
          </motion.div>

          {/* SWOT */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-8"
          >
            <h2 className="text-xl font-bold mb-6">SWOT Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-green-500/5 border border-green-500/10">
                <h3 className="text-green-400 font-semibold mb-2">Strengths</h3>
                <ul className="list-disc list-inside text-[var(--color-text-main)] text-sm space-y-1">
                  {data.analysis?.swot?.strengths?.map((s, i) => <li key={i}>{s}</li>) || <li>No data available</li>}
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
                <h3 className="text-red-400 font-semibold mb-2">Weaknesses</h3>
                <ul className="list-disc list-inside text-[var(--color-text-main)] text-sm space-y-1">
                  {data.analysis?.swot?.weaknesses?.map((w, i) => <li key={i}>{w}</li>) || <li>No data available</li>}
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <h3 className="text-blue-400 font-semibold mb-2">Opportunities</h3>
                <ul className="list-disc list-inside text-[var(--color-text-main)] text-sm space-y-1">
                  {data.analysis?.swot?.opportunities?.map((o, i) => <li key={i}>{o}</li>) || <li>No data available</li>}
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-yellow-500/5 border border-yellow-500/10">
                <h3 className="text-yellow-400 font-semibold mb-2">Threats</h3>
                <ul className="list-disc list-inside text-[var(--color-text-main)] text-sm space-y-1">
                  {data.analysis?.swot?.threats?.map((t, i) => <li key={i}>{t}</li>) || <li>No data available</li>}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* Confidence Score */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center"
          >
            <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-6">AI Confidence Score</h3>
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke={data.analysis?.confidence > 70 ? "#22c55e" : data.analysis?.confidence > 40 ? "#f59e0b" : "#ef4444"} 
                  strokeWidth="8"
                  strokeDasharray={`${(data.analysis?.confidence || 0) * 2.83} 283`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{data.analysis?.confidence || 0}%</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-3xl p-6 space-y-4"
          >
            <h3 className="font-semibold text-[var(--color-text-main)] mb-2">Key Metrics</h3>
            <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-subtle)]">
              <span className="text-[var(--color-text-muted)]">Market Cap</span>
              <span className="font-medium">₹{(data.financials?.marketCap / 10000000).toFixed(2) || 'N/A'} Cr</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-subtle)]">
              <span className="text-[var(--color-text-muted)]">P/E Ratio</span>
              <span className="font-medium">{data.financials?.peRatio || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-subtle)]">
              <span className="text-[var(--color-text-muted)]">Revenue Growth</span>
              <span className={`font-medium ${Number(data.financials?.revenueGrowth) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Number(data.financials?.revenueGrowth) > 0 ? '+' : ''}{data.financials?.revenueGrowth || 'N/A'}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[var(--color-text-muted)]">Profit Margin</span>
              <span className={`font-medium ${Number(data.financials?.profitMargin) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Number(data.financials?.profitMargin) > 0 ? '+' : ''}{data.financials?.profitMargin || 'N/A'}%
              </span>
            </div>
          </motion.div>

          {/* Latest News */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card rounded-3xl p-6"
          >
            <h3 className="font-semibold text-[var(--color-text-main)] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" /> Recent Catalysts
            </h3>
            <div className="space-y-4">
              {data.news?.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[var(--color-overlay)] border border-[var(--color-border-subtle)] hover:border-[var(--color-glass-border)] transition-colors">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md mb-2 inline-block
                    ${item.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' : 
                      item.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' : 
                      'bg-gray-500/20 text-[var(--color-text-muted)]'}`}>
                    {item.sentiment?.toUpperCase() || 'NEUTRAL'}
                  </span>
                  <h4 className="text-sm text-[var(--color-text-main)] font-medium line-clamp-2">{item.title}</h4>
                </div>
              ))}
              {(!data.news || data.news.length === 0) && (
                <p className="text-sm text-[var(--color-text-muted)]">No recent news found.</p>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

const RiskBar = ({ label, score }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="text-[var(--color-text-main)]">{score}/10</span>
    </div>
    <div className="h-2 w-full bg-[var(--color-overlay)] rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full ${score > 7 ? 'bg-red-500' : score > 4 ? 'bg-yellow-500' : 'bg-green-500'}`}
        style={{ width: `${(score / 10) * 100}%` }}
      />
    </div>
  </div>
);

export default DashboardPage;
