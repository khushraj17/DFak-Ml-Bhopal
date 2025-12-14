import React from 'react';
import { Scan, ShieldAlert, Cpu } from 'lucide-react';

interface ScanningOverlayProps {
  status: string;
}

const ScanningOverlay: React.FC<ScanningOverlayProps> = ({ status }) => {
  return (
    <div className="absolute inset-0 z-50 bg-cyber-900/90 backdrop-blur-sm flex flex-col items-center justify-center border border-cyber-600 rounded-xl overflow-hidden">
      {/* Scan Line Animation */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(transparent,rgba(6,182,212,0.5),transparent)] animate-scan-line h-full w-full"></div>
      
      <div className="relative z-10 flex flex-col items-center gap-6 p-8">
        <div className="relative">
          <div className="absolute inset-0 bg-cyber-accent rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="w-24 h-24 border-4 border-cyber-accent/30 border-t-cyber-accent rounded-full animate-spin flex items-center justify-center">
             <Cpu className="w-10 h-10 text-cyber-accent" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-mono font-bold text-white tracking-wider">
            {status === 'SCANNING' ? 'EXTRACTING FEATURES' : 'ANALYZING ARTIFACTS'}
          </h3>
          <p className="text-cyber-accent font-mono text-sm animate-pulse-fast">
            PROCESSING NEURAL LAYERS...
          </p>
        </div>

        <div className="w-64 space-y-1">
            <div className="flex justify-between text-xs text-gray-400 font-mono">
                <span>BUFFER</span>
                <span>Wait...</span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyber-accent animate-[width_2s_ease-in-out_infinite]" style={{width: '60%'}}></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ScanningOverlay;