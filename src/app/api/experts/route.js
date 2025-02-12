import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// GET handler
export async function GET() {
  try {
    const expertsDir = path.join(process.cwd(), 'src', 'data', 'experts');
    
    // Create directory if it doesn't exist
    await fs.mkdir(expertsDir, { recursive: true });
    
    // Read all JSON files in the directory
    const files = await fs.readdir(expertsDir);
    const experts = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          try {
            const content = await fs.readFile(
              path.join(expertsDir, file),
              'utf8'
            );
            return JSON.parse(content);
          } catch (error) {
            console.error(`Error reading expert file ${file}:`, error);
            return null;
          }
        })
    );

    // Filter out any null values from failed reads
    const validExperts = experts.filter(expert => expert !== null);

    return NextResponse.json(validExperts);
  } catch (error) {
    console.error('Error reading experts:', error);
    return NextResponse.json(
      { error: 'Failed to read experts' },
      { status: 500 }
    );
  }
}

// PUT handler for updating experts
export async function PUT(request) {
  try {
    const expert = await request.json();
    
    if (!expert.id) {
      return NextResponse.json(
        { success: false, error: 'Expert ID is required' },
        { status: 400 }
      );
    }

    // Read existing expert data to preserve AI enrichment
    const filePath = path.join(process.cwd(), 'src', 'data', 'experts', `${expert.id}.json`);
    let existingExpert = {};
    try {
      const existingData = await fs.readFile(filePath, 'utf8');
      existingExpert = JSON.parse(existingData);
    } catch (error) {
      console.log('No existing expert data found');
    }

    // Merge the data, preserving AI enrichment and other fields
    const expertData = {
      ...expert,
      last_updated: new Date().toISOString(),
      ai_enrichment: expert.ai_enrichment || existingExpert.ai_enrichment, // Preserve AI enrichment
      personalInfo: {
        ...expert.personalInfo,
        imageUrl: expert.personalInfo?.imageUrl
      }
    };

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(expertData, null, 2), 'utf8');

    return NextResponse.json({ 
      success: true, 
      message: 'Expert updated successfully',
      expert: expertData
    });
  } catch (error) {
    console.error('Error updating expert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update expert data', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const expert = await request.json();
    
    // Validate the data - accept either single object or array
    const experts = Array.isArray(expert) ? expert : [expert];
    
    // Validate required fields
    for (const exp of experts) {
      if (!exp.id) {
        return NextResponse.json(
          { success: false, error: 'Expert ID is required' },
          { status: 400 }
        );
      }
      
      // Check if expert already exists
      const filePath = path.join(process.cwd(), 'src', 'data', 'experts', `${exp.id}.json`);
      try {
        await fs.access(filePath);
        return NextResponse.json(
          { success: false, error: `Expert with ID ${exp.id} already exists` },
          { status: 400 }
        );
      } catch (err) {
        // File doesn't exist, we can proceed
      }
    }

    // For each expert in the array
    for (const exp of experts) {
      const filePath = path.join(process.cwd(), 'src', 'data', 'experts', `${exp.id}.json`);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      const expertJson = JSON.stringify(exp, null, 2);
      await fs.writeFile(filePath, expertJson, 'utf8');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Expert(s) created successfully' 
    });

  } catch (error) {
    console.error('Error creating experts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create expert data' },
      { status: 500 }
    );
  }
}
