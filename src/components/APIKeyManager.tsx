import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, ExternalLink, Shield } from "lucide-react";
import { useState } from "react";

interface APIKeyManagerProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const APIKeyManager = ({ apiKey, onApiKeyChange }: APIKeyManagerProps) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <Card className="p-6 shadow-elegant border-info/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-info" />
            <h2 className="text-lg font-semibold text-foreground">AI Configuration</h2>
          </div>
          <Badge variant="info" className="text-xs">
            Perplexity AI
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-info/5 border border-info/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-info mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-info">Recommended: Connect to Supabase</p>
                <p className="text-muted-foreground mt-1">
                  For production use, store your API key securely in Supabase Edge Function Secrets.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs border-info/30 hover:border-info/50"
                  onClick={() => window.open('https://docs.lovable.dev/supabase/edge-functions#secrets', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Learn More
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-sm font-medium">
              Perplexity API Key (Temporary)
            </Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="pplx-..."
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKey(!showKey)}
                className="px-3"
              >
                {showKey ? "Hide" : "Show"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a 
                href="https://www.perplexity.ai/settings/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-info hover:underline"
              >
                Perplexity AI Settings
              </a>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};