const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parse/sync');

async function importExpertLinks() {
  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'public', 'exports', 'link.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    // Remove BOM if present
    const cleanContent = csvContent.replace(/^\uFEFF/, '');
    
    // Parse CSV with more relaxed options
    const records = csv.parse(cleanContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
      bom: true
    });

    // Read all expert files
    const expertsDir = path.join(process.cwd(), 'src', 'data', 'experts');
    await fs.mkdir(expertsDir, { recursive: true });

    console.log(`Found ${records.length} records to process`);

    for (const record of records) {
      if (!record.Name) {
        console.log('Skipping record without name:', record);
        continue;
      }

      // Create expert filename from name
      const expertName = record.Name.toLowerCase()
        .replace(/[äöüß]/g, (match) => {
          return { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }[match];
        })
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const fileName = `${expertName}.json`;
      const filePath = path.join(expertsDir, fileName);

      try {
        // Read existing expert data or create new
        let expertData = {};
        try {
          const existingData = await fs.readFile(filePath, 'utf-8');
          expertData = JSON.parse(existingData);
        } catch (error) {
          // File doesn't exist yet, create new expert
          expertData = {
            name: record.Name,
            created_at: new Date().toISOString()
          };
        }

        // Update expert data with CSV info
        const updatedData = {
          ...expertData,
          name: record.Name,
          titel: record.Title || expertData.titel,
          position: record.Position || expertData.position,
          organisation: record.Organization || expertData.organisation,
          fachgebiet: record.Field || expertData.fachgebiet,
          expertise: record.Expertise ? record.Expertise.split(';').map(e => e.trim()) : expertData.expertise,
          kontakt: {
            ...expertData.kontakt,
            email: record.Email || expertData.kontakt?.email,
            website: record.Website || expertData.kontakt?.website
          },
          social_media: {
            ...expertData.social_media,
            linkedin: record.LinkedIn || expertData.social_media?.linkedin,
            twitter: record.Twitter || expertData.social_media?.twitter
          },
          standort: record.Location || expertData.standort,
          tags: record.Tags ? record.Tags.split(';').map(t => t.trim()) : expertData.tags,
          letzte_aktualisierung: new Date().toISOString()
        };

        // Write updated data back to file
        await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
        console.log(`Updated expert: ${record.Name}`);

      } catch (error) {
        console.error(`Error processing expert ${record.Name}:`, error);
      }
    }

    console.log('Import completed successfully!');

  } catch (error) {
    console.error('Import failed:', error);
    // Log more details about the error
    if (error.code === 'INVALID_OPENING_QUOTE') {
      console.error('CSV parsing details:', {
        line: error.lines,
        column: error.column,
        field: error.field
      });
    }
  }
}

// Run the import
importExpertLinks(); 