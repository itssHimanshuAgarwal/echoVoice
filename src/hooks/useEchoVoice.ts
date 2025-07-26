import { useState, useCallback } from 'react';
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

export const useEchoVoice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [suggestions, setSuggestions] = useState<PhraseSuggestion[]>([]);
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

  const generateSuggestions = useCallback(async (context: PhraseContext) => {
    if (!settings.context_detection) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-phrase-suggestions', {
        body: { context: { ...context, style: settings.communication_style } }
      });

      if (error) throw error;
      setSuggestions(data.suggestions || []);
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

      // Save to history if enabled
      if (settings.save_history) {
        await saveToHistory(text, phraseType);
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

  const saveToHistory = useCallback(async (phrase: string, phraseType: string, context?: PhraseContext) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('communication_history')
        .insert({
          user_id: user.user.id,
          phrase,
          phrase_type: phraseType,
          context_time: context?.timeOfDay,
          context_location: context?.location,
          context_person: context?.person,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings({
          communication_style: data.communication_style as 'formal' | 'balanced' | 'casual',
          speech_speed: data.speech_speed,
          voice_type: data.voice_type as 'browser' | 'elevenlabs',
          elevenlabs_voice_id: data.elevenlabs_voice_id,
          save_history: data.save_history,
          accessibility_large_text: data.accessibility_large_text,
          accessibility_reduced_motion: data.accessibility_reduced_motion,
          context_detection: data.context_detection,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

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

  return {
    isLoading,
    isSpeaking,
    suggestions,
    settings,
    generateSuggestions,
    speakPhrase,
    loadSettings,
    updateSettings,
    stopSpeaking,
    saveToHistory,
  };
};