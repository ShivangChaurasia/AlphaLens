import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from '../App';

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const [aiProvider, setAiProvider] = useState('groq');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Load from local storage
    const provider = localStorage.getItem('AI_PROVIDER') || 'groq';
    setAiProvider(provider);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProviderChange = (provider) => {
    setAiProvider(provider);
    localStorage.setItem('AI_PROVIDER', provider);
    showToast(`AI Provider set to ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} Theme Applied!`);
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 text-[var(--color-text-main)]">Settings</h1>
        <p className="text-[var(--color-text-muted)]">Configure your preferences and AI engine for AlphaLens AI.</p>
      </motion.div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-4">Appearance</h3>
          <div className="flex gap-4">
            <button 
              onClick={() => handleThemeChange('light')}
              className={`flex-1 py-4 px-4 rounded-xl font-medium transition-all border flex items-center justify-center gap-3 ${theme === 'light' ? 'bg-primary/10 border-primary text-primary' : 'bg-[var(--color-overlay)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-[var(--color-glass-border)]'}`}
            >
              <Sun className="w-5 h-5" />
              Light Mode
            </button>
            <button 
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 py-4 px-4 rounded-xl font-medium transition-all border flex items-center justify-center gap-3 ${theme === 'dark' ? 'bg-primary/20 border-primary text-primary' : 'bg-[var(--color-overlay)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-[var(--color-glass-border)]'}`}
            >
              <Moon className="w-5 h-5" />
              Dark Mode
            </button>
          </div>
        </div>

        {/* AI Provider Settings */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-4">Select Preferred AI Provider</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">Choose the reasoning engine you want to power the research analysis.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => handleProviderChange('groq')}
              className={`flex-1 py-4 px-4 rounded-xl font-medium transition-all border ${aiProvider === 'groq' ? 'bg-primary/20 border-primary text-primary' : 'bg-[var(--color-overlay)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-[var(--color-glass-border)]'}`}
            >
              Groq (Llama 3.3 70B)
            </button>
            <button 
              onClick={() => handleProviderChange('gemini')}
              className={`flex-1 py-4 px-4 rounded-xl font-medium transition-all border ${aiProvider === 'gemini' ? 'bg-primary/20 border-primary text-primary' : 'bg-[var(--color-overlay)] border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-[var(--color-glass-border)]'}`}
            >
              Google Gemini (2.5 Flash)
            </button>
          </div>
        </div>
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

export default SettingsPage;
