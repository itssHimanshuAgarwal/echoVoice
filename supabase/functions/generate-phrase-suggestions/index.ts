import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateAIPhrases(context: any) {
  const { timeOfDay, location, person, style } = context;
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
  
  if (!apiKey) {
    console.error('Google AI API key not found');
    return [];
  }

  const currentHour = new Date().getHours();
  const timeContext = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';
  
  const prompt = `You are an AI assistant helping someone with communication challenges. Generate 4 practical, empathetic phrase suggestions based on this context:

Time: ${timeContext}
Location: ${location || 'not specified'}
Person present: ${person || 'no one specific'}
Communication style: ${style || 'casual'}

Requirements:
- Keep phrases short and clear (max 10 words)
- Make them practical for someone who needs communication assistance
- Include appropriate greetings, needs, or requests
- Vary the priority levels (high, medium)
- Categorize as: greeting, needs, assistance, gratitude, or social

Return ONLY a JSON array with this exact format:
[
  {"phrase": "Good ${timeContext}", "priority": "medium", "category": "greeting"},
  {"phrase": "Can you help me please?", "priority": "high", "category": "assistance"},
  {"phrase": "I need assistance", "priority": "high", "category": "needs"},
  {"phrase": "Thank you", "priority": "medium", "category": "gratitude"}
]`;

  try {
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
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated');
    }

    // Parse the JSON response
    const cleanText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
    const suggestions = JSON.parse(cleanText);
    
    console.log('Generated AI suggestions:', suggestions);
    return suggestions;
    
  } catch (error) {
    console.error('Error calling Google AI:', error);
    // Fallback to basic suggestions if AI fails
    return [
      { phrase: "I need help", priority: "high", category: "assistance" },
      { phrase: "Thank you", priority: "medium", category: "gratitude" },
      { phrase: `Good ${timeContext}`, priority: "medium", category: "greeting" },
      { phrase: "Can you assist me?", priority: "high", category: "assistance" }
    ];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context } = await req.json();
    
    const suggestions = await generateAIPhrases(context);
    
    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating phrase suggestions:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});