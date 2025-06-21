'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEmployees, getEvaluationHistory, resetData } from '@/lib/storage';
import { SalesEmployee, EvaluationHistory } from '@/types';

export default function Home() {
  const [employees, setEmployees] = useState<SalesEmployee[]>([]);
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            営業社員評価システム
          </h1>
          <p className="text-gray-600">
            営業社員の評価とポイント管理システム
          </p>
        </div>

        {/* コントロールボタン */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            データ更新
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            管理画面
          </Link>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            データリセット
          </button>
        </div>

        {/* 営業社員一覧 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {employee.name}
                  </h3>
                  <p className="text-gray-600">{employee.position}</p>
                  <p className="text-sm text-gray-500">{employee.department}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">
                    {employee.points}
                  </div>
                  <div className="text-sm text-gray-500">ポイント</div>
                </div>
              </div>
              
                              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">
                  評価回数: {employee.evaluations.length}回
                </div>
                {employee.evaluations.length > 0 && (
                  <>
                    <div className="text-sm text-gray-600 mb-1">
                      最新評価: {new Date(employee.evaluations[employee.evaluations.length - 1].date).toLocaleDateString()}
                    </div>
                    {employee.evaluations[employee.evaluations.length - 1].aiAnalysis && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
                        AI分析: {employee.evaluations[employee.evaluations.length - 1].aiAnalysis?.substring(0, 100)}...
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/${employee.id}`}
                  className="flex-1 text-center py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  評価する
                </Link>
                <button
                  onClick={() => window.location.href = `/user/${employee.id}`}
                  className="flex-1 text-center py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  詳細
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 評価履歴 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            最新の評価履歴
          </h2>
          {evaluationHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              まだ評価履歴がありません
            </p>
          ) : (
            <div className="space-y-4">
              {evaluationHistory.slice(0, 5).map((history) => (
                <div
                  key={history.id}
                  className="border-l-4 border-indigo-500 pl-4 py-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {history.employeeName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        評価者: {history.evaluatorName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(history.date).toLocaleDateString()}
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
                    <p className="text-sm text-gray-600 mt-2">
                      {history.comments}
                    </p>
                  )}
                </div>
              ))}
              {evaluationHistory.length > 5 && (
                <div className="text-center pt-4">
                  <Link
                    href="/admin"
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    全ての履歴を見る →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
