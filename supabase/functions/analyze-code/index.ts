import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language }: AnalyzeRequest = await req.json();
    
    if (!code || !language) {
      return new Response(
        JSON.stringify({ error: 'Code and language are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'DeepSeek API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert code reviewer and analyzer. Analyze the provided ${language} code and identify:

1. Syntax errors (high severity)
2. Logic errors and bugs (high/medium severity) 
3. Performance issues (medium severity)
4. Code style and best practices (low severity)
5. Security vulnerabilities (high severity)
6. Maintainability concerns (medium/low severity)

For each issue found, provide:
- Type: "error", "warning", "suggestion", or "info"
- Title: Brief issue name
- Description: Detailed explanation and how to fix
- Line number (if applicable)
- Severity: "high", "medium", or "low"

Also provide an overall code quality score from 0-100 and a brief explanation.

Respond in JSON format:
{
  "issues": [
    {
      "type": "error|warning|suggestion|info",
      "title": "Issue title",
      "description": "Detailed description and fix suggestion",
      "line": 5,
      "severity": "high|medium|low"
    }
  ],
  "overallScore": 85,
  "explanation": "Brief overall assessment"
}`;

    console.log(`Analyzing ${language} code with DeepSeek API`);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Please analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API Error:', response.status, errorData);
      throw new Error(`AI API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('AI Response received, parsing...');

    // Parse the JSON response from AI
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the response
      const result: AIAnalysisResponse = {
        issues: Array.isArray(parsedResponse.issues) ? parsedResponse.issues : [],
        overallScore: typeof parsedResponse.overallScore === 'number' ? 
          Math.max(0, Math.min(100, parsedResponse.overallScore)) : 50,
        explanation: parsedResponse.explanation || 'Analysis completed'
      };

      console.log(`Analysis completed. Found ${result.issues.length} issues. Score: ${result.overallScore}`);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback: try to extract insights from text response
      const fallbackResult: AIAnalysisResponse = {
        issues: [{
          type: 'info',
          title: 'AI Analysis Available',
          description: aiResponse.substring(0, 500) + (aiResponse.length > 500 ? '...' : ''),
          severity: 'low'
        }],
        overallScore: 75,
        explanation: 'AI provided text analysis instead of structured data'
      };

      return new Response(JSON.stringify(fallbackResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Code analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: `Failed to analyze code: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});