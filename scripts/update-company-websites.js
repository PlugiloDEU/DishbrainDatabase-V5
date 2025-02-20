const fs = require('fs');
const path = require('path');

// Function to extract domain from website URL
const extractDomain = (website) => {
  try {
    if (!website || typeof website !== 'string') return null;
    // Remove protocol and www if present
    let domain = website.replace(/^(https?:\/\/)?(www\.)?/, '');
    // Remove everything after the first slash
    domain = domain.split('/')[0];
    // Basic validation
    if (!domain.includes('.')) return null;
    return domain.toLowerCase();
  } catch (error) {
    return null;
  }
};

// Function to validate URL
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Function to update a single company file
const updateCompanyFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let company;
    
    try {
      company = JSON.parse(content);
    } catch (parseError) {
      console.error(`✗ Invalid JSON in ${path.basename(filePath)}`);
      return;
    }

    let modified = false;

    // Ensure company has a name
    if (!company.name) {
      console.error(`✗ No company name in ${path.basename(filePath)}`);
      return;
    }

    // Clean up website if it exists
    if (company.website) {
      let website = company.website.trim();
      if (!website.startsWith('http')) {
        website = `https://${website}`;
      }
      if (isValidUrl(website)) {
        company.website = website;
        modified = true;
      }
    }

    // Extract or update domain
    const newDomain = company.website ? extractDomain(company.website) : null;
    if (newDomain && (!company.domain || company.domain !== newDomain)) {
      company.domain = newDomain;
      modified = true;
    }

    // Update logo URL if we have a domain
    if (company.domain && (!company.image_url || company.image_url.includes('clearbit.com'))) {
      const newImageUrl = `https://logo.clearbit.com/${company.domain}`;
      if (company.image_url !== newImageUrl) {
        company.image_url = newImageUrl;
        
        // Update or create sources structure
        company.sources = company.sources || {};
        company.sources.image = {
          url: newImageUrl,
          license: "Clearbit Logo API",
          author: "Clearbit",
          verified: true,
          last_checked: new Date().toISOString().split('T')[0]
        };
        modified = true;
      }
    }

    // If any modifications were made, save the file
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(company, null, 2), 'utf8');
      console.log(`✓ Updated ${path.basename(filePath)}`);
    } else {
      console.log(`- No changes needed for ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${path.basename(filePath)}:`, error.message);
  }
};

// Main execution
const main = async () => {
  try {
    const companiesDir = path.join(__dirname, '../src/data/companies');
    
    // Verify directory exists
    if (!fs.existsSync(companiesDir)) {
      console.error(`✗ Directory not found: ${companiesDir}`);
      return;
    }

    // Get all JSON files
    const companyFiles = fs.readdirSync(companiesDir)
      .filter(file => file.endsWith('.json'));

    console.log(`Found ${companyFiles.length} company files to process...`);

    // Process each file
    for (const file of companyFiles) {
      const filePath = path.join(companiesDir, file);
      await updateCompanyFile(filePath);
    }

    console.log('Website and domain update completed!');
  } catch (error) {
    console.error('Fatal error:', error);
  }
};

// Run the script
main().catch(console.error); 