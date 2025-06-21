'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addEvaluation } from '@/lib/storage';
import { Evaluation } from '@/types';

export default function User2EvaluationPage() {
  const router = useRouter();
  const [evaluatorName, setEvaluatorName] = useState('');
  const [scores, setScores] = useState({
    salesSkill: 5,
    communication: 5,
    teamwork: 5,
    leadership: 5,
    customerService: 5
  });
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employeeId = 'user2';
  const employeeName = '佐藤花子';

  const handleScoreChange = (category: keyof typeof scores, value: number) => {
    setScores(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const calculateTotalScore = () => {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return Math.round((total / 25) * 100); // 25点満点を100点満点に換算
  };

  const calculatePoints = (totalScore: number) => {
    // スコアに応じてポイントを計算
    if (totalScore >= 90) return 20;
    if (totalScore >= 80) return 15;
    if (totalScore >= 70) return 10;
    if (totalScore >= 60) return 5;
    return 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!evaluatorName.trim()) {
      alert('評価者名を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const totalScore = calculateTotalScore();
      const points = calculatePoints(totalScore);
      
      const evaluation: Evaluation = {
        id: Date.now().toString(),
        employeeId,
        evaluatorName: evaluatorName.trim(),
        date: new Date().toISOString(),
        scores,
        totalScore,
        points,
        comments: comments.trim()
      };

      addEvaluation(employeeId, evaluation);
      
      alert(`評価が完了しました！\n${employeeName}さんに${points}ポイントが付与されました。`);
      router.push('/');
    } catch (error) {
      console.error('評価の保存に失敗しました:', error);
      alert('評価の保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scoreLabels = {
    salesSkill: '営業スキル',
    communication: 'コミュニケーション',
    teamwork: 'チームワーク',
    leadership: 'リーダーシップ',
    customerService: '顧客サービス'
  };

  const totalScore = calculateTotalScore();
  const estimatedPoints = calculatePoints(totalScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              営業社員評価
            </h1>
            <div className="text-xl text-indigo-600 font-semibold">
              対象者: {employeeName}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 評価者名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                評価者名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="あなたの名前を入力してください"
                required
              />
            </div>

            {/* 評価項目 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">評価項目</h3>
              {Object.entries(scoreLabels).map(([key, label]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-medium text-gray-700">{label}</label>
                    <span className="text-lg font-bold text-indigo-600">
                      {scores[key as keyof typeof scores]}点
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={scores[key as keyof typeof scores]}
                    onChange={(e) => handleScoreChange(key as keyof typeof scores, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 (低い)</span>
                    <span>3 (普通)</span>
                    <span>5 (高い)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* スコア表示 */}
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">
                  総合スコア
                </span>
                <span className="text-2xl font-bold text-indigo-600">
                  {totalScore}/100
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">
                  獲得予定ポイント
                </span>
                <span className="text-lg font-bold text-green-600">
                  +{estimatedPoints}pt
                </span>
              </div>
            </div>

            {/* コメント */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                コメント（任意）
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="評価に関するコメントがあれば入力してください"
              />
            </div>

            {/* ボタン */}
            <div className="flex gap-4">
              <Link
                href="/"
                className="flex-1 text-center py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '評価中...' : '評価を提出'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 