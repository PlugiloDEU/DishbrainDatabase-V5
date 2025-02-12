import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Helper function to get the data file path
const getDataFilePath = () => {
  return path.join(process.cwd(), 'src', 'data', 'ai_firmen', 'firms.json');
};

// Helper function to validate required fields
const validateCompanyData = (data) => {
  const requiredFields = {
    name: 'string',
    website: 'string'
  };

  // Only validate the minimum required fields
  for (const [field, type] of Object.entries(requiredFields)) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
    if (typeof data[field] !== type) {
      throw new Error(`Invalid type for ${field}: expected ${type}`);
    }
  }

  return true;
};

// Helper function to fetch company logo
const fetchCompanyLogo = async (domain) => {
  if (!domain) return null;
  try {
    const response = await fetch(`https://logo.clearbit.com/${domain}`);
    if (response.ok) {
      return `https://logo.clearbit.com/${domain}`;
    }
    return null;
  } catch (e) {
    return null;
  }
};

// Helper function to extract domain from URL
const extractDomain = (url) => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch (e) {
    return null;
  }
};

// GET handler
export async function GET() {
  try {
    const companiesDir = path.join(process.cwd(), 'src', 'data', 'companies');
    
    // Create directory if it doesn't exist
    await fs.mkdir(companiesDir, { recursive: true });
    
    // Read all JSON files in the directory
    const files = await fs.readdir(companiesDir);
    const companies = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const content = await fs.readFile(
            path.join(companiesDir, file),
            'utf8'
          );
          return JSON.parse(content);
        })
    );

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error reading companies:', error);
    return NextResponse.json(
      { error: 'Failed to read companies' },
      { status: 500 }
    );
  }
}

// PUT handler for updating companies
export async function PUT(request) {
  try {
    const company = await request.json();
    
    if (!company.id) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Read existing company data to preserve any fields
    const filePath = path.join(process.cwd(), 'src', 'data', 'companies', `${company.id}.json`);
    let existingCompany = {};
    try {
      const existingData = await fs.readFile(filePath, 'utf8');
      existingCompany = JSON.parse(existingData);
    } catch (error) {
      console.log('No existing company data found');
    }

    // Merge the data, preserving AI enrichment and other fields
    const companyData = {
      ...existingCompany,
      ...company,
      last_updated: new Date().toISOString()
    };

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(companyData, null, 2), 'utf8');

    return NextResponse.json({ 
      success: true, 
      message: 'Company updated successfully',
      company: companyData
    });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update company data', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const company = await request.json();
    
    // Validate the data - accept either single object or array
    const companies = Array.isArray(company) ? company : [company];
    
    // Validate required fields and prepare data
    for (const comp of companies) {
      validateCompanyData(comp);

      // Extract domain from website
      const domain = extractDomain(comp.website);
      if (domain) {
        comp.domain = domain;
        // Try to fetch logo
        comp.logo_url = await fetchCompanyLogo(domain);
      }
    }

    // Save each company as individual JSON file
    const savedFiles = [];
    for (const comp of companies) {
      // Create the companies directory if it doesn't exist
      const companiesDir = path.join(process.cwd(), 'src', 'data', 'companies');
      await fs.mkdir(companiesDir, { recursive: true });

      // Generate filename from company name
      const fileName = `${comp.id}.json`;
      const filePath = path.join(companiesDir, fileName);

      // Add metadata
      const companyData = {
        ...comp,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        file_path: `src/data/companies/${fileName}`
      };

      // Save as formatted JSON
      await fs.writeFile(
        filePath, 
        JSON.stringify(companyData, null, 2),
        'utf8'
      );

      savedFiles.push(`src/data/companies/${fileName}`);
      console.log(`Saved company data to ${filePath}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Company data saved successfully',
      files: savedFiles
    });

  } catch (error) {
    console.error('Error saving company data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to save company data'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'src', 'data', 'companies', `${domain.replace(/\./g, '_')}.json`);

    try {
      await fs.unlink(filePath);
      return NextResponse.json({ 
        success: true,
        message: 'Company deleted successfully' 
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
      throw error;
    }

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
