import { NextResponse } from 'next/server';

const TAVILY_API_KEY = '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';

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body || !body.expert) {
      throw new Error('No expert data provided');
    }

    const expert = body.expert;
    
    // Safely get expert info with fallbacks
    const expertName = expert.name || expert.fullName || '';
    const expertPosition = expert.position || expert.title || '';
    const expertOrg = expert.organisation || expert.organization || expert.company || '';

    // Construct search query from expert info
    const searchQuery = `${expertName} ${expertPosition} ${expertOrg}`.trim();
    
    if (!searchQuery) {
      throw new Error('Insufficient expert information for search');
    }

    // Call Tavily API
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': TAVILY_API_KEY
      },
      body: JSON.stringify({
        query: searchQuery,
        search_depth: "advanced",
        include_domains: ["linkedin.com", "github.com", "scholar.google.com", "researchgate.net"],
        max_results: 10
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Process results into a structured format
    const processedResults = {
      name: expertName,
      position: expertPosition,
      organisation: expertOrg,
      expertise: new Set(expert.expertise || []),
      sources: []
    };

    // Extract information from search results
    if (data.results && Array.isArray(data.results)) {
      data.results.forEach(result => {
        if (!result) return;

        processedResults.sources.push({
          url: result.url,
          title: result.title,
          type: 'tavily_search',
          date_accessed: new Date().toISOString(),
          verified: true
        });

        // Extract potential expertise from content
        if (result.content) {
          const content = result.content.toLowerCase();
          const expertiseKeywords = [
            'specialist in', 'expert in', 'focuses on', 
            'specializes in', 'research interests include'
          ];

          expertiseKeywords.forEach(keyword => {
            const index = content.indexOf(keyword);
            if (index !== -1) {
              const relevantText = content.slice(index + keyword.length, index + 100);
              const expertise = relevantText.split(/[.,;]/)[0].trim();
              if (expertise.length > 3) {
                processedResults.expertise.add(expertise);
              }
            }
          });
        }
      });
    }

    // Convert Set to Array for expertise
    processedResults.expertise = Array.from(processedResults.expertise);

    return NextResponse.json(processedResults);
  } catch (error) {
    console.error('Error in AI research:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to perform research',
      details: error.toString()
    }, { 
      status: 500 
    });
  }
} 