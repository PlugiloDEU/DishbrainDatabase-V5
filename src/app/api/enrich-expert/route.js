import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { expert, options, customPrompt } = await request.json();

    let prompt;
    if (options.customPrompt && customPrompt) {
      // Use custom prompt but ensure it includes the expert's basic info
      prompt = `Analyze this expert: ${expert.name}
Current Role: ${expert.position || 'Unknown'}
Institution: ${expert.institution || 'Unknown'}

Custom Analysis Request:
${customPrompt}

Please format the response as JSON.`;
    } else {
      // Use default structured prompt
      prompt = `Analyze this expert's information and enrich it with additional details focusing on their AI expertise:
Name: ${expert.name}
Current Role: ${expert.position || 'Unknown'}
Institution: ${expert.institution || 'Unknown'}

Please provide:
${options.academicBackground ? '- Academic background and education history' : ''}
${options.researchAreas ? '- Specific AI research areas and contributions' : ''}
${options.publications ? '- Notable publications and research impact' : ''}
${options.expertise ? '- Technical expertise and AI specializations' : ''}
${options.projects ? '- Key AI projects and achievements' : ''}

Format the response as JSON with these fields:
{
  "academic_background": [],
  "research_areas": [],
  "publications": [],
  "expertise": [],
  "projects": [],
  "h_index": number,
  "citations": number
}`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    try {
      const enrichedData = JSON.parse(text);
      return NextResponse.json(enrichedData);
    } catch (parseError) {
      // If JSON parsing fails, return raw text with error flag
      return NextResponse.json({
        raw_response: text,
        parsing_error: true,
        message: 'AI response could not be parsed as JSON'
      });
    }

  } catch (error) {
    console.error('Error enriching expert data:', error);
    return NextResponse.json(
      { error: 'Failed to enrich expert data', message: error.message },
      { status: 500 }
    );
  }
}

// Helper functions to interact with Gemini API
// You'll need to implement these based on your Gemini API setup
async function searchPublications(name, company) {
  // Implement Gemini API call for publications
}

async function findSocialProfiles(name, company) {
  // Implement Gemini API call for social profiles
}

async function getCompanyDetails(company) {
  // Implement Gemini API call for company info
}

async function findExpertise(name, company) {
  // Implement Gemini API call for expertise
}

async function findAwards(name) {
  // Implement Gemini API call for awards
} 