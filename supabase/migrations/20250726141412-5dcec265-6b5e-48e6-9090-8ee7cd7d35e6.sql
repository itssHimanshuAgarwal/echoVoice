-- Create tables for EchoVoice functionality

-- User settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  communication_style TEXT DEFAULT 'balanced' CHECK (communication_style IN ('formal', 'balanced', 'casual')),
  speech_speed REAL DEFAULT 1.0 CHECK (speech_speed >= 0.5 AND speech_speed <= 2.0),
  voice_type TEXT DEFAULT 'browser' CHECK (voice_type IN ('browser', 'elevenlabs')),
  elevenlabs_voice_id TEXT DEFAULT 'Aria',
  save_history BOOLEAN DEFAULT true,
  accessibility_large_text BOOLEAN DEFAULT false,
  accessibility_reduced_motion BOOLEAN DEFAULT false,
  context_detection BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Communication history table
CREATE TABLE public.communication_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phrase TEXT NOT NULL,
  phrase_type TEXT DEFAULT 'custom' CHECK (phrase_type IN ('quick_action', 'ai_suggested', 'custom', 'emergency')),
  context_time TEXT,
  context_location TEXT,
  context_person TEXT,
  priority_level TEXT CHECK (priority_level IN ('high', 'medium', 'low')),
  times_used INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Favorite phrases table
CREATE TABLE public.favorite_phrases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phrase TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  custom_created BOOLEAN DEFAULT false,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Emergency contacts table
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can view their own settings" 
ON public.user_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
ON public.user_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for communication_history
CREATE POLICY "Users can view their own history" 
ON public.communication_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own history" 
ON public.communication_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for favorite_phrases
CREATE POLICY "Users can view their own phrases" 
ON public.favorite_phrases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own phrases" 
ON public.favorite_phrases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phrases" 
ON public.favorite_phrases 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phrases" 
ON public.favorite_phrases 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for emergency_contacts
CREATE POLICY "Users can view their own contacts" 
ON public.emergency_contacts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts" 
ON public.emergency_contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
ON public.emergency_contacts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
ON public.emergency_contacts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_favorite_phrases_updated_at
  BEFORE UPDATE ON public.favorite_phrases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();