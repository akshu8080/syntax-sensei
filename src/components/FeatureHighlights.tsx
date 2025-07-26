import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Brain, Target, Globe, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: <Brain className="h-5 w-5 text-primary" />,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms detect patterns, logic errors, and optimization opportunities.",
    badge: "Smart"
  },
  {
    icon: <Zap className="h-5 w-5 text-accent" />,
    title: "Instant Feedback",
    description: "Get real-time code analysis and suggestions within seconds of submission.",
    badge: "Fast"
  },
  {
    icon: <Target className="h-5 w-5 text-info" />,
    title: "Best Practices",
    description: "Learn industry standards and improve code quality with personalized recommendations.",
    badge: "Learn"
  },
  {
    icon: <Globe className="h-5 w-5 text-warning" />,
    title: "Multi-Language",
    description: "Support for 10+ programming languages including JavaScript, Python, Java, and more.",
    badge: "Universal"
  },
  {
    icon: <Clock className="h-5 w-5 text-success" />,
    title: "Save Time",
    description: "Automate repetitive code review tasks and focus on building great features.",
    badge: "Efficient"
  },
  {
    icon: <Shield className="h-5 w-5 text-destructive" />,
    title: "Security Focus",
    description: "Identify potential security vulnerabilities and suggest secure coding practices.",
    badge: "Secure"
  }
];

export const FeatureHighlights = () => {
  return (
    <Card className="p-6 shadow-elegant">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Why Choose SyntaxSense?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border/50 hover:border-primary/20 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                  {feature.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{feature.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};