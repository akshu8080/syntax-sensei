import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Play, RotateCcw, Download, Share } from "lucide-react";

interface ActionButtonsProps {
  onAnalyze: () => void;
  onReset: () => void;
  isAnalyzing: boolean;
  hasCode: boolean;
}

export const ActionButtons = ({ onAnalyze, onReset, isAnalyzing, hasCode }: ActionButtonsProps) => {
  return (
    <Card className="p-6 shadow-elegant">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Actions</h2>
          <Badge variant="info" className="text-xs">
            AI Powered
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onAnalyze}
            disabled={!hasCode || isAnalyzing}
            className="h-12 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary shadow-glow transition-all duration-300"
          >
            <Play className="h-4 w-4 mr-2" />
            {isAnalyzing ? "Analyzing..." : "Analyze Code"}
          </Button>
          
          <Button
            onClick={onReset}
            variant="outline"
            disabled={!hasCode}
            className="h-12 border-muted-foreground/20 hover:border-primary/50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
        
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasCode}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-2" />
              Export Report
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              disabled={!hasCode}
              className="text-xs"
            >
              <Share className="h-3 w-3 mr-2" />
              Share Results
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};