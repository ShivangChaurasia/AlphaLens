import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, Database, FileText, Brain, FileOutput } from 'lucide-react';

const stages = [
  { text: "Searching company profile...", icon: Search },
  { text: "Reading financial statements...", icon: Database },
  { text: "Gathering market news...", icon: FileText },
  { text: "Evaluating business quality...", icon: Brain },
  { text: "Generating final recommendation...", icon: FileOutput }
];

const LoadingScreen = ({ companyName }) => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    // Cycle through stages for effect, this is purely visual while the API runs
    const interval = setInterval(() => {
      setCurrentStage(prev => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-12 max-w-xl w-full text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-600/10 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 rounded-full bg-[var(--color-overlay)] border border-[var(--color-glass-border)] mx-auto mb-8 flex items-center justify-center relative">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <motion.div 
              className="absolute inset-0 rounded-full border-t-2 border-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <h2 className="text-2xl font-bold mb-2">Analyzing {companyName}</h2>
          <p className="text-[var(--color-text-muted)] mb-10">AlphaLens AI is performing deep research...</p>

          <div className="space-y-4 text-left max-w-sm mx-auto">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = idx === currentStage;
              const isPast = idx < currentStage;

              return (
                <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${isPast ? 'opacity-50' : isActive ? 'opacity-100' : 'opacity-20'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border 
                    ${isActive ? 'bg-primary/20 border-primary text-primary' : 
                      isPast ? 'bg-green-500/20 border-green-500 text-green-400' : 
                      'bg-[var(--color-overlay)] border-[var(--color-glass-border)] text-[var(--color-text-muted)]'}`}
                  >
                    {isPast ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`font-medium ${isActive ? 'text-[var(--color-text-main)]' : isPast ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-muted)]'}`}>
                    {stage.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
