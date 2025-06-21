'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEmployee } from '@/lib/storage';
import { SalesEmployee } from '@/types';

export default function UserDetailPage() {
  const params = useParams();
  const [employee, setEmployee] = useState<SalesEmployee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'evaluations'>('overview');

  const userId = params.id as string;

  useEffect(() => {
    const loadEmployee = () => {
      const emp = getEmployee(userId);
      setEmployee(emp || null);
      setIsLoading(false);
    };

    loadEmployee();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            ユーザーが見つかりません
          </h1>
          <Link
            href="/"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    );
  }

  // 統計情報を計算
  const totalEvaluations = employee.evaluations.length;
  const averageScore = totalEvaluations > 0 
    ? employee.evaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / totalEvaluations 
    : 0;
  const latestEvaluation = totalEvaluations > 0 
    ? employee.evaluations[employee.evaluations.length - 1] 
    : null;

  // 評価項目別の平均スコアを計算
  const averageScores = {
    salesSkill: 0,
    communication: 0,
    teamwork: 0,
    leadership: 0,
    customerService: 0
  };

  if (totalEvaluations > 0) {
    const scoreKeys = Object.keys(averageScores) as (keyof typeof averageScores)[];
    scoreKeys.forEach(key => {
      averageScores[key] = employee.evaluations.reduce((sum, evaluation) => sum + evaluation.scores[key], 0) / totalEvaluations;
    });
  }

  const scoreLabels = {
    salesSkill: '営業スキル',
    communication: 'コミュニケーション',
    teamwork: 'チームワーク',
    leadership: 'リーダーシップ',
    customerService: '顧客サービス'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {employee.name}
          </h1>
          <p className="text-xl text-gray-600">
            {employee.position} - {employee.department}
          </p>
        </div>

        {/* ナビゲーション */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← トップページ
          </button>
          <button
            onClick={() => window.location.href = `/${employee.id}`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            評価する
          </button>
        </div>

        {/* タブナビゲーション */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-6 py-2 rounded-md transition-colors ${
                selectedTab === 'overview'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              概要
            </button>
            <button
              onClick={() => setSelectedTab('evaluations')}
              className={`px-6 py-2 rounded-md transition-colors ${
                selectedTab === 'evaluations'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              評価履歴
            </button>
          </div>
        </div>

        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* 統計カード */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {employee.points}
                </div>
                <div className="text-gray-600">総ポイント</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {totalEvaluations}
                </div>
                <div className="text-gray-600">評価回数</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {averageScore.toFixed(1)}
                </div>
                <div className="text-gray-600">平均スコア</div>
              </div>
            </div>

            {/* 評価項目別平均スコア */}
            {totalEvaluations > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  項目別平均スコア
                </h2>
                <div className="space-y-4">
                  {Object.entries(scoreLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center">
                      <div className="w-32 text-sm font-medium text-gray-700">
                        {label}
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${(averageScores[key as keyof typeof averageScores] / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-16 text-right text-sm font-semibold text-indigo-600">
                        {averageScores[key as keyof typeof averageScores].toFixed(1)}/5.0
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 最新の評価 */}
            {latestEvaluation && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  最新の評価
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">評価情報</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      評価者: {latestEvaluation.evaluatorName}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      評価日: {new Date(latestEvaluation.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      総合スコア: {latestEvaluation.totalScore}/100
                    </p>
                    <p className="text-sm text-gray-600">
                      獲得ポイント: +{latestEvaluation.points}pt
                    </p>
                  </div>
                  {latestEvaluation.comments && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">コメント</h3>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {latestEvaluation.comments}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'evaluations' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              評価履歴 ({totalEvaluations}件)
            </h2>
            {totalEvaluations === 0 ? (
              <p className="text-gray-500 text-center py-8">
                まだ評価がありません
              </p>
            ) : (
              <div className="space-y-4">
                {employee.evaluations.slice().reverse().map((evaluation, index) => (
                  <div
                    key={evaluation.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          評価 #{totalEvaluations - index}
                        </h4>
                        <p className="text-sm text-gray-600">
                          評価者: {evaluation.evaluatorName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(evaluation.date).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-indigo-600">
                          +{evaluation.points}pt
                        </div>
                        <div className="text-sm text-gray-600">
                          スコア: {evaluation.totalScore}/100
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                      {Object.entries(scoreLabels).map(([key, label]) => (
                        <div key={key} className="text-center">
                          <div className="text-xs text-gray-500">{label}</div>
                          <div className="text-sm font-semibold text-indigo-600">
                            {evaluation.scores[key as keyof typeof evaluation.scores]}/5
                          </div>
                        </div>
                      ))}
                    </div>

                    {evaluation.comments && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border-l-2 border-indigo-200">
                        <p className="text-sm text-gray-700">
                          <strong>コメント:</strong> {evaluation.comments}
                        </p>
                      </div>
                    )}
                    {evaluation.aiAnalysis && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border-l-2 border-blue-200">
                        <p className="text-sm text-blue-700">
                          <strong>AI分析:</strong> {evaluation.aiAnalysis}
                        </p>
                      </div>
                    )}
                    {evaluation.detailedFeedback && (
                      <div className="mt-3 p-3 bg-green-50 rounded border-l-2 border-green-200">
                        <p className="text-sm text-green-700">
                          <strong>詳細フィードバック:</strong> {evaluation.detailedFeedback}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 