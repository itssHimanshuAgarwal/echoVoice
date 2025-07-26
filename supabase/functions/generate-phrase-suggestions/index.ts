import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateAIPhrases(context: any) {
  const { timeOfDay, location, person, style } = context;
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
  
  console.log('Starting AI phrase generation with context:', context);
  
  if (!apiKey) {
    console.error('Google AI API key not found - falling back to basic suggestions');
    return getFallbackSuggestions(context);
  }

  const currentHour = new Date().getHours();
  const timeContext = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
  
  const prompt = `You are an AI assistant helping someone with communication challenges create contextual phrases for their specific situation.

CONTEXT:
- Time: ${timeContext} (${currentHour}:00)
- Location: ${location || 'unspecified location'}
- Person present: ${person || 'no specific person'}
- Communication style: ${style || 'casual'}

Generate 4 highly specific and contextual phrase suggestions that would be most useful for this exact scenario. Consider:

FOR KITCHEN context: hunger, thirst, cooking help, meal preferences, dietary needs
FOR BEDROOM context: sleep, dressing, comfort, rest, personal care
FOR BATHROOM context: privacy, assistance needs, hygiene, accessibility
FOR LIVING ROOM context: social interaction, entertainment, comfort, visitors
FOR MEDICAL context: pain levels, medication, symptoms, appointments

FOR MORNING (6-11am): morning routines, breakfast, daily planning, energy levels
FOR AFTERNOON (12-5pm): lunch, activities, energy maintenance, social time  
FOR EVENING (6-11pm): dinner, relaxation, end-of-day routines, reflection

WHEN PERSON IS PRESENT: direct communication, specific requests, social phrases
WHEN ALONE: self-advocacy, calling for help, expressing needs clearly

Requirements:
- Each phrase must be 3-8 words maximum
- Must be immediately actionable or expressively useful
- Vary emotional tone (urgent/calm/polite/direct)
- Consider accessibility and dignity
- Make them sound natural, not robotic

Return ONLY this JSON format:
[
  {"phrase": "[highly specific contextual phrase]", "priority": "high", "category": "needs"},
  {"phrase": "[another specific phrase]", "priority": "medium", "category": "assistance"},
  {"phrase": "[context-aware phrase]", "priority": "high", "category": "social"},
  {"phrase": "[situational phrase]", "priority": "medium", "category": "gratitude"}
]`;

  try {
    console.log('Calling Google AI with enhanced prompt');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 800,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    console.log('Google AI response received:', data);
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from Google AI');
    }

    // Parse the JSON response
    const cleanText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
    const suggestions = JSON.parse(cleanText);
    
    console.log('Successfully generated AI suggestions:', suggestions);
    return suggestions;
    
  } catch (error) {
    console.error('Error calling Google AI:', error);
    console.log('Falling back to enhanced contextual suggestions');
    return getFallbackSuggestions(context);
  }
}

function getFallbackSuggestions(context: any) {
  const { location, person, style } = context;
  const currentHour = new Date().getHours();
  const timeContext = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
  
  // Enhanced contextual fallback based on location and time
  const suggestions = [];
  
  if (location?.toLowerCase() === 'kitchen') {
    if (currentHour < 12) {
      suggestions.push({ phrase: "I need breakfast please", priority: "high", category: "needs" });
      suggestions.push({ phrase: "Coffee would be great", priority: "medium", category: "needs" });
    } else if (currentHour < 17) {
      suggestions.push({ phrase: "I'm hungry for lunch", priority: "high", category: "needs" });
      suggestions.push({ phrase: "Something to drink please", priority: "medium", category: "needs" });
    } else {
      suggestions.push({ phrase: "What's for dinner?", priority: "high", category: "needs" });
      suggestions.push({ phrase: "I'm quite thirsty", priority: "medium", category: "needs" });
    }
  } else if (location?.toLowerCase() === 'bedroom') {
    suggestions.push({ phrase: "Help me get dressed", priority: "high", category: "assistance" });
    suggestions.push({ phrase: "I need to rest", priority: "medium", category: "needs" });
  } else if (location?.toLowerCase() === 'bathroom') {
    suggestions.push({ phrase: "I need privacy please", priority: "high", category: "privacy" });
    suggestions.push({ phrase: "Please wait outside", priority: "medium", category: "privacy" });
  } else {
    suggestions.push({ phrase: "I need some help", priority: "high", category: "assistance" });
    suggestions.push({ phrase: `Good ${timeContext}`, priority: "medium", category: "greeting" });
  }
  
  if (person) {
    suggestions.push({ phrase: `Thank you ${person}`, priority: "medium", category: "gratitude" });
  } else {
    suggestions.push({ phrase: "Thank you so much", priority: "medium", category: "gratitude" });
  }
  
  suggestions.push({ phrase: "I appreciate your help", priority: "low", category: "gratitude" });
  
  return suggestions.slice(0, 4);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context } = await req.json();
    console.log('Received request for phrase suggestions with context:', context);
    
    const suggestions = await generateAIPhrases(context);
    
    console.log('Returning suggestions:', suggestions);
    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in phrase suggestions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});