import { NextResponse } from 'next/server';
import { exportExpertsToCsv, exportCompaniesToCsv } from '@/utils/csvExporter';

export async function GET(request) {
  try {
    const expertsPath = await exportExpertsToCsv();
    const companiesPath = await exportCompaniesToCsv();
    
    return NextResponse.json({
      success: true,
      data: {
        experts_csv: expertsPath,
        companies_csv: companiesPath
      },
      message: 'CSV files generated successfully'
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate CSV files',
        details: error.message
      },
      { status: 500 }
    );
  }
} 