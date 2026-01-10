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
    const { content, questionCount, difficulty, questionType, subjectName } = await req.json();

    if (!content || !questionCount) {
      return new Response(
        JSON.stringify({ error: 'Content and question count are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    console.log('Generating exam questions...');
    console.log('Question count:', questionCount);
    console.log('Difficulty:', difficulty);
    console.log('Type:', questionType);

    const difficultyGuide: Record<string, string> = {
      easy: 'Create straightforward questions that test basic recall and understanding. Focus on definitions, simple concepts, and direct facts.',
      medium: 'Create questions that require understanding and application of concepts. Include some analysis and comparison questions.',
      hard: 'Create challenging questions that require critical thinking, analysis, synthesis, and evaluation. Include complex scenarios and multi-step reasoning.'
    };

    const typeGuide: Record<string, string> = {
      mcq: 'Multiple Choice Questions with 4 options (A, B, C, D). Only one correct answer per question.',
      truefalse: 'True/False questions with clear statements.',
      mix: 'A mix of Multiple Choice (60%) and True/False (40%) questions.'
    };

    const systemPrompt = `You are an expert exam creator for academic subjects. Your task is to generate high-quality exam questions based on provided content.

IMPORTANT RULES:
1. Generate exactly ${questionCount} questions
2. Difficulty level: ${String(difficulty).toUpperCase()} - ${difficultyGuide[difficulty as string] || difficultyGuide.medium}
3. Question type: ${String(questionType).toUpperCase()} - ${typeGuide[questionType as string] || typeGuide.mcq}
4. Each question must be clear, unambiguous, and academically rigorous
5. Provide the correct answer for each question
6. Provide a brief explanation for each answer

You MUST respond with JSON only, no additional text, using this exact structure:
{
  "questions": [
    {
      "id": 1,
      "type": "mcq" or "truefalse",
      "question": "The question text",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"] (for MCQ only, null for true/false),
      "correctAnswer": "A" or "True/False",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`;

    const userPrompt = `Based on the following content from the subject "${subjectName || 'General'}":

${content}

Generate ${questionCount} ${difficulty} ${questionType === 'mix' ? 'mixed type' : questionType} exam questions.

Make sure:
- Questions cover key concepts from the content
- Questions are varied and test different aspects
- Distractors (wrong options) are plausible but clearly incorrect
- Explanations are educational and helpful`;

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
    let examContent;
    try {
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        examContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse exam content');
    }

    console.log('Exam questions generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        questions: examContent.questions,
        metadata: {
          totalQuestions: questionCount,
          difficulty,
          questionType,
          subjectName
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in generate-exam:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while generating the exam';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
