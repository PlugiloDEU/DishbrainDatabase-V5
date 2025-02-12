import { memoize } from './performance';

// Function to load all expert files dynamically
const loadAllExperts = async () => {
  try {
    // Create a list of all expert filenames (without .json extension)
    const expertFiles = [
      // Named experts (A)
      'aidan-gomez', 'alena-buyx', 'alessandro-alviani', 'alex-balazs', 'alex-graves',
      'alex-von-frankenberg', 'alexander-claas', 'alexander-machado', 'alexander-vaselek',
      'alexandra-schmidt', 'alexandru-costin', 'almudena-pereira', 'anastasis-germanidis',
      'andre-retterath', 'andrea-gagliano', 'andrea-hickethier', 'andreas-d-ubler',
      'andreas-preisser', 'andrew-feldman', 'ankit-agrawal', 'anna-graf', 'antonio-kr-ger',
      'antonio-krueger', 'armin-kurrle', 'arnault-ioualalen', 'arno-fuhrmann',
      'arthur-mensch', 'ashish-vaswani', 'asmita-dubey', 'axel-schubert',

      // Named experts (B)
      'barnaby-skinner', 'bart-de-witte', 'belinda-neal', 'benedikt-bonnmann',
      'benno-siebern', 'berkan-cinar', 'bernhard-nebel', 'bernhard-pflugfelder',
      'bernhard-sch-lkopf', 'bettina-stark-watzinger', 'brad-lightcap', 'brett-adcock',
      'brian-comiskey', 'brian-tong', 'britta-tilsner', 'bryan-goodman', 'burkhard-sagem-ller',

      // Named experts (C)
      'c-line-isabel-titz', 'carlo-feldmann', 'catherine-d--wood', 'chris-bedi',
      'chris-boos', 'chrissie-kemp', 'christian-schlicht', 'christian-szegedy',
      'christina-maria-leeb', 'christine-regitz', 'christoph-j-f--schreiber',
      'christoph-l-tge', 'clara-shih', 'claudia-pohlink',

      // Named experts (D)
      'dade-orgeron', 'daniel-hauber', 'daniel-katz', 'daphne-koller', 'david-ha',
      'david-koch', 'david-kuczek', 'davide-scaramuzza', 'deepa-gautam-nigge',
      'dennis-ballwieser', 'desiree-modic', 'diana-stracke', 'dilan-mienert',
      'dirk-hecker', 'dirk-rosomm', 'don-dahlmann', 'dor-skuler', 'doris-we-els',
      'dorothee-t-reki',

      // Named experts (Dr.)
      'dr--andreas-liebl', 'dr--anne-f-rster', 'dr--annina-neumann', 'dr--benedikt-fl-ter',
      'dr--benedikt-kohn', 'dr--benjamin-goertzel', 'dr--christoph-cordes',
      'dr--claire-quigley', 'dr--dominik-rabe', 'dr--donald-leonhard-macdonald',
      'dr--fabian-bause', 'dr--florian-sch-tz', 'dr--gerald-fricke', 'dr--gerald-spiegel',
      'dr--hans-joachim-gergs', 'dr--harald-sch-nfeld', 'dr--holger-schmidt',
      'dr--ing--dipl--inform--thomas-r-fer', 'dr--inka-knappertsbusch',
      'dr--iur--pablo-schumacher', 'dr--johanna-farnhammer', 'dr--jonas-brinker',
      'dr--kai-bender', 'dr--kp-thai', 'dr--malte-baumann', 'dr--mario-herger',
      'dr--marko-wolf', 'dr--matthias-klusch', 'dr--matthias-plaue',
      'dr--maximilian-vonthien--llm', 'dr--miguel-de-benito', 'dr--mustafa-gaja',
      'dr--nadja-christe', 'dr--nicolai-wiegand', 'dr--patrick-st-hler',
      'dr--pavel-sagulenko', 'dr--philipp-hartmann', 'dr--ralf-belusa',
      'dr--rasmus-rothe', 'dr--stefan-lemke', 'dr--thiemo-scherle',
      'dr--thomas-wollmann', 'dr-benedikt-floeter',

      // Numbered experts
      ...Array.from({ length: 500 }, (_, i) => `expert${i + 1}`),

      // Named experts (E-Z)
      'edith-hessel', 'elisabeth-andr-', 'elisabeth-asser',
      'eric-steinberger-und-sebastian-de-ro', 'ermano-geuer',
      // ... continue with all remaining experts from your scan
      'xavier-amatriain', 'yannik-bauer', 'yannik-sturm', 'yoav-shoham',
      'yoshua-bengio', 'zack-kass'
    ];

    const experts = [];
    
    // Load each expert file
    for (const filename of expertFiles) {
      try {
        const module = await import(`../data/experts/${filename}.json`);
        const expert = module.default;
        
        if (expert && expert.id) {
          experts.push(expert);
        }
      } catch (error) {
        console.warn(`Failed to load expert: ${filename}`, error);
      }
    }

    console.log(`Successfully loaded ${experts.length} experts`);
    return experts;
  } catch (error) {
    console.error('Error loading experts:', error);
    return [];
  }
};

