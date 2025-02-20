const fs = require('fs');
const path = require('path');

// Function to convert object to CSV row
const objectToCsvRow = (company) => {
  try {
    // Define the fields we want to export
    const fields = [
      company.name || '',
      company.website || '',
      company.domain || '',
      company.description || '',
      company.location || '',
      company.founded || '',
      company.employees || '',
      Array.isArray(company.specialties) ? company.specialties.join('; ') : '',
      Array.isArray(company.technologies) ? company.technologies.join('; ') : '',
      company.category || '',
      company.subcategory || '',
      company.image_url || ''
    ];

    // Escape fields and wrap in quotes if they contain commas
    return fields.map(field => {
      if (field.toString().includes(',')) {
        return `"${field.toString().replace(/"/g, '""')}"`;
      }
      return field;
    }).join(',');
  } catch (error) {
    console.error(`Error processing company: ${company.name || 'unknown'}`, error);
    return '';
  }
};

// Main execution
const main = async () => {
  try {
    // Try different possible directory paths
    const possiblePaths = [
      path.join(__dirname, '../src/data/companies'),
      path.join(__dirname, '../ki-firma'),
      path.join(__dirname, 'src/data/companies'),
      path.join(__dirname, 'ki-firma')
    ];

    let companiesDir;
    for (const dirPath of possiblePaths) {
      if (fs.existsSync(dirPath)) {
        companiesDir = dirPath;
        console.log(`Found companies directory at: ${dirPath}`);
        break;
      }
    }

    if (!companiesDir) {
      console.error('✗ Could not find companies directory');
      return;
    }

    // Get all JSON files
    const companyFiles = fs.readdirSync(companiesDir)
      .filter(file => file.endsWith('.json'));

    console.log(`Found ${companyFiles.length} company files to process...`);

    // Create CSV header
    const header = [
      'Name',
      'Website',
      'Domain',
      'Description',
      'Location',
      'Founded',
      'Employees',
      'Specialties',
      'Technologies',
      'Category',
      'Subcategory',
      'Image URL'
    ].join(',');

    // Process each file and create CSV rows
    const rows = [header];
    
    for (const file of companyFiles) {
      try {
        const filePath = path.join(companiesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const company = JSON.parse(content);
        
        const row = objectToCsvRow(company);
        if (row) {
          rows.push(row);
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error.message);
      }
    }

    // Write CSV file
    const outputPath = path.join(__dirname, '../companies.csv');
    fs.writeFileSync(outputPath, rows.join('\n'), 'utf8');

    console.log(`✓ CSV file created successfully at: ${outputPath}`);
    console.log(`Total companies processed: ${rows.length - 1}`);
  } catch (error) {
    console.error('Fatal error:', error);
  }
};

// Run the script
main().catch(console.error); 