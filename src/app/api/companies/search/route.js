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

    const companiesDir = path.join(process.cwd(), 'src', 'data', 'companies');
    const files = await fs.readdir(companiesDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const companies = await Promise.all(
      jsonFiles.map(async file => {
        const content = await fs.readFile(path.join(companiesDir, file), 'utf8');
        return JSON.parse(content);
      })
    );

    const results = companies.filter(company => {
      const searchableText = [
        company.name,
        company.location,
        company.focus,
        company.industry
      ].filter(Boolean).join(' ').toLowerCase();

      return searchableText.includes(query);
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
} 