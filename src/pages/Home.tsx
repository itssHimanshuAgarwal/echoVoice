import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Volume2 } from "lucide-react";

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Quick phrases placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Phrases</CardTitle>
          <CardDescription>
            Tap to speak common phrases instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["I need help", "Thank you", "Yes", "No", "Water please", "I'm tired"].map((phrase) => (
              <Button
                key={phrase}
                variant="outline"
                size="lg"
                className="h-16 text-left justify-start text-base"
              >
                <Volume2 className="h-5 w-5 mr-3 text-primary" />
                {phrase}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Context-aware suggestions placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Suggested for You</CardTitle>
          <CardDescription>
            Based on time and context (Phase 2 feature)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
              Context-aware phrase suggestions will appear here in Phase 2
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice input placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Voice Input</CardTitle>
          <CardDescription>
            Record or type custom messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="flex-1 h-16">
              <Mic className="h-6 w-6 mr-3" />
              Record Message
            </Button>
            <Button variant="outline" size="lg" className="flex-1 h-16">
              Type Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;