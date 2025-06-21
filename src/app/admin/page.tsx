'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEmployees, getEvaluationHistory, resetData } from '@/lib/storage';
import { SalesEmployee, EvaluationHistory } from '@/types';

export default function AdminPage() {
  const [employees, setEmployees] = useState<SalesEmployee[]>([]);
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'history'>('overview');

  // データを読み込む
  const loadData = () => {
    const employeesData = getEmployees();
    const historyData = getEvaluationHistory();
    setEmployees(employeesData);
    setEvaluationHistory(historyData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // データリフレッシュ
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      loadData();
    }, 300);
  };

  // データリセット
  const handleReset = () => {
    if (confirm('全てのデータをリセットしますか？この操作は取り消せません。')) {
      resetData();
      handleRefresh();
    }
  };

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

  // 統計情報を計算
  const totalEvaluations = evaluationHistory.length;
  const totalPoints = employees.reduce((sum, emp) => sum + emp.points, 0);
  const averageScore = evaluationHistory.length > 0 
    ? evaluationHistory.reduce((sum, hist) => sum + hist.totalScore, 0) / evaluationHistory.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            管理画面
          </h1>
          <p className="text-gray-600">
            営業社員評価システムの管理・データ確認
          </p>
        </div>

        {/* コントロールボタン */}
        <div className="flex justify-center gap-4 mb-8">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← トップページ
          </Link>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            データ更新
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            データリセット
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
              onClick={() => setSelectedTab('history')}
              className={`px-6 py-2 rounded-md transition-colors ${
                selectedTab === 'history'
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
            {/* 統計情報 */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {totalEvaluations}
                </div>
                <div className="text-gray-600">総評価回数</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {totalPoints}
                </div>
                <div className="text-gray-600">総獲得ポイント</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {averageScore.toFixed(1)}
                </div>
                <div className="text-gray-600">平均スコア</div>
              </div>
            </div>

            {/* 営業社員詳細 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                営業社員詳細
              </h2>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {employee.name}
                        </h3>
                        <p className="text-gray-600">{employee.position} - {employee.department}</p>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>評価回数: {employee.evaluations.length}回</p>
                          {employee.evaluations.length > 0 && (
                            <>
                              <p>
                                平均スコア: {(
                                  employee.evaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / 
                                  employee.evaluations.length
                                ).toFixed(1)}点
                              </p>
                              <p>
                                最新評価: {new Date(employee.evaluations[employee.evaluations.length - 1].date).toLocaleDateString()}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">
                          {employee.points}
                        </div>
                        <div className="text-sm text-gray-500">ポイント</div>
                        <Link
                          href={`/user/${employee.id}`}
                          className="mt-2 inline-block px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                        >
                          詳細
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'history' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              全評価履歴
            </h2>
            {evaluationHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                まだ評価履歴がありません
              </p>
            ) : (
              <div className="space-y-4">
                {evaluationHistory.map((history, index) => (
                  <div
                    key={history.id}
                    className="border-l-4 border-indigo-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          #{index + 1} {history.employeeName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          評価者: {history.evaluatorName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(history.date).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-indigo-600">
                          +{history.points}pt
                        </div>
                        <div className="text-sm text-gray-600">
                          スコア: {history.totalScore}/100
                        </div>
                      </div>
                    </div>
                    {history.comments && (
                      <div className="mt-3 p-3 bg-white rounded border-l-2 border-gray-200">
                        <p className="text-sm text-gray-700">
                          <strong>コメント:</strong> {history.comments}
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