import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyClraRdoQgyPQAaMEFBeQAFGgqBCxt-00I';

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface EvaluationRequest {
  employeeName: string;
  evaluatorName: string;
  salesSkill: number;
  communication: number;
  teamwork: number;
  leadership: number;
  customerService: number;
  comments: string;
}

export interface EvaluationResponse {
  totalScore: number;
  points: number;
  aiAnalysis: string;
  detailedFeedback: string;
  isValid: boolean;
  recommendations: string[];
}

// API接続テスト用の関数
export async function testGeminiConnection(): Promise<boolean> {
  try {
    console.log('Testing Gemini API connection...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent('テスト');
    const response = await result.response;
    const text = response.text();
    console.log('API connection test successful:', text.substring(0, 100));
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
}

export async function evaluateEmployeeWithAI(request: EvaluationRequest): Promise<EvaluationResponse> {
  try {
    console.log('Starting AI evaluation for:', request.employeeName);
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    const prompt = `
あなたは営業評価の専門家です。以下の営業社員の評価データを詳細に分析し、厳正で建設的な評価を行ってください。

【被評価者】${request.employeeName}
【評価者】${request.evaluatorName}

【各項目評価（1-5点）】
営業スキル: ${request.salesSkill}点
コミュニケーション: ${request.communication}点
チームワーク: ${request.teamwork}点
リーダーシップ: ${request.leadership}点
顧客サービス: ${request.customerService}点

【コメント】
${request.comments || 'なし'}

【評価分析の指針】
1. 評価の妥当性を確認（非現実的な高評価や低評価の検出）
2. コメントと数値評価の整合性をチェック
3. 具体的で建設的なフィードバックを提供
4. 営業スキル向上のための実用的な提案

【評価基準】
- 90点以上: 卓越した成果（20ポイント）
- 80-89点: 優秀な成果（15ポイント）
- 70-79点: 良好な成果（10ポイント）
- 60-69点: 標準的な成果（5ポイント）
- 60点未満: 改善が必要（1ポイント）

【重要な判定条件】
- 明らかに不適切な評価（すべて5点満点など）は無効と判定
- コメントが評価に見合わない場合は妥当性を疑問視
- 建設的でない評価（誹謗中傷等）は無効

以下のJSON形式で回答してください：
{
  "totalScore": 100点満点での総合スコア,
  "points": 獲得ポイント数,
  "aiAnalysis": "AI分析結果（200文字程度）",
  "detailedFeedback": "詳細なフィードバック（300文字程度）",
  "isValid": 評価の妥当性（true/false）,
  "recommendations": ["改善提案1", "改善提案2", "改善提案3"]
}
`;

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    
    console.log('Received response from Gemini API');
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw response text:', text.substring(0, 500) + '...');

    // JSONレスポンスをパース
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', text);
      throw new Error('Gemini APIからの応答にJSONが含まれていません');
    }

    let parsedResponse: EvaluationResponse;
    try {
      parsedResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse JSON:', jsonMatch[0]);
      throw new Error('Gemini APIからの応答のJSON形式が不正です');
    }

    // フォールバック処理
    if (!parsedResponse.isValid) {
      console.warn('AI判定により評価が無効とされました');
    }

    // 基本的な計算を再確認
    const calculatedTotal = request.salesSkill + request.communication + 
                           request.teamwork + request.leadership + request.customerService;
    const calculatedScore = Math.round((calculatedTotal / 25) * 100);
    
    // AIの分析結果を使用、ただし基本計算は保持
    const finalResponse: EvaluationResponse = {
      totalScore: calculatedScore,
      points: parsedResponse.points || calculatePointsFromScore(calculatedScore),
      aiAnalysis: parsedResponse.aiAnalysis || 'AI分析に失敗しました',
      detailedFeedback: parsedResponse.detailedFeedback || '詳細なフィードバックを生成できませんでした',
      isValid: parsedResponse.isValid !== false, // デフォルトはtrue
      recommendations: parsedResponse.recommendations || ['継続的な学習と改善', '定期的な振り返り', '目標設定の明確化']
    };

    console.log('AI Evaluation completed successfully');
    return finalResponse;

  } catch (error) {
    console.error('AI evaluation failed:', error);
    
    // フォールバック評価
    const calculatedTotal = request.salesSkill + request.communication + 
                           request.teamwork + request.leadership + request.customerService;
    const calculatedScore = Math.round((calculatedTotal / 25) * 100);
    
    return {
      totalScore: calculatedScore,
      points: calculatePointsFromScore(calculatedScore),
      aiAnalysis: 'AI分析は利用できませんが、基本的な評価計算を実行しました。',
      detailedFeedback: '評価項目のバランスを考慮し、継続的な改善を推奨します。具体的な行動計画を立てることで、より良い成果を目指しましょう。',
      isValid: true,
      recommendations: [
        '各評価項目の具体的な改善点を特定する',
        '定期的なスキルアップ研修への参加',
        '同僚や上司からのフィードバックを積極的に求める'
      ]
    };
  }
}

function calculatePointsFromScore(totalScore: number): number {
  if (totalScore >= 90) return 20;
  if (totalScore >= 80) return 15;
  if (totalScore >= 70) return 10;
  if (totalScore >= 60) return 5;
  return 1;
} 