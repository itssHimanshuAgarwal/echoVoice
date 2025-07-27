import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Heart, MapPin, MessageCircle, RotateCcw } from 'lucide-react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useToast } from '@/hooks/use-toast';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, resetSettings, getTonePromptModifier } = useAppSettings();
  const { toast } = useToast();

  const handleResetSettings = () => {
    resetSettings();
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to default values.",
    });
  };

  const getToneDescription = (tone: string) => {
    switch (tone) {
      case 'formal':
        return 'Professional and polite language';
      case 'friendly':
        return 'Warm and conversational language';
      case 'neutral':
        return 'Clear and straightforward language';
      default:
        return '';
    }
  };

  const getToneBadgeVariant = (tone: string) => {
    switch (tone) {
      case 'formal':
        return 'secondary' as const;
      case 'friendly':
        return 'default' as const;
      case 'neutral':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            App Settings
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetSettings}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Detection Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Detection Features
          </h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="emotion-detection" className="text-sm font-medium">
                  Emotion Detection
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically detect emotions from facial expressions
                </p>
              </div>
            </div>
            <Switch
              id="emotion-detection"
              checked={settings.emotionDetection}
              onCheckedChange={(checked) => updateSettings({ emotionDetection: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="location-detection" className="text-sm font-medium">
                  Location Detection
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically detect your current location
                </p>
              </div>
            </div>
            <Switch
              id="location-detection"
              checked={settings.locationDetection}
              onCheckedChange={(checked) => updateSettings({ locationDetection: checked })}
            />
          </div>
        </div>

        <Separator />

        {/* Phrase Generation Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Phrase Generation
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="phrase-tone" className="text-sm font-medium">
                  Communication Tone
                </Label>
                <p className="text-xs text-muted-foreground">
                  Choose how AI-generated phrases should sound
                </p>
              </div>
            </div>
            
            <div className="pl-7">
              <Select
                value={settings.phraseTone}
                onValueChange={(value: 'formal' | 'friendly' | 'neutral') => 
                  updateSettings({ phraseTone: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg">
                  <SelectItem value="formal">
                    <div className="flex items-center gap-2">
                      <span>Formal</span>
                      <Badge variant="secondary" className="text-xs">
                        Professional
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="friendly">
                    <div className="flex items-center gap-2">
                      <span>Friendly</span>
                      <Badge variant="default" className="text-xs">
                        Casual
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="neutral">
                    <div className="flex items-center gap-2">
                      <span>Neutral</span>
                      <Badge variant="outline" className="text-xs">
                        Direct
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <div className="mt-2 p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">
                  <strong>Current:</strong> {getToneDescription(settings.phraseTone)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>Prompt:</strong> "{getTonePromptModifier()}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Current Settings Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Current Configuration
          </h4>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant={settings.emotionDetection ? "default" : "secondary"}>
              <Heart className="h-3 w-3 mr-1" />
              Emotion {settings.emotionDetection ? 'ON' : 'OFF'}
            </Badge>
            <Badge variant={settings.locationDetection ? "default" : "secondary"}>
              <MapPin className="h-3 w-3 mr-1" />
              Location {settings.locationDetection ? 'ON' : 'OFF'}
            </Badge>
            <Badge variant={getToneBadgeVariant(settings.phraseTone)}>
              <MessageCircle className="h-3 w-3 mr-1" />
              {settings.phraseTone.charAt(0).toUpperCase() + settings.phraseTone.slice(1)} Tone
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};