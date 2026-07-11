import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingScreen from '../components/LoadingScreen';
import { AlertCircle, Download, FileText, ArrowLeft, Building2, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

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
        
        const groqKey = localStorage.getItem('GROQ_API_KEY');
        const geminiKey = localStorage.getItem('GEMINI_API_KEY');
        const aiProvider = localStorage.getItem('AI_PROVIDER') || (groqKey ? 'groq' : 'gemini');

        if (!groqKey && !geminiKey) {
          throw new Error('An AI API Key (Groq or Gemini) is missing. Please configure it in settings.');
        }

        const response = await fetch('http://localhost:3001/api/research', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-groq-key': groqKey || '',
            'x-gemini-key': geminiKey || '',
            'x-ai-provider': aiProvider,
            'x-tavily-key': localStorage.getItem('TAVILY_API_KEY') || '',
            'x-fmp-key': localStorage.getItem('FMP_API_KEY') || ''
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
          <h2 className="text-xl font-bold mb-2 text-white">Analysis Failed</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/settings')}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors border border-white/10"
            >
              Check Settings
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex-1 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
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
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 shadow-xl">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{data.company}</h1>
              <p className="text-gray-400 mt-1">{data.overview?.industry || 'Technology'} • {data.overview?.headquarters || 'USA'}</p>
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
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors tooltip"
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
            <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] pointer-events-none rounded-full
              ${data.analysis?.recommendation === 'INVEST' ? 'bg-green-500/20' : 'bg-red-500/20'}`} />
            
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" /> Investment Thesis
            </h2>
            <div className="prose prose-invert max-w-none text-gray-300">
              <p className="text-lg leading-relaxed">{data.analysis?.summary}</p>
              <div className="mt-6 p-6 rounded-2xl bg-black/30 border border-white/5 relative">
                <p className="text-gray-300 italic">"{data.analysis?.reasoning}"</p>
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
            <div className="glass-card rounded-3xl p-6">
               <h3 className="text-lg font-semibold mb-4 text-gray-200">Revenue & Income (Est)</h3>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Prev', revenue: data.financials?.revenue ? data.financials.revenue * 0.9 : 100, income: data.financials?.netIncome ? data.financials.netIncome * 0.9 : 20 },
                      { name: 'Current', revenue: data.financials?.revenue || 120, income: data.financials?.netIncome || 30 }
                    ]}>
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" tickFormatter={(val) => `$${val/1000}B`} />
                      <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-lg font-semibold mb-6 text-gray-200">Risk Assessment</h3>
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
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  {data.analysis?.swot?.strengths?.map((s, i) => <li key={i}>{s}</li>) || <li>No data available</li>}
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
                <h3 className="text-red-400 font-semibold mb-2">Weaknesses</h3>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  {data.analysis?.swot?.weaknesses?.map((w, i) => <li key={i}>{w}</li>) || <li>No data available</li>}
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <h3 className="text-blue-400 font-semibold mb-2">Opportunities</h3>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                  {data.analysis?.swot?.opportunities?.map((o, i) => <li key={i}>{o}</li>) || <li>No data available</li>}
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-yellow-500/5 border border-yellow-500/10">
                <h3 className="text-yellow-400 font-semibold mb-2">Threats</h3>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
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
            <h3 className="text-lg font-semibold text-gray-300 mb-6">AI Confidence Score</h3>
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
            <h3 className="font-semibold text-gray-200 mb-2">Key Metrics</h3>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-gray-400">Market Cap</span>
              <span className="font-medium">${(data.financials?.marketCap / 1e9).toFixed(2) || 'N/A'}B</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-gray-400">P/E Ratio</span>
              <span className="font-medium">{data.financials?.peRatio || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-gray-400">Revenue Growth</span>
              <span className="font-medium text-green-400">+{data.financials?.revenueGrowth || 'N/A'}%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Profit Margin</span>
              <span className="font-medium">{data.financials?.profitMargin || 'N/A'}%</span>
            </div>
          </motion.div>

          {/* Latest News */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card rounded-3xl p-6"
          >
            <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" /> Recent Catalysts
            </h3>
            <div className="space-y-4">
              {data.news?.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md mb-2 inline-block
                    ${item.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' : 
                      item.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' : 
                      'bg-gray-500/20 text-gray-400'}`}>
                    {item.sentiment?.toUpperCase() || 'NEUTRAL'}
                  </span>
                  <h4 className="text-sm text-gray-200 font-medium line-clamp-2">{item.title}</h4>
                </div>
              ))}
              {(!data.news || data.news.length === 0) && (
                <p className="text-sm text-gray-400">No recent news found.</p>
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
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-200">{score}/10</span>
    </div>
    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full ${score > 7 ? 'bg-red-500' : score > 4 ? 'bg-yellow-500' : 'bg-green-500'}`}
        style={{ width: `${(score / 10) * 100}%` }}
      />
    </div>
  </div>
);

export default DashboardPage;
