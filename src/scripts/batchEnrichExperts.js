const fs = require('fs').promises;
const path = require('path');

// Paths
const expertsDir = path.join(__dirname, '../data/experts');
const linksPath = path.join(__dirname, '../../public/exports/link.json');

async function enrichExpertData(expertData, matchingLink) {
    // Basic Information
    expertData.social_media = expertData.social_media || {};
    if (matchingLink.publicIdentifier) {
        expertData.social_media.linkedin = `https://www.linkedin.com/in/${matchingLink.publicIdentifier}`;
    }

    // Add profile picture and cover image
    if (matchingLink.pictureUrl) {
        expertData.image_url = matchingLink.pictureUrl;
    }
    if (matchingLink.coverImageUrl) {
        expertData.cover_image = matchingLink.coverImageUrl;
    }

    // Location
    if (matchingLink.geoLocationName || matchingLink.geoCountryName) {
        expertData.standort = matchingLink.geoLocationName || matchingLink.geoCountryName;
    }

    // Professional Experience
    if (matchingLink.positions && matchingLink.positions.length > 0) {
        expertData.professionalPositions = matchingLink.positions.map(pos => ({
            title: pos.title || '',
            company: pos.companyName || '',
            location: pos.locationName || '',
            startDate: pos.timePeriod?.startDate ? 
                `${pos.timePeriod.startDate.year}-${String(pos.timePeriod.startDate.month).padStart(2, '0')}` : null,
            endDate: pos.timePeriod?.endDate ?
                `${pos.timePeriod.endDate.year}-${String(pos.timePeriod.endDate.month).padStart(2, '0')}` : null,
            description: pos.description || ''
        }));
    }

    // Education
    if (matchingLink.educations && matchingLink.educations.length > 0) {
        expertData.education = expertData.education || {
            fields: [],
            universities: [],
            degrees: [],
            details: []
        };

        matchingLink.educations.forEach(edu => {
            // Add to details array
            expertData.education.details.push({
                degree: edu.degreeName || '',
                field: edu.fieldOfStudy || '',
                institution: edu.schoolName || '',
                startDate: edu.timePeriod?.startDate?.year,
                endDate: edu.timePeriod?.endDate?.year
            });

            // Add to fields if not already present
            if (edu.fieldOfStudy && !expertData.education.fields.includes(edu.fieldOfStudy)) {
                expertData.education.fields.push(edu.fieldOfStudy);
            }

            // Add to universities if not already present
            if (edu.schoolName && !expertData.education.universities.includes(edu.schoolName)) {
                expertData.education.universities.push(edu.schoolName);
            }

            // Add to degrees if not already present
            if (edu.degreeName && !expertData.education.degrees.includes(edu.degreeName)) {
                expertData.education.degrees.push(edu.degreeName);
            }
        });
    }

    // Languages
    if (matchingLink.languages && matchingLink.languages.length > 0) {
        expertData.languages = matchingLink.languages.map(lang => ({
            language: lang.name || '',
            proficiency: lang.proficiency || ''
        }));
    }

    // Update data quality
    expertData.data_quality = {
        ...expertData.data_quality,
        completeness: Math.min(1, (expertData.data_quality?.completeness || 0) + 0.2),
        last_full_verification: new Date().toISOString().split('T')[0]
    };

    // Update sources
    if (!expertData.sources.metadata.primary_sources.some(s => s.type === "professional_network")) {
        expertData.sources.metadata.primary_sources.push({
            name: "LinkedIn Profile",
            type: "professional_network",
            last_checked: new Date().toISOString().split('T')[0],
            verified: true
        });
    }

    return expertData;
}

async function main() {
    try {
        console.log('Starting expert data enrichment process...\n');
        
        // Read link.json using async/await
        const linksData = await fs.readFile(linksPath, 'utf8');
        const links = JSON.parse(linksData);

        // Get all expert files
        const files = await fs.readdir(expertsDir);
        const expertFiles = files.filter(file => 
            file.endsWith('.json') && 
            !file.includes('default') && 
            !file.includes('template')
        );

        console.log(`Found ${expertFiles.length} expert files to process`);
        let enriched = 0;
        let skipped = 0;

        // Process each expert file
        for (const file of expertFiles) {
            try {
                const filePath = path.join(expertsDir, file);
                const expertData = JSON.parse(await fs.readFile(filePath, 'utf8'));
                
                // Check if expertData has required properties
                if (!expertData || !expertData.fullName) {
                    console.log(`Skipping ${file} - no fullName property found`);
                    skipped++;
                    continue;
                }

                console.log(`Processing: ${expertData.fullName}`);

                // Find matching link
                const matchingLink = links.find(link => {
                    if (!link || !link.firstName || !link.lastName) return false;
                    const linkedinName = `${link.firstName} ${link.lastName}`.toLowerCase();
                    const expertName = expertData.fullName.toLowerCase();
                    return linkedinName === expertName || 
                           expertName.includes(linkedinName) || 
                           linkedinName.includes(expertName);
                });

                if (matchingLink) {
                    const enrichedData = await enrichExpertData(expertData, matchingLink);
                    await fs.writeFile(filePath, JSON.stringify(enrichedData, null, 2));
                    console.log(`Updated ${expertData.fullName}`);
                    enriched++;
                } else {
                    console.log(`No matching profile found for ${expertData.fullName}`);
                    skipped++;
                }
            } catch (error) {
                console.error(`Error processing ${file}:`, error.message);
                skipped++;
            }
        }

        console.log('\nEnrichment Process Summary:');
        console.log(`Total files processed: ${expertFiles.length}`);
        console.log(`Successfully enriched: ${enriched}`);
        console.log(`Skipped: ${skipped}`);
        console.log('\nEnrichment complete!');
    } catch (error) {
        console.error('Fatal error:', error);
    }
}

// Run the script
main(); 