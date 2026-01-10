import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, slidesCount, studentName, subjectName } = await req.json();

    if (!topic || !slidesCount) {
      return new Response(
        JSON.stringify({ error: 'Topic and slides count are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert in creating professional academic presentations in English.
Your task is to create detailed, well-structured presentation content.

You MUST respond with JSON only, no additional text, using this exact structure:
{
  "title": "Presentation Title",
  "slides": [
    {
      "title": "Slide Title",
      "points": ["Point 1", "Point 2", "Point 3", "Point 4"]
    }
  ]
}

Important rules:
- The main title should be clear, professional, and engaging
- Each slide MUST have 4-6 detailed bullet points
- Points should be informative, educational, and well-researched
- Use professional academic English language
- Include relevant facts, statistics, and examples where appropriate
- Make content comprehensive and valuable for academic audiences
- Structure content logically with clear progression of ideas`;

    const userPrompt = `Create a professional academic presentation about the following topic:
Topic: ${topic}
Required slides: ${slidesCount} slides (excluding title and thank you slides)
Subject: ${subjectName || 'General'}
Presented by: ${studentName || 'Student Team'}

Important: Do NOT include a title slide or thank you slide in your response - I will add them automatically.
Focus on creating ${slidesCount} content slides with comprehensive, well-researched information.
Each slide should have 4-6 bullet points with valuable academic content.`;

    console.log('Calling Google Gemini API for presentation generation...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!contentText) {
      throw new Error('No content received from AI');
    }

    console.log('Raw AI response:', contentText);

    // Parse JSON from the response
    let presentationContent;
    try {
      // Try to extract JSON from the response
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        presentationContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse presentation content');
    }

    console.log('Presentation generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        content: presentationContent,
        studentName,
        topic
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in generate-presentation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while generating the presentation';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
