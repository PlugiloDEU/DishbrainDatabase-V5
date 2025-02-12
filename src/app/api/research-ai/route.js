import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google AI client
const genai = new GoogleGenerativeAI('AIzaSyAhGEXDhwupvDtU2jJyM04d8w_YEaXUV70');

export async function POST(request) {
  try {
    const { query, fields, currentData } = await request.json();

    const model = genai.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7, // Reduced for more focused results
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    // Create a more detailed prompt
    const prompt = `
      Act as an AI research assistant. Find detailed information about this expert:
      ${query}

      Current known information:
      ${JSON.stringify(currentData, null, 2)}

      Please find and verify information for these fields: ${fields.join(', ')}

      Requirements:
      1. Return only factual, verifiable information
      2. For images, provide direct URLs to profile pictures (must end in .jpg, .jpeg, .png, or .webp)
      3. Prefer official sources (LinkedIn, company websites, academic institutions)
      4. Format the response as field:value pairs, one per line
      5. If a field's information cannot be verified, omit it
      6. For URLs, provide complete URLs including https://

      Example format:
      name: Dr. Jane Smith
      position: Chief AI Researcher
      company: Tech Corp
      linkedin_url: https://linkedin.com/in/janesmith
      profile_image: https://example.com/profile.jpg
    `;

    console.log('Sending prompt:', prompt); // Debug log

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Raw AI response:', text); // Debug log

    // Parse and validate the response
    const structuredData = parseAIResponse(text);

    // Additional validation for image URLs
    if (structuredData.profile_image) {
      const imageUrl = structuredData.profile_image.trim();
      if (!imageUrl.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i)) {
        delete structuredData.profile_image;
      }
    }

    // Try to find image from LinkedIn if not found
    if (!structuredData.profile_image && structuredData.linkedin_url) {
      try {
        const imagePrompt = `
          Find the direct image URL from this LinkedIn profile: ${structuredData.linkedin_url}
          Requirements:
          1. Return ONLY the direct URL to the profile picture
          2. URL must end in .jpg, .jpeg, .png, or .webp
          3. No additional text or explanation
        `;
        
        const imageResult = await model.generateContent(imagePrompt);
        const imageResponse = await imageResult.response;
        const imageUrl = imageResponse.text().trim();
        
        if (imageUrl.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i)) {
          structuredData.profile_image = imageUrl;
        }
      } catch (imageError) {
        console.error('Error fetching profile image:', imageError);
      }
    }

    console.log('Structured data:', structuredData); // Debug log

    return NextResponse.json(structuredData);
  } catch (error) {
    console.error('Error in AI research:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform AI research' },
      { status: 500 }
    );
  }
}

function parseAIResponse(text) {
  const lines = text.split('\n');
  const data = {};
  
  lines.forEach(line => {
    const [key, ...values] = line.split(':').map(s => s.trim());
    if (key && values.length) {
      const value = values.join(':');
      // Clean up URLs (remove surrounding quotes if present)
      if (value.startsWith('"') && value.endsWith('"')) {
        data[key.toLowerCase()] = value.slice(1, -1);
      } else {
        data[key.toLowerCase()] = value;
      }
    }
  });
  
  return data;
} 