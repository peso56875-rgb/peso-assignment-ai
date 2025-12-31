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
    const { topic, count = 2 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating images for topic:', topic);
    console.log('Image count:', count);

    const images: string[] = [];
    
    const imagePrompts = [
      `Professional infographic about ${topic}, modern design, clean layout, educational style, high quality, 16:9 aspect ratio`,
      `Academic illustration about ${topic}, scientific diagram style, professional colors, informative visuals`,
      `Conceptual visualization of ${topic}, modern professional design, educational poster style, clean aesthetics`
    ];

    for (let i = 0; i < Math.min(count, 3); i++) {
      try {
        console.log(`Generating image ${i + 1}/${count}`);
        
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [
              { 
                role: 'user', 
                content: imagePrompts[i] || imagePrompts[0]
              }
            ],
            modalities: ['image', 'text']
          }),
        });

        if (!response.ok) {
          console.error('Image generation failed:', response.status);
          continue;
        }

        const data = await response.json();
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (imageUrl) {
          images.push(imageUrl);
          console.log(`Image ${i + 1} generated successfully`);
        }
      } catch (imageError) {
        console.error(`Error generating image ${i + 1}:`, imageError);
      }
    }

    console.log(`Generated ${images.length} images total`);

    return new Response(JSON.stringify({ images }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating images:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate images',
      images: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});