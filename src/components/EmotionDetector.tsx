import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Camera, CameraOff, Brain } from 'lucide-react';
import { useEmotionDetection, type EmotionType } from '@/hooks/useEmotionDetection';

const emotionEmojis: Record<EmotionType, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  fearful: '😨',
  disgusted: '🤢',
  surprised: '😲',
  neutral: '😐',
};

const emotionColors: Record<EmotionType, string> = {
  happy: 'bg-green-100 text-green-800',
  sad: 'bg-blue-100 text-blue-800',
  angry: 'bg-red-100 text-red-800',
  fearful: 'bg-purple-100 text-purple-800',
  disgusted: 'bg-yellow-100 text-yellow-800',
  surprised: 'bg-orange-100 text-orange-800',
  neutral: 'bg-gray-100 text-gray-800',
};

export const EmotionDetector = () => {
  const {
    currentEmotion,
    confidence,
    isInitialized,
    isDetecting,
    error,
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
    setManualEmotion,
  } = useEmotionDetection();

  // Main emotions for quick selection
  const quickEmotions: EmotionType[] = ['neutral', 'happy', 'sad'];

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Emotion Detection
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {/* Current Emotion Display */}
        <div className="text-center space-y-2">
          <div className="text-4xl">
            {emotionEmojis[currentEmotion]}
          </div>
          <Badge className={emotionColors[currentEmotion]}>
            {currentEmotion} ({Math.round(confidence * 100)}%)
          </Badge>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {!isDetecting ? (
            <Button
              onClick={startDetection}
              disabled={!isInitialized || !!error}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Start Detection
            </Button>
          ) : (
            <Button
              onClick={stopDetection}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CameraOff className="h-4 w-4" />
              Stop Detection
            </Button>
          )}
        </div>
        
        {/* Hidden video and canvas elements */}
        <div className="hidden">
          <video ref={videoRef} autoPlay muted />
          <canvas ref={canvasRef} />
        </div>
        
        {/* Quick Emotion Selection */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2 text-center">Quick Selection:</p>
          <div className="flex gap-2 justify-center">
            {quickEmotions.map((emotion) => (
              <Button
                key={emotion}
                variant={currentEmotion === emotion ? "default" : "outline"}
                size="sm"
                onClick={() => setManualEmotion?.(emotion)}
                className="text-xs"
              >
                {emotionEmojis[emotion]} {emotion}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Status */}
        <div className="text-center text-sm text-muted-foreground">
          {!isInitialized && 'Initializing...'}
          {isInitialized && !isDetecting && 'Ready to detect emotions'}
          {isDetecting && 'Detecting emotions automatically...'}
        </div>
      </CardContent>
    </Card>
  );
};