// Memoize the fetch operation
const fetchExperts = memoize(loadAllExperts);

export const expertsData = [
  {
    "id": "1",
    "personalInfo": {
      "fullName": "Dr. Anna Schmidt",
      "title": "Dr.",
      "image": "/experts/anna-schmidt.jpg",
      "email": "anna.schmidt@ai-institute.de",
      "phone": "+49 30 1234567"
    },
    "institution": {
      "name": "Berlin Institute of AI",
      "department": "Machine Learning",
      "position": "Senior Researcher"
    },
    "currentRole": {
      "title": "Lead AI Researcher",
      "organization": "Berlin Institute of AI",
      "focus": "Deep Learning Applications"
    },
    "expertise": {
      "primary": ["Machine Learning", "Neural Networks", "Computer Vision"],
      "secondary": ["Natural Language Processing", "Robotics"]
    },
    "academicMetrics": {
      "publications": {
        "total": 45
      },
      "hIndex": 18
    }
  },
  {
    "id": "2",
    "personalInfo": {
      "fullName": "Prof. Dr. Marcus Weber",
      "title": "Prof. Dr.",
      "image": "/experts/marcus-weber.jpg",
      "email": "m.weber@tech-uni.de",
      "phone": "+49 89 9876543"
    },
    "institution": {
      "name": "Technical University Munich",
      "department": "AI & Robotics",
      "position": "Department Head"
    },
    "currentRole": {
      "title": "Professor of AI",
      "organization": "Technical University Munich",
      "focus": "AI in Robotics"
    },
    "expertise": {
      "primary": ["Robotics", "AI Systems", "Automation"],
      "secondary": ["Machine Learning", "Sensor Fusion"]
    },
    "academicMetrics": {
      "publications": {
        "total": 78
      },
      "hIndex": 25
    }
  }
];

export const firmsData = [
  {
    "id": "1",
    "name": "DeepMind Deutschland GmbH",
    "location": "Berlin",
    "focus": "Künstliche Intelligenz & Deep Learning",
    "employees": 250,
    "founded": 2018,
    "projects": "AlphaFold, Robotik-Steuerung",
    "logo": "/company1.jpg"
  },
  {
    "id": "2",
    "name": "AI Solutions AG",
    "location": "München",
    "focus": "Machine Learning & Predictive Analytics",
    "employees": 120,
    "founded": 2015,
    "projects": "Industrieautomatisierung, Smart City",
    "logo": "/company2.jpg"
  },
  {
    "id": "3",
    "name": "Neural Systems GmbH",
    "location": "Hamburg",
    "focus": "Neuronale Netze & Computer Vision",
    "employees": 80,
    "founded": 2019,
    "projects": "Bildverarbeitung, Qualitätskontrolle",
    "logo": "/company3.jpg"
  }
];

// Add a new function for chunked loading
export const loadExpertsInChunks = async (chunkSize = 10) => {
  try {
    const experts = await fetchExperts();
    console.log(`Loaded ${experts.length} experts`);

    // Get initial chunk
    const initialChunk = experts.slice(0, chunkSize).map(normalizeExpert);
    
    return {
      experts: initialChunk,
      totalExperts: experts.length,
      hasMore: experts.length > chunkSize
    };
  } catch (error) {
    console.error('Error loading initial experts:', error);
    return {
      experts: [],
      totalExperts: 0,
      hasMore: false
    };
  }
};

