import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin, Clock, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useAutoLocation } from '@/hooks/useAutoLocation';

export const AutoLocationDetector = () => {
  const {
    currentLocation,
    currentTime,
    isLoadingLocation,
    locationError,
    permissionStatus,
    refreshLocation,
  } = useAutoLocation();

  const getPermissionBadge = () => {
    switch (permissionStatus) {
      case 'granted':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Enabled
          </Badge>
        );
      case 'denied':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Denied
          </Badge>
        );
      case 'prompt':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Permission Needed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Auto Detection
          </div>
          {getPermissionBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Time Display */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            Current Time
          </div>
          {currentTime && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-lg font-mono font-bold">{currentTime.currentTime}</div>
              <div className="text-sm text-muted-foreground capitalize">{currentTime.timeOfDay}</div>
            </div>
          )}
        </div>

        {/* Location Display */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Current Location
          </div>
          
          {locationError && (
            <div className="space-y-3 p-3 rounded-lg bg-destructive/10 text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{locationError}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <p className="mb-2"><strong>To enable location:</strong></p>
                <p>1. Click the location icon 📍 in your browser's address bar</p>
                <p>2. Select "Allow" for location access</p>
                <p>3. Refresh this page or click the button below</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshLocation}
                disabled={isLoadingLocation}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
          
          {currentLocation && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="font-medium">{currentLocation.readableLocation}</div>
              <div className="text-sm text-muted-foreground">
                Accuracy: ±{Math.round(currentLocation.accuracy)}m
              </div>
            </div>
          )}
          
          {!currentLocation && !locationError && permissionStatus === 'prompt' && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Enable location access for automatic detection
              </p>
              <Button onClick={refreshLocation} disabled={isLoadingLocation}>
                {isLoadingLocation ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                Enable Location
              </Button>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        {currentLocation && (
          <Button
            variant="outline"
            size="sm"
            onClick={refreshLocation}
            disabled={isLoadingLocation}
            className="w-full"
          >
            {isLoadingLocation ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Location
          </Button>
        )}

        {/* Status */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <div>Status: {permissionStatus} | {isLoadingLocation ? 'Detecting...' : currentLocation ? `✅ ${currentLocation.readableLocation}` : '❌ No location'}</div>
          {isLoadingLocation && 'Detecting location...'}
          {!isLoadingLocation && currentLocation && 'Location detected automatically'}
          {!isLoadingLocation && !currentLocation && !locationError && permissionStatus === 'denied' && 'Location access denied'}
        </div>
      </CardContent>
    </Card>
  );
};