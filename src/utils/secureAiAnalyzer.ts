import { supabase } from "@/integrations/supabase/client";

interface AIAnalysisRequest {
  code: string;
  language: string;
}

interface AIAnalysisResponse {
  issues: Array<{
    type: "error" | "warning" | "suggestion" | "info";
    title: string;
    description: string;
    line?: number;
    severity: "high" | "medium" | "low";
  }>;
  overallScore: number;
  explanation: string;
}

export const analyzeCodeWithAI = async ({ code, language }: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
  if (!code || !language) {
    throw new Error('Code and language are required for AI analysis');
  }

  try {
    const { data, error } = await supabase.functions.invoke('analyze-code', {
      body: { code, language }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data as AIAnalysisResponse;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error(`Failed to analyze code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};