import { promises as fs } from 'fs';
import path from 'path';

// Helper to get all JSON files from a directory
async function getJsonFiles(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
}

// Helper to read and parse JSON file
async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Export experts to CSV
export async function exportExpertsToCsv() {
  const expertsDir = path.join(process.cwd(), 'src', 'data', 'experts');
  const outputPath = path.join(process.cwd(), 'public', 'exports', 'ai_experts.csv');
  
  const files = await getJsonFiles(expertsDir);
  const experts = [];
  
  for (const file of files) {
    const expert = await readJsonFile(path.join(expertsDir, file));
    if (expert) experts.push(expert);
  }

  // Helper function to extract expertise
  const getExpertise = (expert) => {
    if (Array.isArray(expert.expertise)) {
      return expert.expertise.join('; ');
    }
    if (expert.expertise?.primary) {
      return Array.isArray(expert.expertise.primary) 
        ? expert.expertise.primary.join('; ')
        : expert.expertise.primary;
    }
    if (typeof expert.expertise === 'string') {
      return expert.expertise;
    }
    return '';
  };
  
  const headers = [
    'Name',
    'Titel',
    'Position',
    'Organisation',
    'Fachgebiet',
    'Expertise',
    'Email',
    'LinkedIn',
    'Twitter',
    'Website',
    'Standort',
    'Tags',
    'Letzte Aktualisierung'
  ];
  
  const rows = experts.map(expert => [
    expert.name || expert.personalInfo?.fullName || '',
    expert.titel || expert.personalInfo?.title || '',
    expert.position || expert.personalInfo?.position || '',
    expert.organisation || expert.personalInfo?.organization || '',
    expert.fachgebiet || expert.personalInfo?.field || '',
    getExpertise(expert),
    expert.kontakt?.email || expert.contact?.email || '',
    expert.social_media?.linkedin || expert.contact?.linkedin || '',
    expert.social_media?.twitter || expert.contact?.twitter || '',
    expert.kontakt?.website || expert.contact?.website || '',
    expert.standort || expert.location || '',
    Array.isArray(expert.tags) ? expert.tags.join('; ') : (expert.tags || ''),
    expert.letzte_aktualisierung || expert.lastUpdated || ''
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => 
      `"${(cell || '').toString().replace(/"/g, '""')}"`
    ).join(','))
  ].join('\n');
  
  // Ensure the exports directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, csv);
  
  return outputPath;
}

// Export companies to CSV
export async function exportCompaniesToCsv() {
  const companiesDir = path.join(process.cwd(), 'src', 'data', 'companies');
  const outputPath = path.join(process.cwd(), 'public', 'exports', 'ai_companies.csv');
  
  const files = await getJsonFiles(companiesDir);
  const companies = [];
  
  for (const file of files) {
    const company = await readJsonFile(path.join(companiesDir, file));
    if (company) companies.push(company);
  }
  
  const headers = [
    'Name',
    'Unternehmenstyp',
    'Branche',
    'Gründungsjahr',
    'Mitarbeiter',
    'Beschreibung',
    'Website',
    'Adresse',
    'Stadt',
    'Land',
    'Email',
    'Telefon',
    'LinkedIn',
    'Technologien',
    'Tags',
    'Vertrauenswert',
    'Letzte Aktualisierung'
  ];
  
  const rows = companies.map(company => [
    company.unternehmensinformationen?.legal_name || '',
    company.unternehmensinformationen?.unternehmenstyp || '',
    company.unternehmensinformationen?.branche || '',
    company.unternehmensinformationen?.grundungsjahr || '',
    company.unternehmensinformationen?.mitarbeiter?.anzahl || '',
    company.unternehmensinformationen?.beschreibung || '',
    company.kontakt?.website || '',
    company.standort?.adresse || '',
    company.standort?.stadt || '',
    company.standort?.land || '',
    company.kontakt?.email || '',
    company.kontakt?.telefon || '',
    company.social_media?.linkedin || '',
    Array.isArray(company.technologie_stack?.technologien) ? company.technologie_stack.technologien.join('; ') : '',
    Array.isArray(company.technologie_stack?.tags) ? company.technologie_stack.tags.join('; ') : '',
    company.metadaten?.vertrauenswert || '',
    company.metadaten?.letzte_aktualisierung || ''
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => 
      `"${(cell || '').toString().replace(/"/g, '""')}"`
    ).join(','))
  ].join('\n');
  
  // Ensure the exports directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, csv);
  
  return outputPath;
} 