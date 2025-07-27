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
import { PhraseHistory } from "@/components/PhraseHistory";
import EmergencyButton from "@/components/EmergencyButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmotionDetection } from "@/hooks/useEmotionDetection";
import { useAutoLocation } from "@/hooks/useAutoLocation";
import { usePhraseHistory } from "@/hooks/usePhraseHistory";
import { useAppSettings } from "@/hooks/useAppSettings";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Loader2, Brain, Heart } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const [selectedPhrase, setSelectedPhrase] = useState<string>("");
  const [animatingCard, setAnimatingCard] = useState<number | null>(null);
  const [speakingButton, setSpeakingButton] = useState<number | null>(null);
  const rippleRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Hooks
  const { currentEmotion } = useEmotionDetection();
  const { currentTime } = useAutoLocation();

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
    loadInitialData,
    generateSuggestions,
    speakPhrase,
    updateSettings,
    stopSpeaking,
    addPerson,
    updatePerson,
    refreshLocations,
    setCurrentPerson,
    setCurrentLocation,
  } = useEchoVoice();
  
  const { addToHistory } = usePhraseHistory();
  const { settings: appSettings, getTonePromptModifier } = useAppSettings();

  // Load data when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('Loading initial data for user:', user.id);
      loadInitialData(user.id);
    } else {
      console.log('No user found, cannot load data');
    }
  }, [loadInitialData, user]);

  useEffect(() => {
    // Generate suggestions automatically when context changes
    const currentContext = {
      currentEmotion: appSettings.emotionDetection ? (currentEmotion || 'neutral') : 'neutral',
      currentTime: currentTime ? `${currentTime.currentTime}, ${currentTime.timeOfDay}` : undefined,
      currentLocation: currentLocation?.name || 'general',
      nearbyPerson: currentPerson?.name || undefined,
      toneModifier: getTonePromptModifier(),
    };
    
    console.log('🔄 CONTEXT CHANGED - Emotion:', currentEmotion, 'Time:', currentTime?.timeOfDay);
    console.log('🔄 Full context:', currentContext);
    console.log('🔄 Calling generateSuggestions now...');
    generateSuggestions(currentContext);
  }, [currentEmotion, currentPerson, currentLocation, generateSuggestions, currentTime?.timeOfDay, currentTime?.currentTime, appSettings.emotionDetection, getTonePromptModifier]);

  const refreshSuggestions = () => {
    // Always generate suggestions now
    
    const currentContext = {
      currentEmotion: appSettings.emotionDetection ? (currentEmotion || 'neutral') : 'neutral',
      currentTime: currentTime ? `${currentTime.currentTime}, ${currentTime.timeOfDay}` : undefined,
      currentLocation: currentLocation?.name || 'general',
      nearbyPerson: currentPerson?.name || undefined,
      toneModifier: getTonePromptModifier(),
    };
    
    generateSuggestions(currentContext);
  };

  const handleSpeakPhrase = async (phrase: string, cardId?: number) => {
    setSelectedPhrase(phrase);
    
    // Add to history with current context
    addToHistory(
      phrase,
      currentEmotion,
      currentLocation?.name,
      currentPerson?.name,
      'ai_suggested'
    );
    
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
    
    // Add to history with current context
    addToHistory(
      phrase,
      currentEmotion,
      currentLocation?.name,
      currentPerson?.name,
      'quick_action'
    );
    
    setAnimatingCard(index + 100);
    setSpeakingButton(index + 100);
    setTimeout(() => setAnimatingCard(null), 600);
    setTimeout(() => setSpeakingButton(null), 1500);
    
    await speakPhrase(phrase, 'quick_action');
  };
  
  const handleCustomPhraseSpoken = (phrase: string, emotion?: string, location?: string, person?: string, phraseType?: string) => {
    addToHistory(phrase, emotion, location, person, phraseType);
  };
  
  const handleEmergencyActivated = async (message: string) => {
    // Add to history with emergency context
    addToHistory(
      message,
      currentEmotion || 'urgent',
      currentLocation?.name || 'unknown location',
      currentPerson?.name || 'no one nearby',
      'emergency'
    );
    
    // Speak the emergency message with high volume and urgency
    try {
      if ('speechSynthesis' in window) {
        // Use browser TTS for emergency (more reliable than API)
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.2; // Higher pitch for urgency
        utterance.volume = 1.0; // Maximum volume
        utterance.lang = 'en-US';
        
        // Get a clear, authoritative voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Female') || voice.name.includes('Karen') || voice.name.includes('Samantha')
        ) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
      } else {
        // Fallback to regular TTS system
        await speakPhrase(message, 'emergency');
      }
    } catch (error) {
      console.error('Emergency TTS failed:', error);
      // Ensure we still try the regular TTS as backup
      await speakPhrase(message, 'emergency');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">EchoVoice</h1>
              <p className="text-sm text-muted-foreground">Your intelligent communication assistant</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/settings')}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-8">
            
            {/* Context Detection Row */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Context Detection</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appSettings.emotionDetection && (
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        Emotion Detection
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EmotionDetector />
                    </CardContent>
                  </Card>
                )}
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Time Context
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {currentTime && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="text-lg font-mono font-bold">{currentTime.currentTime}</div>
                          <div className="text-sm text-muted-foreground capitalize">{currentTime.timeOfDay}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Manual Context Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Context Selection</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">People</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PersonSelector 
                      onPersonSelect={setCurrentPerson}
                      selectedPerson={currentPerson}
                    />
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LocationSelector 
                      onLocationSelect={setCurrentLocation}
                      selectedLocation={currentLocation}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">AI Suggestions</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshSuggestions}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>

              {suggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map((suggestion, index) => (
                    <Card 
                      key={index}
                      className={cn(
                        "cursor-pointer hover:shadow-lg transition-all duration-300 group border-2",
                        animatingCard === index && "animate-pulse scale-105 border-primary",
                        speakingButton === index && "bg-primary/5"
                      )}
                      onClick={() => handleSpeakPhrase(suggestion.phrase, index)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                              "{suggestion.phrase}"
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.category}
                              </Badge>
                              <Badge 
                                variant={suggestion.priority === 'high' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {suggestion.priority}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={cn(
                              "shrink-0 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                              speakingButton === index && "opacity-100 text-primary"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeakPhrase(suggestion.phrase, index);
                            }}
                          >
                            {speakingButton === index ? (
                              <VolumeX className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium text-foreground mb-2">No Suggestions Available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enable emotion or location detection in settings to get AI-powered phrase suggestions.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={refreshSuggestions}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.slice(0, 8).map((action, index) => (
                    <Card 
                      key={action.id}
                      className={cn(
                        "cursor-pointer hover:shadow-lg transition-all duration-300 group border-2",
                        animatingCard === index + 100 && "animate-pulse scale-105 border-primary",
                        speakingButton === index + 100 && "bg-primary/5"
                      )}
                      onClick={() => handleQuickActionSpeak(action.phrase, index)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="mb-2">
                          <Volume2 className="h-6 w-6 mx-auto text-primary" />
                        </div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {action.phrase}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Message Input */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Custom Messages</h2>
              <CustomMessageInput 
                currentEmotion={currentEmotion}
                currentLocation={currentLocation?.name}
                currentPerson={currentPerson?.name}
                onPhraseSpoken={handleCustomPhraseSpoken}
              />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <PhraseHistory onSpeakPhrase={handleSpeakPhrase} />
            <SettingsPanel />
          </div>
        </div>
      </div>
      
      {/* Emergency Button - Fixed positioning */}
      <EmergencyButton 
        onEmergencyActivated={handleEmergencyActivated}
        userLocation={currentLocation?.name || 'Location unknown'}
        userName={user?.email?.split('@')[0] || 'EchoVoice user'}
      />
    </div>
  );
};

export default Home;