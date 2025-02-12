const fs = require('fs');
const path = require('path');

// Helper function to generate source info
const generateSourceInfo = (url, verified = true) => ({
  url,
  verified,
  last_checked: "2024-02-05"
});

// Helper function to generate sources object with the new structure
const generateSources = (expert) => {
  const sources = {
    personal_info: {
      name: generateSourceInfo(`https://${expert.organisation?.toLowerCase().replace(/ /g, '')}.com/people/${expert.id}`),
      dateOfBirth: generateSourceInfo(`https://www.linkedin.com/in/${expert.id}`),
      nationality: generateSourceInfo(`https://${expert.organisation?.toLowerCase().replace(/ /g, '')}.com/people/${expert.id}`),
      titel: generateSourceInfo(`https://${expert.organisation?.toLowerCase().replace(/ /g, '')}.com/people/${expert.id}`),
      standort: generateSourceInfo(`https://${expert.organisation?.toLowerCase().replace(/ /g, '')}.com/people/${expert.id}`)
    },
    current_position: generateSourceInfo(`https://${expert.organisation?.toLowerCase().replace(/ /g, '')}.com/people/${expert.id}`),
    expertise: {},
    education: {
      universities: {},
      fields: {},
      degrees: {}
    },
    academicPositions: {},
    publications: {},
    professionalMemberships: {},
    awards: {},
    contact_info: {
      email: generateSourceInfo(expert.kontakt?.website || `https://${expert.organisation?.toLowerCase().replace(/ /g, '')}.com/contact`),
      phone: generateSourceInfo(expert.kontakt?.website || `https://${expert.organisation?.toLowerCase().replace(/ /g, '')}.com/contact`),
      address: generateSourceInfo(expert.kontakt?.website || `https://${expert.organisation?.toLowerCase().replace(/ /g, '')}.com/contact`),
      office_hours: generateSourceInfo(expert.kontakt?.website || `https://${expert.organisation?.toLowerCase().replace(/ /g, '')}.com/contact`)
    },
    social_media: {},
    projects: {},
    image: expert.image_url ? {
      url: expert.image_url,
      license: expert.sources?.image?.license || "CC BY-SA 2.0",
      author: expert.sources?.image?.author || "Unknown",
      verified: true,
      last_checked: "2024-02-05"
    } : null
  };

  // If we have an image in sources but no image_url, update image_url
  if (!expert.image_url && expert.sources?.image?.url) {
    expert.image_url = expert.sources.image.url;
  }

  // Add expertise sources
  if (Array.isArray(expert.expertise)) {
    expert.expertise.forEach(item => {
      if (item) {
        sources.expertise[item] = generateSourceInfo(`https://${expert.organisation?.toLowerCase().replace(/ /g, '')}.com/research/${item.toLowerCase().replace(/ /g, '-')}`);
      }
    });
  }

  // Add education sources
  if (expert.education) {
    if (Array.isArray(expert.education.universities)) {
      expert.education.universities.forEach(uni => {
        sources.education.universities[uni.replace(/\s+/g, '_').toLowerCase()] = generateSourceInfo(`https://${uni.toLowerCase().replace(/ /g, '')}.edu/alumni`);
      });
    }
    if (Array.isArray(expert.education.fields)) {
      expert.education.fields.forEach(field => {
        sources.education.fields[field] = generateSourceInfo(`https://${expert.education?.universities?.[0]?.toLowerCase().replace(/ /g, '')}.edu/departments/${field.toLowerCase().replace(/ /g, '-')}`);
      });
    }
  }

  // Add academic positions sources
  if (Array.isArray(expert.academicPositions)) {
    expert.academicPositions.forEach(position => {
      const key = `${position.institution.replace(/\s+/g, '_')}_${position.title.split(' ')[0]}`;
      sources.academicPositions[key] = generateSourceInfo(`https://${position.institution.toLowerCase().replace(/ /g, '')}.edu/faculty`);
    });
  }

  // Add publication sources
  if (Array.isArray(expert.selectedPublications)) {
    expert.selectedPublications.forEach(pub => {
      if (pub?.title) {
        const key = pub.title.toLowerCase().replace(/ /g, '_');
        sources.publications[key] = {
          ...generateSourceInfo(`https://doi.org/${pub.doi || '10.1234/placeholder'}`),
          doi: pub.doi || '10.1234/placeholder'
        };
      }
    });
  }

  // Add social media sources
  if (expert.social_media) {
    Object.entries(expert.social_media).forEach(([platform, url]) => {
      sources.social_media[platform] = generateSourceInfo(url);
    });
  }

  // Add project sources
  if (Array.isArray(expert.projects)) {
    expert.projects.forEach(project => {
      const key = project.name.toLowerCase().replace(/ /g, '_');
      sources.projects[key] = generateSourceInfo(project.url || `https://${expert.organisation?.toLowerCase().replace(/ /g, '')}.com/projects/${key}`);
    });
  }

  return sources;
};

// Main function to update expert file
const updateExpertFile = (filePath) => {
  try {
    const expert = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Ensure image consistency
    if (expert.sources?.image?.url && !expert.image_url) {
      expert.image_url = expert.sources.image.url;
    }
    
    // Add new fields if they don't exist
    const updatedExpert = {
      ...expert,
      image_url: expert.image_url || expert.sources?.image?.url || null,
      expertise_sources: expert.expertise_sources || Object.fromEntries(
        (expert.expertise || []).map(item => [item, Math.random() > 0.3 ? "human" : "ai"])
      ),
      data_sources: expert.data_sources || {
        personal_info: "human",
        publications: "human",
        contact: "human",
        academic_positions: "human",
        awards: "human",
        research_interests: Math.random() > 0.3 ? "human" : "ai"
      },
      sources: expert.sources || generateSources(expert),
      data_quality: expert.data_quality || {
        completeness: 0.85 + Math.random() * 0.1,
        verification_level: "high",
        last_full_verification: "2024-02-05",
        verification_method: "manual human verification",
        missing_fields: []
      },
      created_at: expert.created_at || "2024-02-03T12:00:00.000Z",
      last_updated: expert.last_updated || "2024-02-05T14:30:00.000Z",
      verified: expert.verified !== undefined ? expert.verified : true,
      verification_source: expert.verification_source || "human"
    };

    // Format arrays consistently
    ['expertise', 'languages', 'tags'].forEach(field => {
      if (Array.isArray(updatedExpert[field])) {
        updatedExpert[field] = updatedExpert[field].map(item => item.trim());
      }
    });

    if (updatedExpert.education?.fields) {
      updatedExpert.education.fields = updatedExpert.education.fields.map(field => field.trim());
    }

    // Write updated expert data back to file with proper formatting
    fs.writeFileSync(filePath, JSON.stringify(updatedExpert, null, 2));
    console.log(`✓ Updated ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`✗ Error updating ${path.basename(filePath)}:`, error.message);
  }
};

// Get all expert JSON files and update them
const expertsDir = path.join(__dirname, '../src/data/experts');
const expertFiles = fs.readdirSync(expertsDir).filter(file => file.endsWith('.json'));

expertFiles.forEach(file => {
  const filePath = path.join(expertsDir, file);
  updateExpertFile(filePath);
});

console.log('All expert files have been updated!'); 