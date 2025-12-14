import React from 'react';
import { AnalysisResult, ForensicArtifact } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Eye, Mic, Activity, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onReset }) => {
  const isSafe = result.fakeProbability < 50;
  const scoreColor = isSafe ? 'text-cyber-success' : 'text-cyber-danger';
  const borderColor = isSafe ? 'border-cyber-success' : 'border-cyber-danger';
  const gaugeColor = isSafe ? '#10b981' : '#ef4444';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header Summary */}
      <div className={`p-6 rounded-xl border ${borderColor} bg-cyber-800/50 backdrop-blur relative overflow-hidden`}>
        <div className={`absolute top-0 left-0 w-1 h-full ${isSafe ? 'bg-cyber-success' : 'bg-cyber-danger'}`}></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-full ${isSafe ? 'bg-cyber-success/10' : 'bg-cyber-danger/10'}`}>
              {isSafe ? <ShieldCheck className="w-12 h-12 text-cyber-success" /> : <ShieldAlert className="w-12 h-12 text-cyber-danger" />}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">{result.verdict.toUpperCase()}</h2>
              <p className="text-gray-400 max-w-lg mt-1">{result.summary}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-cyber-900 rounded-lg border border-cyber-700">
            <span className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-1">Fake Probability</span>
            <div className={`text-5xl font-mono font-bold ${scoreColor}`}>
              {result.fakeProbability.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Artifacts */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-cyber-800 rounded-xl border border-cyber-700 p-5 h-full">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyber-accent" />
              Detected Artifacts
            </h3>
            <div className="space-y-3">
              {result.artifacts.length === 0 ? (
                <div className="text-gray-500 italic text-sm text-center py-8">No significant artifacts detected.</div>
              ) : (
                result.artifacts.map((artifact, idx) => (
                  <ArtifactItem key={idx} artifact={artifact} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline Chart */}
          <div className="bg-cyber-800 rounded-xl border border-cyber-700 p-5">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyber-accent" />
              Temporal Anomaly Analysis
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.timeline}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={gaugeColor} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={gaugeColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#9ca3af" 
                    tickFormatter={(val) => `${val}s`}
                    style={{ fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    domain={[0, 100]}
                    style={{ fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                    itemStyle={{ color: gaugeColor }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="anomalyScore" 
                    stroke={gaugeColor} 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-mono text-center">
              *Analysis of anomaly confidence over clip duration
            </p>
          </div>

          {/* Action Area */}
          <div className="flex justify-end">
            <button 
              onClick={onReset}
              className="px-6 py-3 bg-cyber-700 hover:bg-cyber-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 border border-cyber-600"
            >
              Analyze Another File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArtifactItem: React.FC<{ artifact: ForensicArtifact }> = ({ artifact }) => {
  const getIcon = (cat: string) => {
    switch (cat) {
      case 'visual': return <Eye className="w-4 h-4" />;
      case 'audio': return <Mic className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-700 text-gray-400';
    }
  };

  return (
    <div className="bg-cyber-900/50 rounded-lg p-3 border border-cyber-700 hover:border-cyber-600 transition-colors">
      <div className="flex justify-between items-start mb-1">
        <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded border ${getSeverityColor(artifact.severity)}`}>
          {artifact.severity}
        </span>
        <span className="text-gray-500 text-xs flex items-center gap-1">
           {getIcon(artifact.category)} {artifact.category}
        </span>
      </div>
      <h4 className="font-semibold text-gray-200 text-sm mt-2">{artifact.type}</h4>
      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
        {artifact.description}
      </p>
    </div>
  );
};

export default ResultsDashboard;