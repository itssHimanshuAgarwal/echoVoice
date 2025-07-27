import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mic, Volume2, MapPin, Clock, User, Copy, Play, RefreshCw, VolumeX, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useEchoVoice } from "@/hooks/useEchoVoice";
import { PersonSelector } from "@/components/PersonSelector";
import { LocationSelector } from "@/components/LocationSelector";
import { CustomMessageInput } from "@/components/CustomMessageInput";
import { EmotionDetector } from "@/components/EmotionDetector";
import { AutoLocationDetector } from "@/components/AutoLocationDetector";
import { FaceRecognition } from "@/components/FaceRecognition";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmotionDetection } from "@/hooks/useEmotionDetection";
import { useAutoLocation } from "@/hooks/useAutoLocation";
import { useFaceRecognition } from "@/hooks/useFaceRecognition";
import { Loader2, Brain } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [selectedPhrase, setSelectedPhrase] = useState<string>("");
  const [animatingCard, setAnimatingCard] = useState<number | null>(null);
  const [speakingButton, setSpeakingButton] = useState<number | null>(null);
  const rippleRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  
  const { user } = useAuth();
  const { currentEmotion } = useEmotionDetection();
  const { currentLocation: autoLocation, currentTime: autoTime } = useAutoLocation();
  const { nearbyPerson } = useFaceRecognition();
  const {
    isLoading,
    isSpeaking,
    suggestions,
    settings,
    people,
    locations,
    quickActions,
    currentPerson,
    currentLocation,
    generateSuggestions,
    speakPhrase,
    loadInitialData,
    stopSpeaking,
    setCurrentPerson,
    setCurrentLocation,
  } = useEchoVoice();

  // Dynamic context data based on selections and auto-detection
  const contextData = {
    time: autoTime?.currentTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timeOfDay: autoTime?.timeOfDay || 'unknown',
    location: autoLocation?.readableLocation || currentLocation?.name || "No location",
    detectedPerson: nearbyPerson || currentPerson?.name || "No one selected",
    emotion: currentEmotion
  };

  useEffect(() => {
    console.log('Home page - User state:', { 
      user: user ? { id: user.id, email: user.email } : null, 
      peopleCount: people.length, 
      locationsCount: locations.length 
    });
    
    // Only load data when user is authenticated
    if (user?.id) {
      console.log('Loading initial data for user:', user.id);
      loadInitialData(user.id);
    } else {
      console.log('No user found, cannot load data');
    }
  }, [loadInitialData, user]);

  useEffect(() => {
    // Generate suggestions when context changes
    const currentContext = {
      currentEmotion: currentEmotion || 'neutral',
      currentTime: autoTime?.currentTime ? `${autoTime.currentTime}, ${autoTime.timeOfDay}` : undefined,
      currentLocation: autoLocation?.readableLocation || currentLocation?.name || 'general',
      nearbyPerson: nearbyPerson || currentPerson?.name || undefined,
    };
    
    generateSuggestions(currentContext);
  }, [currentPerson, currentLocation, generateSuggestions, autoTime?.timeOfDay, autoTime?.currentTime, autoLocation?.readableLocation, currentEmotion, nearbyPerson]);

  const refreshSuggestions = () => {
    const currentContext = {
      currentEmotion: currentEmotion || 'neutral',
      currentTime: autoTime?.currentTime ? `${autoTime.currentTime}, ${autoTime.timeOfDay}` : undefined,
      currentLocation: autoLocation?.readableLocation || currentLocation?.name || 'general',
      nearbyPerson: nearbyPerson || currentPerson?.name || undefined,
    };
    
    generateSuggestions(currentContext);
  };

  const handleSpeakPhrase = async (phrase: string, cardId?: number) => {
    setSelectedPhrase(phrase);
    
    // Trigger card animation
    if (cardId !== undefined) {
      setAnimatingCard(cardId);
      setSpeakingButton(cardId);
      setTimeout(() => setAnimatingCard(null), 600);
      setTimeout(() => setSpeakingButton(null), 1500);
    }
    
    // Use the new EchoVoice speakPhrase function
    await speakPhrase(phrase, 'ai_suggested');
  };

  const handleQuickActionSpeak = async (phrase: string, index: number) => {
    setSelectedPhrase(phrase);
    setAnimatingCard(index + 100);
    setSpeakingButton(index + 100);
    setTimeout(() => setAnimatingCard(null), 600);
    setTimeout(() => setSpeakingButton(null), 1500);
    
    await speakPhrase(phrase, 'quick_action');
  };

  const createRipple = (event: React.MouseEvent, cardId: number) => {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.3);
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
      z-index: 10;
    `;
    
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-warning text-warning-foreground";
      case "medium": return "bg-accent text-accent-foreground";
      case "low": return "bg-secondary text-secondary-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header with Settings Button and Sign Out */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">EchoVoice</h1>
          <p className="text-muted-foreground">Your intelligent communication assistant</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Dynamic Context Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
        <PersonSelector 
          onPersonSelect={setCurrentPerson}
          selectedPerson={currentPerson}
        />
        <LocationSelector 
          onLocationSelect={setCurrentLocation}
          selectedLocation={currentLocation}
        />
        <EmotionDetector />
        <AutoLocationDetector />
        <FaceRecognition />
      </div>

      {/* Current Context Display */}
      <Card className="context-section">
        <CardHeader className="pb-5">
          <CardTitle className="text-lg font-display">Current Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/30 shadow-[var(--shadow-soft)]">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Time ({contextData.timeOfDay})</div>
                <div className="font-medium">{contextData.time}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/30 shadow-[var(--shadow-soft)]">
              <div className="p-2 bg-accent/10 rounded-lg">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Location {autoLocation ? '(Auto)' : '(Manual)'}</div>
                <div className="font-medium">{contextData.location}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/30 shadow-[var(--shadow-soft)]">
              <div className="p-2 bg-success/10 rounded-lg">
                <User className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Person {nearbyPerson ? '(Detected)' : '(Manual)'}</div>
                <div className="font-medium">{contextData.detectedPerson}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/30 shadow-[var(--shadow-soft)]">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Brain className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Emotion</div>
                <div className="font-medium capitalize">{contextData.emotion}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Phrase Suggestions */}
      <Card className="phrase-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-display">Smart Suggestions</CardTitle>
              <CardDescription>
                Personalized phrases based on your context and preferences
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshSuggestions}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
              {isSpeaking && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopSpeaking}
                >
                  <VolumeX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {isLoading ? "Generating personalized suggestions..." : "No suggestions available. Try selecting a person or location, then refresh."}
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <Card 
                key={index} 
                className={cn(
                  "cursor-pointer transition-[var(--transition-gentle)] border-l-4 relative overflow-hidden",
                  "hover:scale-[1.01] hover:shadow-[var(--shadow-gentle)]",
                  selectedPhrase === suggestion.phrase ? 'ring-2 ring-primary border-l-primary' : 'border-l-accent/30 hover:border-l-accent',
                  animatingCard === index && 'animate-gentle-bounce'
                )}
                onClick={(e) => {
                  createRipple(e, index);
                  handleSpeakPhrase(suggestion.phrase, index);
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={cn("text-xs font-medium", getPriorityColor(suggestion.priority))}>
                          {suggestion.priority} priority
                        </Badge>
                      </div>
                      <div className="text-lg font-medium mb-2 leading-relaxed font-display">
                        {suggestion.phrase}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.category}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="lg" 
                        variant="warm"
                        className={cn(
                          "h-12 w-12 p-0 rounded-xl relative overflow-hidden",
                          speakingButton === index && 'animate-speak-ready'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeakPhrase(suggestion.phrase, index);
                        }}
                      >
                        <Volume2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Selected Phrase Display */}
      {selectedPhrase && (
        <Card className="bg-primary/5 border-primary/20 shadow-[var(--shadow-gentle)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2 font-medium">Last spoken phrase:</div>
                <div className="text-lg font-medium font-display">{selectedPhrase}</div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(selectedPhrase)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleSpeakPhrase(selectedPhrase)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Speak Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
          <CardDescription>
            Your most-used phrases for instant communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {quickActions.length > 0 ? (
              quickActions.map((action, index) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="xl"
                  className={cn(
                    "h-16 text-base font-medium relative overflow-hidden group",
                    speakingButton === index + 100 && 'animate-speak-ready'
                  )}
                  onClick={(e) => {
                    createRipple(e, index + 100);
                    handleQuickActionSpeak(action.phrase, index);
                  }}
                >
                  <Volume2 className="h-4 w-4 mr-2 text-primary" />
                  {action.phrase}
                </Button>
              ))
            ) : (
              ["Yes", "No", "Thank you", "Help", "Water", "Tired"].map((phrase, index) => (
                <Button
                  key={phrase}
                  variant="outline"
                  size="xl"
                  className={cn(
                    "h-16 text-base font-medium relative overflow-hidden group",
                    speakingButton === index + 100 && 'animate-speak-ready'
                  )}
                  onClick={(e) => {
                    createRipple(e, index + 100);
                    handleQuickActionSpeak(phrase, index);
                  }}
                >
                  <Volume2 className="h-4 w-4 mr-2 text-primary" />
                  {phrase}
                </Button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Message Input */}
      <CustomMessageInput />
    </div>
  );
};

export default Home;