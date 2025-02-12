const fs = require('fs');
const path = require('path');

const EXPERTS_DIR = path.join(__dirname, '../src/data/experts');

function standardizeExpert(expert) {
  return {
    id: expert.id || path.basename(expert._path, '.json'),
    name: expert.name || expert.personalInfo?.name || expert.fullName,
    titel: expert.titel || expert.personalInfo?.title || '',
    fullName: expert.fullName || [expert.firstName, expert.lastName].filter(Boolean).join(' ') || expert.name,
    position: expert.position || expert.currentRole?.title || expert.institution?.position,
    organisation: expert.organisation || expert.organization || expert.company?.name || expert.institution?.name,
    fachgebiet: expert.fachgebiet || expert.expertise?.primary?.[0] || expert.tags?.[0],
    dateOfBirth: expert.dateOfBirth || expert.personalInfo?.dateOfBirth,
    nationality: expert.nationality || expert.personalInfo?.nationality,
    expertise: expert.expertise ? 
      Array.isArray(expert.expertise) ? expert.expertise :
      expert.expertise.primary || Object.values(expert.expertise) : 
      expert.tags || [],
    education: expert.education || {
      fields: expert.academicBackground?.fields || [],
      universities: expert.academicBackground?.universities || [],
      degrees: expert.academicBackground?.degrees || []
    },
    academicPositions: expert.academicPositions || expert.academicPositions || [],
    kontakt: {
      email: expert.email || expert.personalInfo?.email || expert.kontakt?.email,
      phone: expert.phone || expert.personalInfo?.phone,
      website: expert.website || expert.company?.url,
      address: expert.address || expert.personalInfo?.address
    },
    social_media: {
      linkedin: expert.linkedin_url || expert.profiles?.linkedin,
      twitter: expert.twitter_url,
      github: expert.github_url
    },
    standort: expert.standort || expert.location || [expert.city, expert.country].filter(Boolean).join(', '),
    selectedPublications: expert.selectedPublications || expert.publications || [],
    professionalMemberships: expert.professionalMemberships || [],
    awards: expert.awards || [],
    sources: expert.sources || {
      profile: expert.source ? { url: expert.source } : null,
      image: expert.image_url ? { url: expert.image_url } : null
    },
    data_quality: expert.data_quality || {
      completeness: 0.85,
      verification_level: "medium",
      last_full_verification: new Date().toISOString()
    },
    created_at: expert.created_at || new Date().toISOString(),
    last_updated: new Date().toISOString(),
    verified: expert.verified !== undefined ? expert.verified : true,
    verification_source: expert.verification_source || "initial import",
    image_url: expert.image_url || expert.personalInfo?.imageUrl
  };
}

function processFiles() {
  const files = fs.readdirSync(EXPERTS_DIR).filter(f => f.endsWith('.json'));
  
  files.forEach(file => {
    const filePath = path.join(EXPERTS_DIR, file);
    const expertData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const standardized = standardizeExpert({...expertData, _path: filePath});
    
    fs.writeFileSync(
      filePath,
      JSON.stringify(standardized, null, 2),
      'utf8'
    );
    
    console.log(`Updated ${file}`);
  });
  
  console.log(`Processed ${files.length} expert files`);
}

processFiles(); 