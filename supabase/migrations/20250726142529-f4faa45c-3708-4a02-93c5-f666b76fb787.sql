-- Add more tables for full EchoVoice functionality

-- Extend favorite_phrases for better organization
ALTER TABLE public.favorite_phrases ADD COLUMN IF NOT EXISTS priority_order INTEGER DEFAULT 0;
ALTER TABLE public.favorite_phrases ADD COLUMN IF NOT EXISTS is_quick_action BOOLEAN DEFAULT false;

-- People/contacts management (for context-aware suggestions)
CREATE TABLE public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL, -- 'family', 'caregiver', 'friend', 'doctor', 'nurse'
  nickname TEXT,
  communication_style TEXT DEFAULT 'balanced' CHECK (communication_style IN ('formal', 'balanced', 'casual')),
  is_emergency_contact BOOLEAN DEFAULT false,
  phone TEXT,
  email TEXT,
  notes TEXT,
  times_interacted INTEGER DEFAULT 0,
  last_interaction TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Locations management
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  location_type TEXT NOT NULL, -- 'home', 'hospital', 'outdoor', 'vehicle'
  room_type TEXT, -- 'living_room', 'bedroom', 'kitchen', 'bathroom', 'garden'
  is_default BOOLEAN DEFAULT false,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Usage analytics for learning patterns
CREATE TABLE public.phrase_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phrase_id UUID, -- References favorite_phrases or null for non-saved phrases
  phrase_text TEXT NOT NULL,
  person_id UUID, -- References people table
  location_id UUID, -- References locations table
  time_of_day TEXT, -- 'morning', 'afternoon', 'evening', 'night'
  day_of_week INTEGER, -- 0-6 (Sunday to Saturday)
  success_rating INTEGER CHECK (success_rating >= 1 AND success_rating <= 5), -- User feedback
  context_tags TEXT[], -- ['urgent', 'routine', 'social', 'medical']
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quick action buttons customization
CREATE TABLE public.quick_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phrase TEXT NOT NULL,
  button_position INTEGER NOT NULL, -- 0-5 for 6 buttons
  icon_name TEXT DEFAULT 'volume-2', -- Lucide icon names
  button_color TEXT DEFAULT 'default', -- Color variant
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, button_position)
);

-- Enable RLS on new tables
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phrase_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies for people
CREATE POLICY "Users can manage their own people" ON public.people
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS policies for locations  
CREATE POLICY "Users can manage their own locations" ON public.locations
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS policies for phrase_analytics
CREATE POLICY "Users can manage their own analytics" ON public.phrase_analytics
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS policies for quick_actions
CREATE POLICY "Users can manage their own quick actions" ON public.quick_actions
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quick_actions_updated_at
  BEFORE UPDATE ON public.quick_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default locations
INSERT INTO public.locations (user_id, name, location_type, room_type, is_default) 
VALUES 
  (gen_random_uuid(), 'Living Room', 'home', 'living_room', true),
  (gen_random_uuid(), 'Bedroom', 'home', 'bedroom', false),
  (gen_random_uuid(), 'Kitchen', 'home', 'kitchen', false),
  (gen_random_uuid(), 'Bathroom', 'home', 'bathroom', false);

-- Insert default quick actions
INSERT INTO public.quick_actions (user_id, phrase, button_position, icon_name) 
VALUES 
  (gen_random_uuid(), 'Yes', 0, 'check'),
  (gen_random_uuid(), 'No', 1, 'x'),
  (gen_random_uuid(), 'Thank you', 2, 'heart'),
  (gen_random_uuid(), 'Help', 3, 'help-circle'),
  (gen_random_uuid(), 'Water', 4, 'droplets'),
  (gen_random_uuid(), 'Tired', 5, 'moon');