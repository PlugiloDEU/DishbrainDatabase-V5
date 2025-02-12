import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize with environment variable or fallback
const ABSTRACT_API_KEY = process.env.ABSTRACT_API_KEY || 'cf26c3e1c1ff4e1caf4ba04c9d8b001b';
const ABSTRACT_API_URL = 'https://companyenrichment.abstractapi.com/v2/';

async function researchCompany(url, retries = 3) {
  try {
    // Extract domain from URL
    const domain = extractDomain(url);
    if (!domain) {
      throw new Error('Invalid URL format');
    }

    console.log('Researching company:', domain);

    // Make request with retries
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        const apiUrl = `${ABSTRACT_API_URL}?api_key=${ABSTRACT_API_KEY}&domain=${domain}`;
        console.log(`Attempt ${i + 1} - API URL:`, apiUrl);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          // Add timeout
          signal: AbortSignal.timeout(10000)
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error Response:', errorData);
          throw new Error(errorData.error?.message || errorData.message || `API error: ${response.status}`);
        }

        const company = await response.json();
        console.log('API Response:', company);

        if (!company || Object.keys(company).length === 0) {
          throw new Error('No company data found');
        }

        // Transform the data into our German format
        const transformedData = {
          unternehmensinformationen: {
            legal_name: company.company_name || 'Nicht verfügbar',
            unternehmenstyp: company.type || 'Nicht verfügbar',
            branche: company.industry || 'Nicht verfügbar',
            grundungsjahr: company.year_founded || 'Nicht verfügbar',
            mitarbeiter: {
              anzahl: company.employee_count || 'Nicht verfügbar',
              bereich: company.employee_range || 'Nicht verfügbar'
            },
            beschreibung: company.description || 'Nicht verfügbar',
            domain: company.domain || domain,
            logo: company.logo || 'Nicht verfügbar',
            borse: {
              ticker: company.ticker || 'Nicht verfügbar',
              exchange: company.exchange || 'Nicht verfügbar'
            }
          },
          standort: {
            adresse: company.street_address || 'Nicht verfügbar',
            stadt: company.city || 'Nicht verfügbar',
            bundesland: company.state || 'Nicht verfügbar',
            land: company.country || 'Nicht verfügbar',
            land_code: company.country_iso_code || 'Nicht verfügbar',
            plz: company.postal_code || 'Nicht verfügbar',
            koordinaten: {
              latitude: company.latitude || null,
              longitude: company.longitude || null
            }
          },
          kontakt: {
            telefon: company.phone_numbers?.[0] || 'Nicht verfügbar',
            email: company.email_addresses?.[0] || 'Nicht verfügbar',
            website: `https://${company.domain}` || 'Nicht verfügbar'
          },
          finanzen: {
            jahresumsatz: formatCurrency(company.annual_revenue) || 'Nicht verfügbar',
            umsatzbereich: company.revenue_range || 'Nicht verfügbar',
            globales_ranking: company.global_ranking || 'Nicht verfügbar'
          },
          branchen_codes: {
            sic_code: company.sic_code || 'Nicht verfügbar',
            naics_code: company.naics_code || 'Nicht verfügbar'
          },
          social_media: {
            linkedin: company.linkedin_url ? `https://${company.linkedin_url}` : 'Nicht verfügbar',
            facebook: company.facebook_url ? `https://${company.facebook_url}` : 'Nicht verfügbar',
            twitter: company.twitter_url ? `https://${company.twitter_url}` : 'Nicht verfügbar',
            instagram: company.instagram_url ? `https://${company.instagram_url}` : 'Nicht verfügbar',
            crunchbase: company.crunchbase_url ? `https://${company.crunchbase_url}` : 'Nicht verfügbar'
          },
          technologie_stack: {
            technologien: company.technologies || [],
            tags: company.tags || []
          }
        };

        console.log('Transformed data:', transformedData);
        return transformedData;

      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        lastError = error;
        
        if (i === retries - 1) {
          throw lastError;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }

  } catch (error) {
    console.error('Abstract API error:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to research company: ${error.message}`);
  }
}

async function saveCompanyData(companyData, originalData) {
  try {
    // Create a unique filename based on the domain
    const domain = companyData.unternehmensinformationen.domain.replace(/\./g, '_');
    const filePath = path.join(process.cwd(), 'src', 'data', 'companies', `${domain}.json`);

    // Calculate trust score before merging
    const trustScore = calculateProfileCompleteness(companyData);

    // Merge original data with enriched data
    const mergedData = {
      ...originalData,
      ...companyData, // Keep the entire enriched data structure
      metadaten: {
        letzte_aktualisierung: new Date().toISOString(),
        datenquellen: [
          {
            name: "Abstract API",
            typ: "unternehmensrecherche",
            zeitstempel: new Date().toISOString()
          }
        ],
        vertrauenswert: trustScore
      }
    };

    // Ensure the companies directory exists
    const dirPath = path.join(process.cwd(), 'src', 'data', 'companies');
    await fs.mkdir(dirPath, { recursive: true });

    // Write the merged data to file
    await fs.writeFile(filePath, JSON.stringify(mergedData, null, 2));
    console.log('Saved company data to:', filePath);

    return mergedData;
  } catch (error) {
    console.error('Error saving company data:', error);
    console.error('Error details:', error.stack);
    throw new Error(`Failed to save company data: ${error.message}`);
  }
}

export async function POST(request) {
  try {
    const { currentData } = await request.json();
    if (!currentData?.url) {
      return NextResponse.json(
        { error: 'Company URL is required' },
        { status: 400 }
      );
    }

    try {
      const companyData = await researchCompany(currentData.url);
      const savedData = await saveCompanyData(companyData, currentData);
      
      return NextResponse.json({
        success: true,
        data: savedData,
        message: 'Company data enriched and saved successfully'
      });

    } catch (error) {
      console.error('Research error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to research company',
          details: error.message
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json(
      { 
        error: 'Invalid request',
        details: error.message
      },
      { status: 400 }
    );
  }
}

// Helper function to extract domain from URL
function extractDomain(url) {
  try {
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];
  } catch (error) {
    return null;
  }
}

function formatCurrency(value) {
  if (!value) return null;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Helper function to calculate profile completeness
function calculateProfileCompleteness(data) {
  const requiredFields = [
    ['unternehmensinformationen', 'unternehmenstyp'],
    ['unternehmensinformationen', 'mitarbeiter', 'anzahl'],
    ['unternehmensinformationen', 'branche'],
    ['standort', 'adresse'],
    ['standort', 'stadt'],
    ['standort', 'bundesland'],
    ['standort', 'land'],
    ['kontakt', 'website'],
    ['technologie_stack', 'technologien'],
    ['technologie_stack', 'tags']
  ];
  
  const filledFields = requiredFields.filter(fieldPath => {
    let value = data;
    for (const key of fieldPath) {
      value = value?.[key];
      if (value === undefined || value === null) break;
    }
    return value && value !== 'Nicht verfügbar' && 
           (!Array.isArray(value) || value.length > 0);
  });
  
  return Math.round((filledFields.length / requiredFields.length) * 100);
} 