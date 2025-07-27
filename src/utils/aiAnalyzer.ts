interface AIAnalysisRequest {
  code: string;
  language: string;
  apiKey: string;
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

export const analyzeCodeWithAI = async ({ code, language, apiKey }: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
  if (!apiKey) {
    throw new Error('API key is required for AI analysis');
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

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nPlease analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 2000,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`AI API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response from AI
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the response
      return {
        issues: Array.isArray(parsedResponse.issues) ? parsedResponse.issues : [],
        overallScore: typeof parsedResponse.overallScore === 'number' ? 
          Math.max(0, Math.min(100, parsedResponse.overallScore)) : 50,
        explanation: parsedResponse.explanation || 'Analysis completed'
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback: try to extract insights from text response
      return {
        issues: [{
          type: 'info',
          title: 'AI Analysis Available',
          description: aiResponse.substring(0, 500) + (aiResponse.length > 500 ? '...' : ''),
          severity: 'low'
        }],
        overallScore: 75,
        explanation: 'AI provided text analysis instead of structured data'
      };
    }
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error(`Failed to analyze code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};