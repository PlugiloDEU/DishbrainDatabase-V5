const fs = require('fs').promises;
const path = require('path');

// Data pools for generating realistic profiles
const data = {
    titles: ['Prof. Dr.', 'Dr.', 'Prof.', 'PD Dr.'],
    firstNames: ['Alexander', 'Maria', 'Thomas', 'Laura', 'Michael', 'Sophie', 'Christian', 'Anna', 'Martin', 'Julia'],
    lastNames: ['Müller', 'Schmidt', 'Weber', 'Wagner', 'Fischer', 'Meyer', 'Schulz', 'Becker', 'Hoffmann', 'Koch'],
    institutions: [
        { name: 'Technische Universität München', location: 'München' },
        { name: 'RWTH Aachen', location: 'Aachen' },
        { name: 'Karlsruher Institut für Technologie', location: 'Karlsruhe' },
        { name: 'Fraunhofer IAIS', location: 'Sankt Augustin' },
        { name: 'Max-Planck-Institut für Intelligente Systeme', location: 'Tübingen' },
        { name: 'Deutsches Forschungszentrum für KI', location: 'Kaiserslautern' },
        { name: 'Technische Universität Berlin', location: 'Berlin' },
        { name: 'Ludwig-Maximilians-Universität München', location: 'München' },
    ],
    departments: [
        'Institut für Künstliche Intelligenz',
        'Fakultät für Informatik',
        'Machine Learning Lab',
        'AI Research Center',
        'Institut für Intelligente Systeme',
    ],
    expertiseAreas: {
        primary: [
            'Machine Learning',
            'Deep Learning',
            'Natural Language Processing',
            'Computer Vision',
            'Reinforcement Learning',
            'AI Ethics',
            'Robotics',
            'Neural Networks',
            'Quantum AI',
            'Explainable AI',
        ],
        secondary: [
            'Big Data Analytics',
            'Edge Computing',
            'AI Governance',
            'Federated Learning',
            'AutoML',
            'Knowledge Graphs',
            'Human-AI Interaction',
            'AI Security',
        ],
        industries: [
            'Research',
            'Healthcare',
            'Automotive',
            'Finance',
            'Manufacturing',
            'Education',
            'Robotics',
            'Energy',
        ],
    },
    languages: ['Deutsch', 'Englisch', 'Französisch', 'Spanisch', 'Italienisch', 'Mandarin'],
};

// Helper functions
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomElements = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
const generatePhone = () => `+49 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 90000000 + 10000000)}`;

// Update the email generation in the generateExpert function
const normalizeForEmail = (str) => {
    return str
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
};

// Update the email generation in the generateExpert function
const generateEmail = (firstName, lastName, institution) => {
    const normalizedFirstName = normalizeForEmail(firstName);
    const normalizedLastName = normalizeForEmail(lastName);
    const normalizedInstitution = normalizeForEmail(institution);
    return `${normalizedFirstName}.${normalizedLastName}@${normalizedInstitution}.de`;
};

// Generate single expert profile
const generateExpert = (id) => {
    const title = randomElement(data.titles);
    const firstName = randomElement(data.firstNames);
    const lastName = randomElement(data.lastNames);
    const institution = randomElement(data.institutions);
    const department = randomElement(data.departments);

    // Ensure unique combinations of expertise
    const primaryExpertise = randomElements(data.expertiseAreas.primary, 3);
    const secondaryExpertise = randomElements(
        data.expertiseAreas.secondary.filter(item => !primaryExpertise.includes(item)), 
        2
    );
    const industries = randomElements(data.expertiseAreas.industries, 3);

    return {
        id: `exp${String(id).padStart(3, '0')}`,
        personalInfo: {
            fullName: `${title} ${firstName} ${lastName}`,
            title: title.includes('Prof') ? 'Professor für KI und ML' : 'Senior AI Researcher',
            email: generateEmail(firstName, lastName, institution.name),
            phone: generatePhone(),
            image: `/experts/${normalizeForEmail(firstName)}-${normalizeForEmail(lastName)}.jpg`,
            languages: randomElements(data.languages, Math.floor(Math.random() * 2) + 1),
        },
        institution: {
            name: institution.name,
            department: department,
            position: title.includes('Prof') ? 'Professor' : 'Researcher',
            location: institution.location,
        },
        expertise: {
            primary: primaryExpertise,
            secondary: secondaryExpertise,
            industries: industries,
        },
        currentRole: {
            title: title.includes('Prof') ? 'Professor für Künstliche Intelligenz' : 'Senior AI Researcher',
            organization: institution.name,
            focus: `Forschung in ${randomElement(primaryExpertise)}`,
            status: 'active',
        },
    };
};

// Main function to generate and save experts
async function generateExperts(count) {
    const outputDir = 'C:/Users/patri/Downloads/DishbrainDatabase-main/DishbrainDatabase-main/src/data/experts';
    
    try {
        // Ensure directory exists
        await fs.mkdir(outputDir, { recursive: true });
        
        // Generate and save each expert
        for (let i = 1; i <= count; i++) {
            const expert = generateExpert(i);
            const filePath = path.join(outputDir, `expert${i}.json`);
            await fs.writeFile(filePath, JSON.stringify(expert, null, 2));
            console.log(`Generated expert${i}.json`);
        }
        
        console.log(`Successfully generated ${count} expert profiles!`);
    } catch (error) {
        console.error('Error generating experts:', error);
    }
}

// Execute if run directly
if (require.main === module) {
    const count = process.argv[2] || 500;
    generateExperts(Number(count));
}

module.exports = generateExperts; 