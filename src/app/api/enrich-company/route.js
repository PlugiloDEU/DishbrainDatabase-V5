import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { company, options } = await request.json();

    // Initialize enriched data object
    let enrichedData = {};

    // Create a model instance
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Build the prompt based on selected options
    let prompt = `Find information about the company ${company.name}. `;
    
    if (options.companyInfo) {
      prompt += "Include general company information like founding year, size, industry focus, and company type. ";
    }
    if (options.socialMedia) {
      prompt += "Find their LinkedIn, Twitter, Facebook, and other social media profiles. ";
    }
    if (options.technologies) {
      prompt += "List their AI technologies, focus areas, and technical capabilities. ";
    }
    if (options.products) {
      prompt += "Detail their main products and services, especially AI-related offerings. ";
    }
    if (options.financials) {
      prompt += "Include any public financial information, funding rounds, and market position. ";
    }

    prompt += "Format the response as JSON with appropriate fields.";

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Parse the JSON response
      const aiData = JSON.parse(text);
      
      // Merge the AI-generated data with existing data
      enrichedData = {
        ...enrichedData,
        ...aiData,
        ai_enriched: true,
        ai_enriched_date: new Date().toISOString()
      };

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // If JSON parsing fails, still return structured data
      enrichedData = {
        ai_raw_response: text,
        ai_enriched: true,
        ai_enriched_date: new Date().toISOString(),
        ai_parse_error: true
      };
    }

    return NextResponse.json(enrichedData);

  } catch (error) {
    console.error('Error enriching company data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to enrich company data',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 