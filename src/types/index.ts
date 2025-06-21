// 営業社員の型定義
export interface SalesEmployee {
  id: string;
  name: string;
  department: string;
  position: string;
  points: number;
  evaluations: Evaluation[];
}

// 評価の型定義
export interface Evaluation {
  id: string;
  employeeId: string;
  evaluatorName: string;
  date: string;
  scores: {
    salesSkill: number;
    communication: number;
    teamwork: number;
    leadership: number;
    customerService: number;
  };
  totalScore: number;
  points: number;
  comments: string;
  aiAnalysis?: string;
  detailedFeedback?: string;
  isValid?: boolean;
  recommendations?: string[];
}

// 評価履歴の型定義
export interface EvaluationHistory {
  id: string;
  employeeId: string;
  employeeName: string;
  evaluatorName: string;
  date: string;
  totalScore: number;
  points: number;
  comments: string;
} 