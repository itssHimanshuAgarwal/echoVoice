import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, Mic, Accessibility, Bell, Shield } from "lucide-react";

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your EchoVoice experience</p>
      </div>

      {/* Speech Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Speech & Voice
          </CardTitle>
          <CardDescription>
            Configure text-to-speech and voice recognition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="voice-speed">Speech Speed</Label>
            <Slider
              id="voice-speed"
              defaultValue={[50]}
              max={100}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice-selection">Voice</Label>
            <Select defaultValue="default">
              <SelectTrigger>
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Voice</SelectItem>
                <SelectItem value="female">Female Voice</SelectItem>
                <SelectItem value="male">Male Voice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume">Volume</Label>
            <Slider
              id="volume"
              defaultValue={[80]}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Accessibility
          </CardTitle>
          <CardDescription>
            Optimize the app for your specific needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Large Text Mode</Label>
              <div className="text-sm text-muted-foreground">
                Increase text size for better readability
              </div>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Contrast</Label>
              <div className="text-sm text-muted-foreground">
                Enhanced contrast for better visibility
              </div>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduced Motion</Label>
              <div className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </div>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="button-size">Button Size</Label>
            <Select defaultValue="large">
              <SelectTrigger>
                <SelectValue placeholder="Select button size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Context & Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Context
          </CardTitle>
          <CardDescription>
            Control how EchoVoice uses context for suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Location-based Suggestions</Label>
              <div className="text-sm text-muted-foreground">
                Suggest phrases based on your location (Phase 2)
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Time-based Suggestions</Label>
              <div className="text-sm text-muted-foreground">
                Suggest phrases based on time of day (Phase 2)
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Save Communication History</Label>
              <div className="text-sm text-muted-foreground">
                Keep record of used phrases for quick access
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1">Save Settings</Button>
        <Button variant="outline" className="flex-1">Reset to Defaults</Button>
      </div>
    </div>
  );
};

export default Settings;