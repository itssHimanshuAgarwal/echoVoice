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

  // Create an empathetic, context-aware prompt with tone settings
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

${toneModifier ? `TONE REQUIREMENTS: ${toneModifier}` : ''}

Return ONLY this JSON format:
[
  {"phrase": "[emotionally appropriate phrase]", "priority": "high", "category": "emotion"},
  {"phrase": "[contextual phrase]", "priority": "medium", "category": "social"},
  {"phrase": "[supportive phrase]", "priority": "high", "category": "needs"},
  {"phrase": "[caring phrase]", "priority": "medium", "category": "gratitude"}
]

Requirements:
- Each phrase must be 3-12 words maximum
- Emotionally appropriate for feeling ${currentEmotion || 'neutral'}
- Relevant to the current time and location context
- Helpful for expressing needs or emotions
- Keep them natural and supportive
${toneModifier ? `- Follow the tone requirements: ${toneModifier}` : ''}`;

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
  const { currentLocation, nearbyPerson, currentEmotion } = context;
  const currentHour = new Date().getHours();
  const timeContext = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
  
  // Enhanced contextual fallback based on emotion and location
  const suggestions = [];
  
  // Emotion-based suggestions
  if (currentEmotion === 'sad') {
    suggestions.push({ phrase: "I'm feeling sad right now", priority: "high", category: "emotion" });
    suggestions.push({ phrase: "I could use some comfort", priority: "high", category: "needs" });
  } else if (currentEmotion === 'happy') {
    suggestions.push({ phrase: "I'm feeling really good today", priority: "high", category: "emotion" });
    suggestions.push({ phrase: "Thank you for being here", priority: "medium", category: "gratitude" });
  } else if (currentEmotion === 'tired') {
    suggestions.push({ phrase: "I'm feeling quite tired", priority: "high", category: "emotion" });
    suggestions.push({ phrase: "I need to rest", priority: "high", category: "needs" });
  } else {
    suggestions.push({ phrase: "I'm doing okay", priority: "medium", category: "emotion" });
    suggestions.push({ phrase: "How are you doing?", priority: "medium", category: "social" });
  }
  
  // Location-based suggestions
  if (currentLocation?.toLowerCase().includes('kitchen')) {
    if (currentHour < 12) {
      suggestions.push({ phrase: "I need breakfast please", priority: "high", category: "needs" });
    } else if (currentHour < 17) {
      suggestions.push({ phrase: "I'm hungry for lunch", priority: "high", category: "needs" });
    } else {
      suggestions.push({ phrase: "What's for dinner?", priority: "high", category: "needs" });
    }
  } else if (currentLocation?.toLowerCase().includes('bedroom')) {
    suggestions.push({ phrase: "I need to rest", priority: "medium", category: "needs" });
  } else {
    suggestions.push({ phrase: `Good ${timeContext}`, priority: "medium", category: "social" });
  }
  
  // Person-specific suggestions
  if (nearbyPerson) {
    suggestions.push({ phrase: `Thank you ${nearbyPerson}`, priority: "medium", category: "gratitude" });
  } else {
    suggestions.push({ phrase: "Thank you so much", priority: "medium", category: "gratitude" });
  }
  
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