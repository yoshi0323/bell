import { SalesEmployee, Evaluation, EvaluationHistory } from '@/types';

// LocalStorageのキー
const EMPLOYEES_KEY = 'sales_employees';
const EVALUATION_HISTORY_KEY = 'evaluation_history';

// 営業社員データの初期値
const initialEmployees: SalesEmployee[] = [
  {
    id: 'user1',
    name: '田中太郎',
    department: '営業部',
    position: '主任',
    points: 0,
    evaluations: []
  },
  {
    id: 'user2',
    name: '佐藤花子',
    department: '営業部',
    position: '係長',
    points: 0,
    evaluations: []
  },
  {
    id: 'user3',
    name: '鈴木次郎',
    department: '営業部',
    position: '一般',
    points: 0,
    evaluations: []
  }
];

// 営業社員データを取得
export const getEmployees = (): SalesEmployee[] => {
  if (typeof window === 'undefined') return initialEmployees;
  
  try {
    const stored = localStorage.getItem(EMPLOYEES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // 初回の場合は初期データを保存
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(initialEmployees));
    return initialEmployees;
  } catch (error) {
    console.error('Failed to get employees:', error);
    return initialEmployees;
  }
};

// 営業社員データを保存
export const saveEmployees = (employees: SalesEmployee[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  } catch (error) {
    console.error('Failed to save employees:', error);
  }
};

// 特定の営業社員を取得
export const getEmployee = (id: string): SalesEmployee | undefined => {
  const employees = getEmployees();
  return employees.find(emp => emp.id === id);
};

// 評価を追加
export const addEvaluation = (employeeId: string, evaluation: Evaluation): void => {
  const employees = getEmployees();
  const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
  
  if (employeeIndex !== -1) {
    // 評価を追加
    employees[employeeIndex].evaluations.push(evaluation);
    // ポイントを更新
    employees[employeeIndex].points += evaluation.points;
    
    // データを保存
    saveEmployees(employees);
    
    // 履歴を保存
    addEvaluationHistory({
      id: evaluation.id,
      employeeId: evaluation.employeeId,
      employeeName: employees[employeeIndex].name,
      evaluatorName: evaluation.evaluatorName,
      date: evaluation.date,
      totalScore: evaluation.totalScore,
      points: evaluation.points,
      comments: evaluation.comments
    });
  }
};

// 評価履歴を取得
export const getEvaluationHistory = (): EvaluationHistory[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(EVALUATION_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get evaluation history:', error);
    return [];
  }
};

// 評価履歴を追加
export const addEvaluationHistory = (history: EvaluationHistory): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const histories = getEvaluationHistory();
    histories.unshift(history); // 最新の履歴を先頭に追加
    localStorage.setItem(EVALUATION_HISTORY_KEY, JSON.stringify(histories));
  } catch (error) {
    console.error('Failed to add evaluation history:', error);
  }
};

// データをリセット
export const resetData = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(EMPLOYEES_KEY);
    localStorage.removeItem(EVALUATION_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to reset data:', error);
  }
}; 