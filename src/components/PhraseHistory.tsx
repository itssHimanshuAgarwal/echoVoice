import React from 'react';
import { usePhraseHistory } from '@/hooks/usePhraseHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trash2, Clock, MapPin, User, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PhraseHistoryProps {
  onSpeakPhrase?: (phrase: string) => void;
}

export const PhraseHistory: React.FC<PhraseHistoryProps> = ({ onSpeakPhrase }) => {
  const { history, clearHistory, removeItem } = usePhraseHistory();

  const formatTimestamp = (timestamp: Date) => {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };

  const getEmotionIcon = (emotion?: string) => {
    switch (emotion?.toLowerCase()) {
      case 'happy':
        return '😊';
      case 'sad':
        return '😢';
      case 'angry':
        return '😠';
      case 'tired':
        return '😴';
      case 'excited':
        return '🎉';
      default:
        return '😐';
    }
  };

  if (history.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Phrases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No phrases in history yet. Start speaking to see your recent phrases here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Phrases
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={clearHistory}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p 
                      className="font-medium text-sm cursor-pointer hover:text-primary transition-colors"
                      onClick={() => onSpeakPhrase?.(item.phrase)}
                    >
                      "{item.phrase}"
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimestamp(item.timestamp)}
                      </Badge>
                      
                      {item.emotion && (
                        <Badge variant="secondary" className="text-xs">
                          <Heart className="h-3 w-3 mr-1" />
                          {getEmotionIcon(item.emotion)} {item.emotion}
                        </Badge>
                      )}
                      
                      {item.location && (
                        <Badge variant="secondary" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {item.location}
                        </Badge>
                      )}
                      
                      {item.person && (
                        <Badge variant="secondary" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          {item.person}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};