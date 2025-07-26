import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, Clock, Trash2 } from "lucide-react";

const History = () => {
  // Sample history data - will be replaced with real data in later phases
  const historyItems = [
    { id: 1, phrase: "I need help with medication", time: "2 hours ago", frequency: 3 },
    { id: 2, phrase: "Thank you", time: "3 hours ago", frequency: 15 },
    { id: 3, phrase: "I'm feeling tired", time: "Yesterday", frequency: 2 },
    { id: 4, phrase: "Water please", time: "Yesterday", frequency: 8 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Communication History</h1>
          <p className="text-muted-foreground">Recent phrases and messages</p>
        </div>
        <Button variant="outline" size="sm">
          Clear All
        </Button>
      </div>

      <div className="space-y-3">
        {historyItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <span className="font-medium text-base truncate">
                      {item.phrase}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Used {item.frequency} times
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="p-1 h-8 w-8 text-muted-foreground">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state for when there's no history */}
      {historyItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No history yet</h3>
              <p>Your spoken phrases will appear here</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default History;