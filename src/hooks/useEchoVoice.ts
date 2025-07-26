import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PhraseContext {
  timeOfDay?: string;
  location?: string;
  person?: string;
  style?: 'formal' | 'balanced' | 'casual';
  recentHistory?: string[];
}

export interface PhraseSuggestion {
  phrase: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface UserSettings {
  communication_style: 'formal' | 'balanced' | 'casual';
  speech_speed: number;
  voice_type: 'browser' | 'elevenlabs';
  elevenlabs_voice_id: string;
  save_history: boolean;
  accessibility_large_text: boolean;
  accessibility_reduced_motion: boolean;
  context_detection: boolean;
}

export interface Person {
  id: string;
  name: string;
  relationship: string;
  nickname?: string;
  communication_style: 'formal' | 'balanced' | 'casual';
  is_emergency_contact: boolean;
  phone?: string;
  email?: string;
  notes?: string;
  times_interacted: number;
  last_interaction?: string;
}

export interface Location {
  id: string;
  name: string;
  location_type: string;
  room_type?: string;
  is_default: boolean;
  times_used: number;
}

export interface QuickAction {
  id: string;
  phrase: string;
  button_position: number;
  icon_name: string;
  button_color: string;
  times_used: number;
}

export const useEchoVoice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [suggestions, setSuggestions] = useState<PhraseSuggestion[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [currentPerson, setCurrentPerson] = useState<Person | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    communication_style: 'balanced',
    speech_speed: 1.0,
    voice_type: 'browser',
    elevenlabs_voice_id: 'Aria',
    save_history: true,
    accessibility_large_text: false,
    accessibility_reduced_motion: false,
    context_detection: true,
  });
  const { toast } = useToast();

  // Load initial data
  const loadInitialData = useCallback(async (userId: string) => {
    console.log('loadInitialData called with userId:', userId);
    try {
      if (!userId) {
        console.log('No userId provided, returning');
        return;
      }

      // Load settings
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsData) {
        setSettings({
          communication_style: settingsData.communication_style as 'formal' | 'balanced' | 'casual',
          speech_speed: settingsData.speech_speed,
          voice_type: settingsData.voice_type as 'browser' | 'elevenlabs',
          elevenlabs_voice_id: settingsData.elevenlabs_voice_id,
          save_history: settingsData.save_history,
          accessibility_large_text: settingsData.accessibility_large_text,
          accessibility_reduced_motion: settingsData.accessibility_reduced_motion,
          context_detection: settingsData.context_detection,
        });
      }

      // Load people
      const { data: peopleData } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', userId)
        .order('times_interacted', { ascending: false });

      if (peopleData) {
        const typedPeopleData = peopleData.map(p => ({
          ...p,
          communication_style: p.communication_style as 'formal' | 'balanced' | 'casual'
        }));
        setPeople(typedPeopleData);
      }

      // Load locations
      const { data: locationsData } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', userId)
        .order('times_used', { ascending: false });

      if (locationsData) {
        setLocations(locationsData);
        const defaultLocation = locationsData.find(l => l.is_default);
        if (defaultLocation) setCurrentLocation(defaultLocation);
      }

      // Load quick actions
      const { data: actionsData } = await supabase
        .from('quick_actions')
        .select('*')
        .eq('user_id', userId)
        .order('button_position');

      if (actionsData) setQuickActions(actionsData);

    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }, []);

  const generateSuggestions = useCallback(async (context: PhraseContext) => {
    if (!settings.context_detection) return;
    
    setIsLoading(true);
    try {
      console.log('Generating suggestions with context:', context);
      
      const { data, error } = await supabase.functions.invoke('generate-phrase-suggestions', {
        body: { context: { ...context, style: settings.communication_style } }
      });

      console.log('Suggestion response:', { data, error });

      if (error) throw error;
      
      const suggestions = data?.suggestions || [];
      console.log('Setting suggestions:', suggestions);
      setSuggestions(suggestions);
      
      if (suggestions.length === 0) {
        toast({
          title: "No Suggestions",
          description: "No suggestions generated for current context",
        });
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Suggestion Error",
        description: "Could not generate phrase suggestions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [settings.communication_style, settings.context_detection, toast]);

  const speakPhrase = useCallback(async (text: string, phraseType: string = 'custom') => {
    if (isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      if (settings.voice_type === 'elevenlabs') {
        // Use ElevenLabs TTS
        const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
          body: { 
            text, 
            voiceId: settings.elevenlabs_voice_id,
            speed: settings.speech_speed 
          }
        });

        if (error) throw error;

        const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
        audio.playbackRate = settings.speech_speed;
        await audio.play();
        audio.addEventListener('ended', () => setIsSpeaking(false));
      } else {
        // Use browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = settings.speech_speed;
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }

      // Save analytics if enabled
      if (settings.save_history) {
        await saveAnalytics(text, phraseType);
      }
    } catch (error) {
      console.error('Error speaking phrase:', error);
      setIsSpeaking(false);
      toast({
        title: "Speech Error",
        description: "Could not play the phrase",
        variant: "destructive",
      });
    }
  }, [settings, isSpeaking, toast]);

  const saveAnalytics = useCallback(async (phrase: string, phraseType: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const now = new Date();
      const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';

      // Save to phrase_analytics for detailed analytics
      const { error: analyticsError } = await supabase
        .from('phrase_analytics')
        .insert({
          user_id: user.user.id,
          phrase_text: phrase,
          person_id: currentPerson?.id,
          location_id: currentLocation?.id,
          time_of_day: timeOfDay,
          day_of_week: now.getDay(),
          context_tags: [phraseType],
        });

      if (analyticsError) throw analyticsError;

      // Save to communication_history for history display
      const { error: historyError } = await supabase
        .from('communication_history')
        .insert({
          user_id: user.user.id,
          phrase: phrase,
          phrase_type: phraseType,
          context_location: currentLocation?.name,
          context_person: currentPerson?.name,
          context_time: timeOfDay,
          times_used: 1,
        });

      if (historyError) throw historyError;

      // Update usage counts
      if (currentPerson) {
        await supabase
          .from('people')
          .update({ 
            times_interacted: currentPerson.times_interacted + 1,
            last_interaction: now.toISOString()
          })
          .eq('id', currentPerson.id);
      }

      if (currentLocation) {
        await supabase
          .from('locations')
          .update({ times_used: currentLocation.times_used + 1 })
          .eq('id', currentLocation.id);
      }
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }, [currentPerson, currentLocation]);

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.user.id,
          ...updatedSettings,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Settings Error",
        description: "Could not save settings",
        variant: "destructive",
      });
    }
  }, [settings, toast]);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Person management
  const addPerson = useCallback(async (personData: Omit<Person, 'id'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('people')
        .insert({ ...personData, user_id: user.user.id })
        .select()
        .single();

      if (error) throw error;
      const typedData = {
        ...data,
        communication_style: data.communication_style as 'formal' | 'balanced' | 'casual'
      };
      setPeople(prev => [...prev, typedData]);
      return data;
    } catch (error) {
      console.error('Error adding person:', error);
      toast({
        title: "Error",
        description: "Could not add person",
        variant: "destructive",
      });
    }
  }, [toast]);

  const updatePerson = useCallback(async (personId: string, updates: Partial<Person>) => {
    try {
      const { error } = await supabase
        .from('people')
        .update(updates)
        .eq('id', personId);

      if (error) throw error;
      
      setPeople(prev => prev.map(p => p.id === personId ? { ...p, ...updates } : p));
      
      if (currentPerson?.id === personId) {
        setCurrentPerson(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Error updating person:', error);
      toast({
        title: "Error",
        description: "Could not update person",
        variant: "destructive",
      });
    }
  }, [currentPerson, toast]);

  // Location management
  const refreshLocations = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: locationsData } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', user.user.id)
        .order('times_used', { ascending: false });

      if (locationsData) {
        setLocations(locationsData);
        const defaultLocation = locationsData.find(l => l.is_default);
        if (defaultLocation && !currentLocation) {
          setCurrentLocation(defaultLocation);
        }
      }
    } catch (error) {
      console.error('Error refreshing locations:', error);
    }
  }, [currentLocation]);

  return {
    // State
    isLoading,
    isSpeaking,
    suggestions,
    settings,
    people,
    locations,
    quickActions,
    currentPerson,
    currentLocation,
    
    // Actions
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
  };
};