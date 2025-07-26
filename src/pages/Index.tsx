import { useState } from "react";
import { Header } from "@/components/Header";
import { CodeEditor } from "@/components/CodeEditor";
import { ReviewResults } from "@/components/ReviewResults";
import { ActionButtons } from "@/components/ActionButtons";
import { FeatureHighlights } from "@/components/FeatureHighlights";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const mockAnalysis = {
  issues: [
    {
      type: "error" as const,
      title: "Missing semicolon",
      description: "JavaScript statements should end with a semicolon for consistency and to avoid potential issues with automatic semicolon insertion.",
      line: 5,
      severity: "medium" as const
    },
    {
      type: "warning" as const,
      title: "Unused variable",
      description: "The variable 'tempData' is declared but never used. Consider removing it or implementing its intended functionality.",
      line: 12,
      severity: "low" as const
    },
    {
      type: "suggestion" as const,
      title: "Use const instead of let",
      description: "Since 'userName' is never reassigned, consider using 'const' instead of 'let' for better code clarity and immutability.",
      line: 8,
      severity: "low" as const
    },
    {
      type: "info" as const,
      title: "Consider using arrow function",
      description: "Arrow functions provide more concise syntax and lexical 'this' binding. Consider converting this function for consistency with modern ES6+ practices.",
      line: 15,
      severity: "low" as const
    }
  ],
  overallScore: 73
};

const Index = () => {
  const [code, setCode] = useState(`function calculateTotal(items) {
  let total = 0
  let tempData = [];
  const userName = "john_doe";
  
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  
  function formatCurrency(amount) {
    return "$" + amount.toFixed(2);
  }
  
  return formatCurrency(total);
}`);
  const [language, setLanguage] = useState("javascript");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<typeof mockAnalysis | null>(null);
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
    
    // Simulate API call
    setTimeout(() => {
      setAnalysisResults(mockAnalysis);
      setIsAnalyzing(false);
      toast({
        title: "Analysis complete!",
        description: `Found ${mockAnalysis.issues.length} issues with an overall score of ${mockAnalysis.overallScore}/100.`,
      });
    }, 2000);
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