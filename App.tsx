import React, { useState, useRef } from 'react';
import { Shield, Upload, FileVideo, AlertCircle, PlayCircle, Lock } from 'lucide-react';
import { analyzeMediaWithGemini } from './services/geminiService';
import { AnalysisResult, AnalysisStatus } from './types';
import ResultsDashboard from './components/ResultsDashboard';
import ScanningOverlay from './components/ScanningOverlay';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video'>('image');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("File too large. Please upload files under 20MB for this demo.");
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setErrorMsg("Unsupported file type. Please upload an image or video.");
      return;
    }

    setFileType(isVideo ? 'video' : 'image');
    setErrorMsg(null);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus(AnalysisStatus.SCANNING);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for API
        const base64Content = base64String.split(',')[1];
        
        setStatus(AnalysisStatus.ANALYZING);
        
        try {
          const analysisData = await analyzeMediaWithGemini(base64Content, file.type);
          setResult(analysisData);
          setStatus(AnalysisStatus.COMPLETE);
        } catch (err: any) {
          console.error(err);
          setErrorMsg(err.message || "Failed to analyze media.");
          setStatus(AnalysisStatus.ERROR);
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setErrorMsg("Error reading file.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AnalysisStatus.IDLE);
    setResult(null);
    setPreviewUrl(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-cyber-900 text-gray-100 font-sans selection:bg-cyber-accent selection:text-black">
      {/* Navigation */}
      <nav className="border-b border-cyber-700 bg-cyber-800/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 bg-cyber-accent/10 rounded-lg flex items-center justify-center border border-cyber-accent/30">
              <Shield className="w-5 h-5 text-cyber-accent" />
            </div>
            <span className="font-mono font-bold text-lg tracking-tight">
              DEEPFAKE<span className="text-cyber-accent">DEFENDER</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 text-xs font-mono text-gray-400 bg-cyber-900 px-3 py-1 rounded-full border border-cyber-700">
                <Lock className="w-3 h-3" />
                <span>SECURE ENCLAVE</span>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {status === AnalysisStatus.IDLE && (
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
                Reveal the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-accent to-blue-600">Truth</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Advanced media forensics powered by multimodal AI. Detect deepfakes, voice cloning, and synthetic manipulation in seconds.
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyber-accent to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-cyber-800 rounded-xl border border-cyber-600 border-dashed p-12 transition-all hover:border-cyber-accent">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-cyber-900 rounded-full flex items-center justify-center border border-cyber-700 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-10 h-10 text-gray-400 group-hover:text-cyber-accent transition-colors" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">Upload Media to Analyze</h3>
                    <p className="text-sm text-gray-400">Supports MP4, MOV, JPG, PNG (Max 20MB)</p>
                  </div>

                  <div className="relative overflow-hidden">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*,image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <button className="px-8 py-3 bg-cyber-accent hover:bg-cyan-400 text-cyber-900 font-bold rounded-lg transition-colors">
                      Select File
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <FeatureCard 
                icon={<FileVideo className="w-6 h-6 text-cyber-accent" />}
                title="Visual Artifacts"
                desc="Detects irregular blinking, lip-sync mismatches, and warping."
              />
              <FeatureCard 
                icon={<PlayCircle className="w-6 h-6 text-cyber-accent" />}
                title="Audio Spectral"
                desc="Analyzes frequency cuts and lack of natural breath sounds."
              />
              <FeatureCard 
                icon={<Shield className="w-6 h-6 text-cyber-accent" />}
                title="Explainable AI"
                desc="Provides clear confidence scores and reasons for flagging."
              />
            </div>
          </div>
        )}

        {(status === AnalysisStatus.SCANNING || status === AnalysisStatus.ANALYZING) && (
          <div className="max-w-4xl mx-auto relative rounded-xl overflow-hidden aspect-video bg-black border border-cyber-700 shadow-2xl">
             {previewUrl && fileType === 'image' && (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain opacity-50" />
             )}
             {previewUrl && fileType === 'video' && (
                <video src={previewUrl} className="w-full h-full object-contain opacity-50" autoPlay loop muted playsInline />
             )}
             <ScanningOverlay status={status} />
          </div>
        )}

        {status === AnalysisStatus.COMPLETE && result && (
          <ResultsDashboard result={result} onReset={handleReset} />
        )}

      </main>
      
      {/* Footer */}
      <footer className="border-t border-cyber-800 bg-cyber-900 mt-auto py-8 text-center text-gray-600 text-sm">
        <p>© 2024 Deepfake Defender Prototype. Powered by Gemini 2.5 Flash.</p>
        <p className="text-xs mt-2 text-gray-700">Media analysis is simulated for demonstration. Do not rely on this for legal forensics.</p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="p-6 rounded-lg bg-cyber-800/50 border border-cyber-700 hover:bg-cyber-800 transition-colors">
    <div className="mb-4">{icon}</div>
    <h3 className="font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

export default App;