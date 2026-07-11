import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, Copy, Check, Save, Trash2, AlertCircle } from 'lucide-react';

const SettingsPage = () => {
  const [keys, setKeys] = useState({
    groq: '',
    tavily: '',
    fmp: ''
  });
  
  const [showKeys, setShowKeys] = useState({
    groq: false,
    tavily: false,
    fmp: false
  });
  
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Load from local storage
    const groqKey = localStorage.getItem('GROQ_API_KEY') || '';
    const tavilyKey = localStorage.getItem('TAVILY_API_KEY') || '';
    const fmpKey = localStorage.getItem('FMP_API_KEY') || '';
    
    setKeys({ groq: groqKey, tavily: tavilyKey, fmp: fmpKey });
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (keyName, storageKey) => {
    localStorage.setItem(storageKey, keys[keyName]);
    showToast(`${keyName.toUpperCase()} API Key saved successfully!`);
  };

  const handleClear = (keyName, storageKey) => {
    localStorage.removeItem(storageKey);
    setKeys(prev => ({ ...prev, [keyName]: '' }));
    showToast(`${keyName.toUpperCase()} API Key cleared.`, 'warning');
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">API Configuration</h1>
        <p className="text-gray-400">Configure your API keys to power AlphaLens AI. Keys are stored securely in your browser's local storage.</p>
      </motion.div>

      <div className="space-y-6">
        <ApiKeyCard 
          title="Groq API Key"
          description="Required for AI analysis and investment recommendations. Get it from console.groq.com."
          value={keys.groq}
          onChange={(e) => setKeys(prev => ({ ...prev, groq: e.target.value }))}
          onSave={() => handleSave('groq', 'GROQ_API_KEY')}
          onClear={() => handleClear('groq', 'GROQ_API_KEY')}
          onCopy={() => copyToClipboard(keys.groq)}
          showKey={showKeys.groq}
          toggleShow={() => setShowKeys(prev => ({ ...prev, groq: !prev.groq }))}
          placeholder="gsk_..."
          status={keys.groq ? 'configured' : 'missing'}
        />

        <ApiKeyCard 
          title="Tavily Search API Key"
          description="Required for live web search and news aggregation. Get it from tavily.com."
          value={keys.tavily}
          onChange={(e) => setKeys(prev => ({ ...prev, tavily: e.target.value }))}
          onSave={() => handleSave('tavily', 'TAVILY_API_KEY')}
          onClear={() => handleClear('tavily', 'TAVILY_API_KEY')}
          onCopy={() => copyToClipboard(keys.tavily)}
          showKey={showKeys.tavily}
          toggleShow={() => setShowKeys(prev => ({ ...prev, tavily: !prev.tavily }))}
          placeholder="tvly-..."
          status={keys.tavily ? 'configured' : 'missing'}
        />

        <ApiKeyCard 
          title="Financial Modeling Prep API"
          description="Required for fetching financial data, earnings, and metrics. Get it from financialmodelingprep.com."
          value={keys.fmp}
          onChange={(e) => setKeys(prev => ({ ...prev, fmp: e.target.value }))}
          onSave={() => handleSave('fmp', 'FMP_API_KEY')}
          onClear={() => handleClear('fmp', 'FMP_API_KEY')}
          onCopy={() => copyToClipboard(keys.fmp)}
          showKey={showKeys.fmp}
          toggleShow={() => setShowKeys(prev => ({ ...prev, fmp: !prev.fmp }))}
          placeholder="Enter FMP API key..."
          status={keys.fmp ? 'configured' : 'missing'}
        />
      </div>

      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl border flex items-center gap-2 z-50
            ${toast.type === 'success' ? 'bg-green-900/50 border-green-500/50 text-green-200' : 'bg-yellow-900/50 border-yellow-500/50 text-yellow-200'}`}
        >
          {toast.type === 'success' ? <Check className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-yellow-400" />}
          {toast.message}
        </motion.div>
      )}
    </div>
  );
};

const ApiKeyCard = ({ title, description, value, onChange, onSave, onClear, onCopy, showKey, toggleShow, placeholder, status }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4">
        {status === 'configured' ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Configured
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Missing
          </span>
        )}
      </div>

      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <Key className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative flex items-center">
          <input
            type={showKey ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all pr-12"
          />
          <button 
            onClick={toggleShow}
            className="absolute right-4 p-1 text-gray-400 hover:text-white transition-colors"
          >
            {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSave}
            className="flex-1 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Key
          </button>
          <button
            onClick={onCopy}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-white/10"
          >
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button
            onClick={onClear}
            className="px-4 py-2.5 rounded-lg font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center justify-center border border-transparent hover:border-red-500/20"
            title="Clear Key"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
