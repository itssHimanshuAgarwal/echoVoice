import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Frown, Angry, Zap, AlertTriangle, Eye, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type EmotionType = 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised' | 'neutral';

interface EmotionSelectorProps {
  onEmotionSelect: (emotion: EmotionType) => void;
  selectedEmotion: EmotionType;
}

const emotions: { type: EmotionType; label: string; emoji: string; icon: any; color: string }[] = [
  { 
    type: 'neutral', 
    label: 'Neutral', 
    emoji: '😐', 
    icon: Minus, 
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300' 
  },
  { 
    type: 'happy', 
    label: 'Happy', 
    emoji: '😊', 
    icon: Heart, 
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
  },
  { 
    type: 'sad', 
    label: 'Sad', 
    emoji: '😢', 
    icon: Frown, 
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
  },
  { 
    type: 'angry', 
    label: 'Frustrated', 
    emoji: '😠', 
    icon: Angry, 
    color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
  },
  { 
    type: 'fearful', 
    label: 'Worried', 
    emoji: '😨', 
    icon: Zap, 
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
  },
  { 
    type: 'surprised', 
    label: 'Surprised', 
    emoji: '😲', 
    icon: Eye, 
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' 
  },
];

export const EmotionSelector = ({ onEmotionSelect, selectedEmotion }: EmotionSelectorProps) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-display">How Are You Feeling?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {emotions.map((emotion) => {
            const IconComponent = emotion.icon;
            return (
              <div
                key={emotion.type}
                className={cn(
                  "flex items-center p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                  selectedEmotion === emotion.type && "ring-2 ring-primary border-primary bg-primary/5"
                )}
                onClick={() => onEmotionSelect(emotion.type)}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted mr-3">
                  <div className="text-xl">{emotion.emoji}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium truncate">
                      {emotion.label}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", emotion.color)}>
                      <IconComponent className="h-3 w-3 mr-1" />
                      {emotion.type}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};