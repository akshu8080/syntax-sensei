import { useState } from "react";
import { Header } from "@/components/Header";
import { CodeEditor } from "@/components/CodeEditor";
import { ReviewResults } from "@/components/ReviewResults";
import { ActionButtons } from "@/components/ActionButtons";
import { FeatureHighlights } from "@/components/FeatureHighlights";

import { useToast } from "@/hooks/use-toast";
import { analyzeCode } from "@/utils/codeAnalyzer";
import { analyzeCodeWithAI } from "@/utils/secureAiAnalyzer";

const Index = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{issues: any[], overallScore: number, explanation?: string} | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to analyze",
        description: "Please enter some code before running the analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Try AI analysis first
      try {
        const aiResults = await analyzeCodeWithAI({
          code,
          language
        });
        setAnalysisResults(aiResults);
        toast({
          title: "AI Analysis Complete!",
          description: `Found ${aiResults.issues.length} issues with a score of ${aiResults.overallScore}/100.`,
        });
        return;
      } catch (aiError) {
        console.error("AI analysis failed:", aiError);
        // Fall back to rule-based analysis
      }
      
      // Use rule-based analysis as fallback
      const results = analyzeCode(code, language);
      setAnalysisResults({
        ...results,
        explanation: "AI analysis failed, using rule-based analysis as fallback."
      });
      toast({
        title: "Fallback Analysis Complete",
        description: `AI failed, used rule-based analysis. Found ${results.issues.length} issues.`,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCode("");
    setAnalysisResults(null);
    toast({
      title: "Reset complete",
      description: "Code editor and results have been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Code Input */}
          <div className="lg:col-span-2 space-y-6">
            <CodeEditor
              code={code}
              language={language}
              onCodeChange={setCode}
              onLanguageChange={setLanguage}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActionButtons
                onAnalyze={handleAnalyze}
                onReset={handleReset}
                isAnalyzing={isAnalyzing}
                hasCode={!!code.trim()}
                hasApiKey={true}
              />
              
            </div>
          </div>
          
          {/* Right Column - Results */}
          <div className="space-y-6">
            <ReviewResults
              issues={analysisResults?.issues || []}
              overallScore={analysisResults?.overallScore || 0}
              isLoading={isAnalyzing}
            />
            
            <div className="hidden md:block lg:hidden">
              <FeatureHighlights />
            </div>
          </div>
        </div>
        
        {/* Features Section for Mobile */}
        <div className="mt-8 md:hidden">
          <FeatureHighlights />
        </div>
      </main>
    </div>
  );
};

export default Index;