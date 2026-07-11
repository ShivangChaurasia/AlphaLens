import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bot, LineChart, Globe } from 'lucide-react';

const LandingPage = () => {
  const [company, setCompany] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (company.trim()) {
      navigate(`/dashboard?company=${encodeURIComponent(company.trim())}`);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-4xl mx-auto px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            AI Investment <br className="hidden md:block" />
            <span className="text-gradient">Research Agent</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Research any public company in seconds using AI. Get professional-grade investment intelligence instantly.
          </p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSearch}
          className="relative max-w-xl mx-auto mb-20 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative flex items-center bg-[var(--color-cards)] rounded-2xl border border-[var(--color-glass-border)] p-2 shadow-2xl">
            <Search className="w-6 h-6 text-[var(--color-text-muted)] ml-4" />
            <input 
              type="text" 
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter company name (e.g., Apple, Tesla)..."
              className="w-full bg-transparent border-none outline-none text-[var(--color-text-main)] px-4 py-4 text-lg placeholder-gray-500"
              required
            />
            <button 
              type="submit"
              className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              Analyze
            </button>
          </div>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <FeatureCard 
            icon={<Bot className="w-6 h-6 text-blue-400" />}
            title="AI Powered"
            description="Analyzes complex business data using advanced LLMs to provide deep insights."
          />
          <FeatureCard 
            icon={<LineChart className="w-6 h-6 text-green-400" />}
            title="Live Financial Data"
            description="Fetches real-time financial metrics, balance sheets, and cash flow data."
          />
          <FeatureCard 
            icon={<Globe className="w-6 h-6 text-purple-400" />}
            title="Market Analysis"
            description="Reads the latest news and market sentiment to evaluate risks and opportunities."
          />
        </motion.div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-card rounded-2xl p-6 text-left hover:-translate-y-1 transition-transform duration-300">
    <div className="w-12 h-12 rounded-xl bg-[var(--color-overlay)] flex items-center justify-center mb-4 border border-[var(--color-border-subtle)]">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-[var(--color-text-main)]">{title}</h3>
    <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
