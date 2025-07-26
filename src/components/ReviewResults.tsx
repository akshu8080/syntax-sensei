import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Info, Lightbulb, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Issue {
  type: "error" | "warning" | "suggestion" | "info";
  title: string;
  description: string;
  line?: number;
  severity: "high" | "medium" | "low";
}

interface ReviewResultsProps {
  issues: Issue[];
  overallScore: number;
  isLoading: boolean;
}

const getIssueIcon = (type: Issue["type"]) => {
  switch (type) {
    case "error":
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case "suggestion":
      return <Lightbulb className="h-4 w-4 text-info" />;
    case "info":
      return <Info className="h-4 w-4 text-muted-foreground" />;
  }
};

const getIssueColor = (type: Issue["type"]) => {
  switch (type) {
    case "error":
      return "destructive";
    case "warning":
      return "warning";
    case "suggestion":
      return "info";
    case "info":
      return "secondary";
  }
};

const getSeverityColor = (severity: Issue["severity"]) => {
  switch (severity) {
    case "high":
      return "bg-destructive text-destructive-foreground";
    case "medium":
      return "bg-warning text-warning-foreground";
    case "low":
      return "bg-success text-success-foreground";
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
};

export const ReviewResults = ({ issues, overallScore, isLoading }: ReviewResultsProps) => {
  if (isLoading) {
    return (
      <Card className="p-6 shadow-elegant">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary animate-pulse" />
            <h2 className="text-lg font-semibold">Analyzing Code...</h2>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-elegant">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Code Review Results</h2>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Score:</span>
            <span className={cn("text-lg font-bold", getScoreColor(overallScore))}>
              {overallScore}/100
            </span>
          </div>
        </div>

        <Separator />

        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-success mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-2">Great Job!</h3>
            <p className="text-muted-foreground">No issues found in your code. Keep up the excellent work!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getIssueIcon(issue.type)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground">{issue.title}</h3>
                      <Badge variant={getIssueColor(issue.type)} className="text-xs">
                        {issue.type}
                      </Badge>
                      <Badge className={cn("text-xs", getSeverityColor(issue.severity))}>
                        {issue.severity}
                      </Badge>
                      {issue.line && (
                        <Badge variant="outline" className="text-xs">
                          Line {issue.line}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {issue.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};