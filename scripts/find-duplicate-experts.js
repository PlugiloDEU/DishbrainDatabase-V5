import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function findDuplicateExperts() {
  try {
    // Get path to experts directory
    const expertsDir = path.join(process.cwd(), 'src', 'data', 'experts');
    
    // Read all expert files
    const files = await fs.readdir(expertsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    // Map to store experts by various identifiers
    const expertsByName = new Map();
    const expertsByEmail = new Map();
    const expertsByLinkedIn = new Map();
    const duplicates = [];

    // Process each expert file
    for (const file of jsonFiles) {
      const filePath = path.join(expertsDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const expert = JSON.parse(content);

      // Get identifying information
      const name = expert.name?.toLowerCase() || 
                   expert.fullName?.toLowerCase() || 
                   expert.personalInfo?.fullName?.toLowerCase();
      const email = expert.kontakt?.email?.toLowerCase() || 
                   expert.email?.toLowerCase() || 
                   expert.personalInfo?.email?.toLowerCase();
      const linkedin = expert.social_media?.linkedin?.toLowerCase() || 
                      expert.linkedin_url?.toLowerCase();

      // Check for duplicates
      if (name) {
        if (expertsByName.has(name)) {
          duplicates.push({
            type: 'name',
            value: name,
            file1: expertsByName.get(name),
            file2: file
          });
        } else {
          expertsByName.set(name, file);
        }
      }

      if (email) {
        if (expertsByEmail.has(email)) {
          duplicates.push({
            type: 'email',
            value: email,
            file1: expertsByEmail.get(email),
            file2: file
          });
        } else {
          expertsByEmail.set(email, file);
        }
      }

      if (linkedin) {
        if (expertsByLinkedIn.has(linkedin)) {
          duplicates.push({
            type: 'linkedin',
            value: linkedin,
            file1: expertsByLinkedIn.get(linkedin),
            file2: file
          });
        } else {
          expertsByLinkedIn.set(linkedin, file);
        }
      }
    }

    // If no duplicates found
    if (duplicates.length === 0) {
      console.log('No duplicates found!');
      rl.close();
      return;
    }

    // Display duplicates and handle user input
    console.log('\nFound potential duplicates:');
    for (let i = 0; i < duplicates.length; i++) {
      const dup = duplicates[i];
      console.log(`\n${i + 1}. Duplicate ${dup.type}: ${dup.value}`);
      console.log(`   File 1: ${dup.file1}`);
      console.log(`   File 2: ${dup.file2}`);

      const answer = await question('\nDelete one of these files? (1/2/n): ');
      
      if (answer === '1' || answer === '2') {
        const fileToDelete = answer === '1' ? dup.file1 : dup.file2;
        const filePath = path.join(expertsDir, fileToDelete);
        
        try {
          await fs.unlink(filePath);
          console.log(`Deleted: ${fileToDelete}`);
        } catch (error) {
          console.error(`Error deleting file: ${error.message}`);
        }
      } else {
        console.log('Skipped');
      }
    }

    console.log('\nDuplicate check complete!');
    rl.close();

  } catch (error) {
    console.error('Error processing experts:', error);
    rl.close();
  }
}

// Run the script
findDuplicateExperts(); 