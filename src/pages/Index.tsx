import { useState } from "react";
import { Header } from "@/components/Header";
import { CodeEditor } from "@/components/CodeEditor";
import { ReviewResults } from "@/components/ReviewResults";
import { ActionButtons } from "@/components/ActionButtons";
import { FeatureHighlights } from "@/components/FeatureHighlights";
import { useToast } from "@/hooks/use-toast";
import { analyzeCode } from "@/utils/codeAnalyzer";

const Index = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{issues: any[], overallScore: number} | null>(null);
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
    
    // Simulate API call delay
    setTimeout(() => {
      const results = analyzeCode(code, language);
      setAnalysisResults(results);
      setIsAnalyzing(false);
      toast({
        title: "Analysis complete!",
        description: `Found ${results.issues.length} issues with an overall score of ${results.overallScore}/100.`,
      });
    }, 1500);
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
              />
              
              <div className="md:hidden lg:block">
                <FeatureHighlights />
              </div>
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