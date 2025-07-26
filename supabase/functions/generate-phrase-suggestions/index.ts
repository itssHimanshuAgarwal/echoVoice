import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple phrase suggestions based on context (free alternative to GPT)
function generateContextualPhrases(context: any) {
  const { timeOfDay, location, person, style, recentHistory } = context;
  
  const suggestions = [];
  
  // Time-based suggestions
  const hour = new Date().getHours();
  if (hour < 12) {
    suggestions.push({ phrase: "Good morning", priority: "medium", category: "greeting" });
    suggestions.push({ phrase: "I need help getting ready", priority: "high", category: "assistance" });
  } else if (hour < 17) {
    suggestions.push({ phrase: "Good afternoon", priority: "medium", category: "greeting" });
    suggestions.push({ phrase: "I would like lunch", priority: "high", category: "needs" });
  } else {
    suggestions.push({ phrase: "Good evening", priority: "medium", category: "greeting" });
    suggestions.push({ phrase: "I'm ready for dinner", priority: "high", category: "needs" });
  }
  
  // Person-based suggestions
  if (person) {
    suggestions.push({ phrase: `Hello ${person}`, priority: "high", category: "greeting" });
    suggestions.push({ phrase: "Thank you for helping me", priority: "medium", category: "gratitude" });
    suggestions.push({ phrase: "Can you help me please?", priority: "high", category: "assistance" });
  }
  
  // Location-based suggestions
  switch (location?.toLowerCase()) {
    case 'kitchen':
      suggestions.push({ phrase: "I need something to drink", priority: "high", category: "needs" });
      suggestions.push({ phrase: "I'm hungry", priority: "high", category: "needs" });
      break;
    case 'bedroom':
      suggestions.push({ phrase: "I need help getting dressed", priority: "high", category: "assistance" });
      suggestions.push({ phrase: "I want to rest", priority: "medium", category: "needs" });
      break;
    case 'bathroom':
      suggestions.push({ phrase: "I need assistance", priority: "high", category: "assistance" });
      suggestions.push({ phrase: "Please wait outside", priority: "medium", category: "privacy" });
      break;
    default:
      suggestions.push({ phrase: "I need help", priority: "high", category: "assistance" });
  }
  
  // Style adjustments
  if (style === 'formal') {
    return suggestions.map(s => ({
      ...s,
      phrase: s.phrase.replace("I need", "I would appreciate assistance with")
        .replace("Can you help", "Could you please assist")
    }));
  } else if (style === 'casual') {
    return suggestions.map(s => ({
      ...s,
      phrase: s.phrase.replace("I would like", "I want")
        .replace("Could you please", "Can you")
    }));
  }
  
  return suggestions.slice(0, 4); // Return top 4 suggestions
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context } = await req.json();
    
    const suggestions = generateContextualPhrases(context);
    
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