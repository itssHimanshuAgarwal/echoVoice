import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Users, Camera, CameraOff, Eye } from 'lucide-react';
import { useFaceRecognition, type KnownPerson } from '@/hooks/useFaceRecognition';

const personEmojis: Record<Exclude<KnownPerson, null>, string> = {
  'Sarah': '👩',
  'Nurse John': '👨‍⚕️',
};

const personColors: Record<Exclude<KnownPerson, null>, string> = {
  'Sarah': 'bg-pink-100 text-pink-800',
  'Nurse John': 'bg-blue-100 text-blue-800',
};

export const FaceRecognition = () => {
  const {
    nearbyPerson,
    confidence,
    isInitialized,
    isDetecting,
    error,
    videoRef,
    canvasRef,
    startRecognition,
    stopRecognition,
  } = useFaceRecognition();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Face Recognition
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {/* Detected Person Display */}
        <div className="text-center space-y-2">
          {nearbyPerson ? (
            <>
              <div className="text-4xl">
                {personEmojis[nearbyPerson]}
              </div>
              <Badge className={personColors[nearbyPerson]}>
                {nearbyPerson} ({Math.round(confidence * 100)}%)
              </Badge>
            </>
          ) : (
            <>
              <div className="text-4xl text-muted-foreground">
                👤
              </div>
              <Badge variant="outline">
                {isDetecting ? 'Looking for faces...' : 'No one detected'}
              </Badge>
            </>
          )}
        </div>
        
        {/* Known Faces Info */}
        <div className="text-center space-y-1">
          <div className="text-xs text-muted-foreground">Known Faces:</div>
          <div className="flex justify-center gap-2">
            <span className="text-xs">👩 Sarah</span>
            <span className="text-xs">👨‍⚕️ Nurse John</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {!isDetecting ? (
            <Button
              onClick={startRecognition}
              disabled={!isInitialized || !!error}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Start Recognition
            </Button>
          ) : (
            <Button
              onClick={stopRecognition}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CameraOff className="h-4 w-4" />
              Stop Recognition
            </Button>
          )}
        </div>
        
        {/* Hidden video and canvas elements */}
        <div className="hidden">
          <video ref={videoRef} autoPlay muted />
          <canvas ref={canvasRef} />
        </div>
        
        {/* Status */}
        <div className="text-center text-sm text-muted-foreground">
          {!isInitialized && 'Loading face recognition models...'}
          {isInitialized && !isDetecting && 'Ready to recognize faces'}
          {isDetecting && 'Scanning for known faces...'}
        </div>
      </CardContent>
    </Card>
  );
};