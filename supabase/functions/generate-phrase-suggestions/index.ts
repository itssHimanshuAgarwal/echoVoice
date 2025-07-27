import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateAIPhrases(context: any) {
  const { currentEmotion, currentTime, currentLocation, nearbyPerson, toneModifier } = context;
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
  
  console.log('Starting AI phrase generation with context:', context);
  
  if (!apiKey) {
    console.error('Google AI API key not found - falling back to basic suggestions');
    return getFallbackSuggestions(context);
  }

  // Get current day of week and enhanced time context
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  const hour = now.getHours();
  
  // Create the exact prompt format you specified
  let prompt = `You are an empathetic AI speech assistant. The user is currently feeling ${currentEmotion || 'neutral'}`;
  
  if (currentTime) {
    prompt += `, it is ${currentTime}`;
  }
  
  if (currentLocation) {
    prompt += ` in the ${currentLocation}`;
  }
  
  if (nearbyPerson) {
    prompt += `, and ${nearbyPerson} is nearby`;
  }
  
  prompt += `. Suggest 3–4 short, emotionally relevant phrases they might want to say. Keep them helpful, polite, and supportive.

Return ONLY this JSON format:
[
  {"phrase": "[emotionally appropriate phrase]", "priority": "high", "category": "emotion"},
  {"phrase": "[contextual phrase]", "priority": "medium", "category": "social"},
  {"phrase": "[supportive phrase]", "priority": "high", "category": "needs"},
  {"phrase": "[caring phrase]", "priority": "medium", "category": "care"}
]

Requirements:
- Each phrase must be 4-15 words maximum
- Emotionally appropriate for feeling ${currentEmotion || 'neutral'}
- Relevant to the current time and location context
- Helpful for expressing needs or emotions
- Make them natural and supportive, not generic
${toneModifier ? `- Follow tone: ${toneModifier}` : ''}`;

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

function getDetailedTimeContext(hour: number, dayOfWeek: string) {
  const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
  
  if (hour >= 5 && hour < 9) {
    return {
      period: 'early morning',
      suggestions: isWeekend ? 'Weekend morning relaxation time' : 'Weekday morning routine, getting ready'
    };
  } else if (hour >= 9 && hour < 12) {
    return {
      period: 'morning',
      suggestions: isWeekend ? 'Weekend morning activities' : 'Weekday morning work/appointments'
    };
  } else if (hour >= 12 && hour < 14) {
    return {
      period: 'lunch time',
      suggestions: 'Lunch time needs, midday energy'
    };
  } else if (hour >= 14 && hour < 17) {
    return {
      period: 'afternoon',
      suggestions: isWeekend ? 'Weekend afternoon activities' : 'Weekday afternoon tasks/meetings'
    };
  } else if (hour >= 17 && hour < 20) {
    return {
      period: 'evening',
      suggestions: 'Dinner time, winding down from day'
    };
  } else if (hour >= 20 && hour < 23) {
    return {
      period: 'night',
      suggestions: 'Relaxing evening, preparing for rest'
    };
  } else {
    return {
      period: 'late night',
      suggestions: 'Late night needs, rest time'
    };
  }
}

function getFallbackSuggestions(context: any) {
  const { currentLocation, nearbyPerson, currentEmotion, currentTime } = context;
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
  
  const suggestions = [];
  
  // Advanced emotion-based suggestions
  switch (currentEmotion) {
    case 'sad':
      suggestions.push({ phrase: "I'm feeling really down right now", priority: "high", category: "emotion" });
      suggestions.push({ phrase: "Could you stay with me for a while?", priority: "high", category: "needs" });
      suggestions.push({ phrase: "I need some emotional support", priority: "medium", category: "care" });
      break;
    case 'happy':
      suggestions.push({ phrase: "I'm feeling absolutely wonderful today!", priority: "high", category: "emotion" });
      suggestions.push({ phrase: "Let's do something fun together", priority: "medium", category: "social" });
      suggestions.push({ phrase: "Thank you for making me smile", priority: "medium", category: "care" });
      break;
    case 'angry':
      suggestions.push({ phrase: "I'm feeling frustrated and need space", priority: "high", category: "emotion" });
      suggestions.push({ phrase: "Please give me time to calm down", priority: "high", category: "needs" });
      suggestions.push({ phrase: "I need to talk through what's bothering me", priority: "medium", category: "care" });
      break;
    case 'fearful':
      suggestions.push({ phrase: "I'm feeling anxious and scared right now", priority: "high", category: "emotion" });
      suggestions.push({ phrase: "Please stay close, I need reassurance", priority: "high", category: "needs" });
      suggestions.push({ phrase: "Can you help me feel safe?", priority: "medium", category: "care" });
      break;
    case 'surprised':
      suggestions.push({ phrase: "That really caught me off guard!", priority: "high", category: "emotion" });
      suggestions.push({ phrase: "I need a moment to process this", priority: "medium", category: "needs" });
      suggestions.push({ phrase: "Can you explain what just happened?", priority: "medium", category: "social" });
      break;
    default: // neutral or other
      suggestions.push({ phrase: "I'm feeling steady and present", priority: "medium", category: "emotion" });
      suggestions.push({ phrase: "What should we focus on today?", priority: "medium", category: "social" });
      break;
  }
  
  // Advanced time and day-based suggestions
  if (hour >= 5 && hour < 9) {
    if (isWeekend) {
      suggestions.push({ phrase: "Let's take our time this morning", priority: "medium", category: "needs" });
    } else {
      suggestions.push({ phrase: "I need help getting ready for the day", priority: "high", category: "needs" });
    }
  } else if (hour >= 12 && hour < 14) {
    suggestions.push({ phrase: "I'm getting hungry for lunch", priority: "high", category: "needs" });
  } else if (hour >= 17 && hour < 20) {
    suggestions.push({ phrase: "I'm ready to wind down from today", priority: "medium", category: "care" });
  } else if (hour >= 20) {
    suggestions.push({ phrase: "I'm getting tired and need rest", priority: "high", category: "care" });
  }
  
  // Advanced location-based suggestions
  const locationLower = currentLocation?.toLowerCase() || '';
  if (locationLower.includes('kitchen')) {
    suggestions.push({ phrase: "I need help with meals today", priority: "high", category: "needs" });
  } else if (locationLower.includes('bedroom')) {
    suggestions.push({ phrase: "I need help getting comfortable", priority: "medium", category: "care" });
  } else if (locationLower.includes('bathroom')) {
    suggestions.push({ phrase: "I need assistance with personal care", priority: "high", category: "needs" });
  } else if (locationLower.includes('living')) {
    suggestions.push({ phrase: "Let's spend some quality time together", priority: "medium", category: "social" });
  }
  
  // Person-specific advanced suggestions
  if (nearbyPerson) {
    suggestions.push({ phrase: `${nearbyPerson}, I really appreciate you being here`, priority: "medium", category: "care" });
  }
  
  // Ensure we have 4 unique suggestions
  const uniqueSuggestions = Array.from(new Map(suggestions.map(s => [s.phrase, s])).values());
  while (uniqueSuggestions.length < 4) {
    uniqueSuggestions.push({ 
      phrase: "I'm grateful for your help and support", 
      priority: "medium", 
      category: "care" 
    });
  }
  
  return uniqueSuggestions.slice(0, 4);
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