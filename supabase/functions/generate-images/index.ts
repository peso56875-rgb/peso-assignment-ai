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
    const { topic, count = 3 } = await req.json();

    console.log('Searching images for topic:', topic);
    console.log('Image count:', count);

    const images: string[] = [];
    
    // Search for images using Unsplash API (free, no API key needed for demo)
    const searchQueries = [
      topic,
      `${topic} education`,
      `${topic} concept`,
      `${topic} illustration`
    ];

    for (let i = 0; i < Math.min(count, 4); i++) {
      try {
        console.log(`Searching image ${i + 1}/${count}`);
        
        const query = encodeURIComponent(searchQueries[i] || topic);
        
        // Use Unsplash Source API for random images based on search query
        // This generates a direct image URL without needing an API key
        const imageUrl = `https://source.unsplash.com/800x600/?${query}&sig=${Date.now()}-${i}`;
        
        // Verify the image exists by making a HEAD request
        const checkResponse = await fetch(imageUrl, { method: 'HEAD' });
        
        if (checkResponse.ok) {
          // Get the final redirected URL
          const finalUrl = checkResponse.url;
          images.push(finalUrl);
          console.log(`Image ${i + 1} found successfully:`, finalUrl);
        } else {
          // Fallback to a generic educational image
          const fallbackUrl = `https://source.unsplash.com/800x600/?education,study&sig=${Date.now()}-${i}`;
          images.push(fallbackUrl);
          console.log(`Using fallback image ${i + 1}`);
        }
      } catch (imageError) {
        console.error(`Error searching image ${i + 1}:`, imageError);
        // Add a fallback image
        const fallbackUrl = `https://source.unsplash.com/800x600/?academic,learning&sig=${Date.now()}-${i}`;
        images.push(fallbackUrl);
      }
    }

    console.log(`Found ${images.length} images total`);

    return new Response(JSON.stringify({ images }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error searching images:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to search images',
      images: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});