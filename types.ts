export interface ForensicArtifact {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: 'visual' | 'audio' | 'metadata';
}

export interface TimelinePoint {
  timestamp: number;
  anomalyScore: number; // 0-100
  notes?: string;
}

export interface AnalysisResult {
  fakeProbability: number; // 0-100
  verdict: string;
  summary: string;
  artifacts: ForensicArtifact[];
  timeline: TimelinePoint[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}