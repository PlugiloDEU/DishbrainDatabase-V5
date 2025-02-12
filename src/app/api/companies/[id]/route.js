import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const filePath = path.join(process.cwd(), 'src', 'data', 'companies', `${id.replace('comp_', '')}.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const companyData = JSON.parse(fileContent);

    return NextResponse.json(companyData);
  } catch (error) {
    console.error('Error loading company:', error);
    return NextResponse.json(
      { error: 'Failed to load company data' },
      { status: 500 }
    );
  }
} 