import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const expertsDir = path.join(process.cwd(), 'src', 'data', 'experts');
    const files = await fs.readdir(expertsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const experts = await Promise.all(
      jsonFiles.map(async file => {
        const content = await fs.readFile(path.join(expertsDir, file), 'utf8');
        return JSON.parse(content);
      })
    );

    const results = experts.filter(expert => {
      const searchableText = [
        expert.name,
        expert.fullName,
        expert.organisation,
        expert.position,
        expert.standort
      ].filter(Boolean).join(' ').toLowerCase();

      return searchableText.includes(query);
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
} 