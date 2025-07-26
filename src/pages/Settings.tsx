import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Volume2, Mic, Accessibility, Bell, Shield, ArrowLeft, Eye, MapPin, Clock, Type, Palette, Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Settings = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // State for all settings (Phase 1 - UI only, no persistence)
  const [settings, setSettings] = useState({
    // Context Controls
    timeDetection: true,
    locationDetection: true,
    faceDetection: false,
    
    // Phrase Style
    languageStyle: "balanced", // formal, informal, balanced
    
    // Speech Settings
    speechSpeed: [50],
    volume: [80],
    voiceType: "default",
    
    // Accessibility
    fontSize: [100], // percentage
    highContrast: false,
    reducedMotion: false,
    largeButtons: false,
    
    // Privacy & Notifications
    saveHistory: true,
    notifications: true,
    emergencyContacts: true
  });
  
  // Redirect to auth if not authenticated
  if (!loading && !user) {
    navigate('/auth');
    return null;
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header with back navigation */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-display">Personalization & Settings</h1>
          <p className="text-muted-foreground">Customize EchoVoice for your needs</p>
        </div>
      </div>

      {/* Context Detection Controls */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Eye className="h-5 w-5 text-accent" />
            Context Detection
          </CardTitle>
          <CardDescription>
            Control how EchoVoice understands your environment for better suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <Label className="text-base font-medium">Time-Based Suggestions</Label>
              </div>
              <div className="text-sm text-muted-foreground pl-6">
                Suggest phrases based on time of day (morning greetings, meal times, etc.)
              </div>
            </div>
            <Switch 
              checked={settings.timeDetection}
              onCheckedChange={(value) => updateSetting('timeDetection', value)}
              className="ml-4"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                <Label className="text-base font-medium">Location Awareness</Label>
              </div>
              <div className="text-sm text-muted-foreground pl-6">
                Suggest context-appropriate phrases based on your location
              </div>
            </div>
            <Switch 
              checked={settings.locationDetection}
              onCheckedChange={(value) => updateSetting('locationDetection', value)}
              className="ml-4"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-success" />
                <Label className="text-base font-medium">Face Detection</Label>
              </div>
              <div className="text-sm text-muted-foreground pl-6">
                Recognize familiar faces to suggest personalized greetings and responses
              </div>
            </div>
            <Switch 
              checked={settings.faceDetection}
              onCheckedChange={(value) => updateSetting('faceDetection', value)}
              className="ml-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Phrase Style Settings */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Type className="h-5 w-5 text-primary" />
            Communication Style
          </CardTitle>
          <CardDescription>
            Choose how formal or casual your suggested phrases should be
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={settings.languageStyle} 
            onValueChange={(value) => updateSetting('languageStyle', value)}
            className="space-y-6"
          >
            <div className="flex items-start space-x-3 p-4 rounded-xl border border-border hover:bg-accent/5 transition-colors">
              <RadioGroupItem value="formal" id="formal" className="mt-1" />
              <div className="space-y-1 flex-1">
                <Label htmlFor="formal" className="text-base font-medium cursor-pointer">
                  Formal Language
                </Label>
                <div className="text-sm text-muted-foreground">
                  Professional, polite phrasing. Example: "I would appreciate assistance with..."
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-xl border border-border hover:bg-accent/5 transition-colors">
              <RadioGroupItem value="balanced" id="balanced" className="mt-1" />
              <div className="space-y-1 flex-1">
                <Label htmlFor="balanced" className="text-base font-medium cursor-pointer">
                  Balanced Style
                </Label>
                <div className="text-sm text-muted-foreground">
                  Mix of formal and casual. Example: "Could you help me with..."
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-xl border border-border hover:bg-accent/5 transition-colors">
              <RadioGroupItem value="informal" id="informal" className="mt-1" />
              <div className="space-y-1 flex-1">
                <Label htmlFor="informal" className="text-base font-medium cursor-pointer">
                  Casual Language
                </Label>
                <div className="text-sm text-muted-foreground">
                  Relaxed, friendly phrasing. Example: "Can you help me with..."
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Speech & Voice Settings */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Volume2 className="h-5 w-5 text-accent" />
            Speech & Voice
          </CardTitle>
          <CardDescription>
            Configure text-to-speech and voice recognition settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="voice-speed" className="text-base font-medium">Speech Speed</Label>
            <Slider
              id="voice-speed"
              value={settings.speechSpeed}
              onValueChange={(value) => updateSetting('speechSpeed', value)}
              max={100}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground px-1">
              <span>Slow & Clear</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="volume" className="text-base font-medium">Volume Level</Label>
            <Slider
              id="volume"
              value={settings.volume}
              onValueChange={(value) => updateSetting('volume', value)}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground px-1">
              <span>Quiet</span>
              <span>Comfortable</span>
              <span>Loud</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="voice-selection" className="text-base font-medium">Voice Type</Label>
            <Select 
              value={settings.voiceType} 
              onValueChange={(value) => updateSetting('voiceType', value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select voice type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Voice</SelectItem>
                <SelectItem value="female">Female Voice</SelectItem>
                <SelectItem value="male">Male Voice</SelectItem>
                <SelectItem value="neutral">Neutral Voice</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Options */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Accessibility className="h-5 w-5 text-success" />
            Accessibility Options
          </CardTitle>
          <CardDescription>
            Optimize the interface for your specific needs and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="font-size" className="text-base font-medium">Text Size</Label>
            <Slider
              id="font-size"
              value={settings.fontSize}
              onValueChange={(value) => updateSetting('fontSize', value)}
              min={75}
              max={150}
              step={25}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground px-1">
              <span>Small</span>
              <span>Normal</span>
              <span>Large</span>
              <span>Extra Large</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <Label className="text-base font-medium">High Contrast Mode</Label>
              </div>
              <div className="text-sm text-muted-foreground pl-6">
                Increase contrast between text and background colors
              </div>
            </div>
            <Switch 
              checked={settings.highContrast}
              onCheckedChange={(value) => updateSetting('highContrast', value)}
              className="ml-4"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                <Label className="text-base font-medium">Reduce Motion</Label>
              </div>
              <div className="text-sm text-muted-foreground pl-6">
                Minimize animations and transitions for comfort
              </div>
            </div>
            <Switch 
              checked={settings.reducedMotion}
              onCheckedChange={(value) => updateSetting('reducedMotion', value)}
              className="ml-4"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-success" />
                <Label className="text-base font-medium">Large Touch Targets</Label>
              </div>
              <div className="text-sm text-muted-foreground pl-6">
                Make buttons and interactive elements larger for easier access
              </div>
            </div>
            <Switch 
              checked={settings.largeButtons}
              onCheckedChange={(value) => updateSetting('largeButtons', value)}
              className="ml-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data Settings */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Data
          </CardTitle>
          <CardDescription>
            Control how your data is stored and used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1 flex-1">
              <Label className="text-base font-medium">Save Communication History</Label>
              <div className="text-sm text-muted-foreground">
                Keep a record of your phrases for quick access and learning
              </div>
            </div>
            <Switch 
              checked={settings.saveHistory}
              onCheckedChange={(value) => updateSetting('saveHistory', value)}
              className="ml-4"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent" />
                <Label className="text-base font-medium">Notifications</Label>
              </div>
              <div className="text-sm text-muted-foreground pl-6">
                Receive alerts about app updates and important information
              </div>
            </div>
            <Switch 
              checked={settings.notifications}
              onCheckedChange={(value) => updateSetting('notifications', value)}
              className="ml-4"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-1 flex-1">
              <Label className="text-base font-medium">Emergency Contact Integration</Label>
              <div className="text-sm text-muted-foreground">
                Allow the app to contact designated people in emergencies
              </div>
            </div>
            <Switch 
              checked={settings.emergencyContacts}
              onCheckedChange={(value) => updateSetting('emergencyContacts', value)}
              className="ml-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <Button size="xl" className="flex-1 h-14">
          Save All Settings
        </Button>
        <Button variant="outline" size="xl" className="flex-1 h-14">
          Reset to Defaults
        </Button>
        <Button variant="ghost" size="xl" className="flex-1 h-14">
          Export Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