// Add a function to load more experts
export const loadMoreExperts = async (offset, limit = 10) => {
  try {
    const experts = await fetchExperts();
    const nextChunk = experts.slice(offset, offset + limit).map(normalizeExpert);
    
    return {
      experts: nextChunk,
      hasMore: offset + limit < experts.length
    };
  } catch (error) {
    console.error('Error loading more experts:', error);
    return {
      experts: [],
      hasMore: false
    };
  }
};

// Add this helper function
const getExpertImagePath = (expert) => {
  if (!expert?.personalInfo?.image) return '/default-expert-avatar.png';
  
  // If it's already a full URL, return it
  if (expert.personalInfo.image.startsWith('http')) {
    return expert.personalInfo.image;
  }
  
  // Otherwise, assume it's a local path
  return expert.personalInfo.image.startsWith('/') 
    ? expert.personalInfo.image 
    : `/experts/${expert.personalInfo.image}`;
};

// Modify the normalizeExpert function to use this helper
const normalizeExpert = (expert) => {
  return {
    id: expert.id || Math.random().toString(36).substr(2, 9),
    name: expert.name || expert.fullName || expert.personalInfo?.fullName || '',
    title: expert.title || expert.personalInfo?.title || '',
    position: expert.position || expert.currentRole?.title || '',
    institution: expert.institution || expert.currentRole?.organization || '',
    department: expert.department || '',
    expertise: expert.expertise || [],
    publications: expert.publications || expert.academicMetrics?.publications?.total || 0,
    hIndex: expert.hIndex || 0,
    email: expert.email || expert.personalInfo?.email || '',
    phone: expert.phone || expert.personalInfo?.phone || '',
    description: expert.description || '',
    company_type: expert.company_type || '',
    employee_count: expert.employee_count || '',
    revenue_range: expert.revenue_range || '',
    address: expert.address || '',
    city: expert.city || '',
    state: expert.state || '',
    country: expert.country || '',
    postal_code: expert.postal_code || '',
    industry: expert.industry || '',
    founded: expert.founded || '',
    funding: expert.funding || '',
    url: expert.url || expert.profiles?.company || '',
    linkedin_url: expert.linkedin_url || expert.profiles?.linkedin || '',
    linkedin_followers: expert.linkedin_followers || '',
    twitter_url: expert.twitter_url || '',
    twitter_followers: expert.twitter_followers || '',
    facebook_url: expert.facebook_url || '',
    facebook_likes: expert.facebook_likes || '',
    technologies: expert.technologies || [],
    tags: expert.tags || [],
    personalInfo: {
      ...expert.personalInfo,
      image: getExpertImagePath(expert)
    },
    source: expert.source || ''
  };
};

export const loadExpertsData = async () => {
  try {
    const response = await fetch('/api/experts', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load experts');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading experts:', error);
    return []; // Return empty array instead of throwing
  }
};

export const saveExpertsData = async (expertsData) => {
  try {
    console.log('Saving experts data:', expertsData); // Debug log

    const response = await fetch('/api/experts', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expertsData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from server:', errorData); // Debug log
      throw new Error(errorData.error || 'Failed to save experts data');
    }

    const result = await response.json();
    console.log('Save response:', result); // Debug log
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save experts data');
    }

    return result;
  } catch (error) {
    console.error('Error saving experts data:', error);
    throw error;
  }
};

// Add this new function to load company data
export const loadCompanyData = async (companyId) => {
  try {
    // First try to load from API
    const response = await fetch(`/api/companies/${companyId}`);
    
    if (!response.ok) {
      throw new Error('Failed to load company data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading company data:', error);
    
    // Fallback to static data if API fails
    try {
      const response = await fetch(`/data/companies/${companyId.replace('comp_', '')}.json`);
      if (!response.ok) {
        throw new Error('Company data not found');
      }
      return await response.json();
    } catch (fallbackError) {
      console.error('Error loading fallback company data:', fallbackError);
      throw error;
    }
  }
};

// Add this new function to load all companies
export const loadCompanies = async () => {
  try {
    const response = await fetch('/api/companies');
    if (!response.ok) {
      throw new Error('Failed to load companies');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading companies:', error);
    return [];
  }
};
