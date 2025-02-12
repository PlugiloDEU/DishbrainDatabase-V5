// Remove fs and path imports as they're Node.js specific
let expertsCache = null;
let lastLoadTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const loadAllExperts = async (forceRefresh = false) => {
    // Return cached experts if available and not expired
    if (!forceRefresh && expertsCache && lastLoadTime && (Date.now() - lastLoadTime < CACHE_DURATION)) {
        return expertsCache;
    }

    try {
        // Fetch experts from an API endpoint instead of reading files directly
        const response = await fetch('/api/experts');
        if (!response.ok) {
            throw new Error('Failed to fetch experts');
        }
        const experts = await response.json();
        
        // Update cache
        expertsCache = experts;
        lastLoadTime = Date.now();
        
        return experts;
    } catch (error) {
        console.error('Error loading experts:', error);
        return expertsCache || []; // Fallback to cache if available
    }
};

// Add advanced search with scoring
export const searchExperts = (experts = [], query, filters = {}, options = {}) => {
    // Add safety check at the beginning
    if (!Array.isArray(experts)) {
        console.warn('searchExperts received invalid experts data:', experts);
        return [];
    }

    const {
        fuzzyMatch = true,
        maxResults = 100,
        sortBy = 'relevance'
    } = options;

    const results = experts.map(expert => {
        // Add null check for expert
        if (!expert || !expert.personalInfo || !expert.institution || !expert.expertise) {
            console.warn('Invalid expert data:', expert);
            return { expert, score: 0, matches: false };
        }

        let score = 0;
        const searchString = `
            ${expert.personalInfo.fullName?.toLowerCase() || ''}
            ${expert.institution.name?.toLowerCase() || ''}
            ${(expert.expertise.primary || []).join(' ').toLowerCase()}
            ${(expert.expertise.secondary || []).join(' ').toLowerCase()}
            ${(expert.expertise.industries || []).join(' ').toLowerCase()}
        `;

        if (query) {
            const queryLower = query.toLowerCase();
            if (expert.personalInfo.fullName?.toLowerCase().includes(queryLower)) score += 10;
            if (expert.institution.name?.toLowerCase().includes(queryLower)) score += 5;
            
            // Add null checks for arrays
            (expert.expertise.primary || []).forEach(exp => {
                if (exp?.toLowerCase().includes(queryLower)) score += 3;
            });
            (expert.expertise.secondary || []).forEach(exp => {
                if (exp?.toLowerCase().includes(queryLower)) score += 2;
            });

            if (fuzzyMatch && !score) {
                const words = queryLower.split(' ');
                words.forEach(word => {
                    if (searchString.includes(word)) score += 1;
                });
            }
        }

        // Add null checks for filter matching
        const matchesExpertise = !filters.expertise?.length || 
            (expert.expertise.primary || []).some(exp => filters.expertise.includes(exp)) ||
            (expert.expertise.secondary || []).some(exp => filters.expertise.includes(exp));

        const matchesIndustry = !filters.industry?.length ||
            (expert.expertise.industries || []).some(ind => filters.industry.includes(ind));

        const matchesLocation = !filters.location ||
            expert.institution.location === filters.location;

        const matchesLanguage = !filters.language?.length ||
            (expert.personalInfo.languages || []).some(lang => filters.language.includes(lang));

        const matches = (!query || score > 0) && 
            matchesExpertise && 
            matchesIndustry && 
            matchesLocation &&
            matchesLanguage;

        return { expert, score, matches };
    });

    return results
        .filter(r => r.matches)
        .sort((a, b) => {
            if (sortBy === 'relevance') return b.score - a.score;
            if (sortBy === 'name') {
                return (a.expert.personalInfo.fullName || '').localeCompare(b.expert.personalInfo.fullName || '');
            }
            if (sortBy === 'institution') {
                return (a.expert.institution.name || '').localeCompare(b.expert.institution.name || '');
            }
            return 0;
        })
        .slice(0, maxResults)
        .map(r => r.expert);
};

// Add statistics gathering
export const getExpertStats = (experts) => {
    const stats = {
        total: experts.length,
        byInstitution: {},
        byExpertise: {},
        byIndustry: {},
        byLocation: {},
        byLanguage: {},
        professorCount: 0,
        researcherCount: 0
    };

    experts.forEach(expert => {
        // Count by institution
        stats.byInstitution[expert.institution.name] = (stats.byInstitution[expert.institution.name] || 0) + 1;

        // Count by expertise
        expert.expertise.primary.forEach(exp => {
            stats.byExpertise[exp] = (stats.byExpertise[exp] || 0) + 1;
        });

        // Count by industry
        expert.expertise.industries.forEach(ind => {
            stats.byIndustry[ind] = (stats.byIndustry[ind] || 0) + 1;
        });

        // Count by location
        stats.byLocation[expert.institution.location] = (stats.byLocation[expert.institution.location] || 0) + 1;

        // Count by language
        expert.personalInfo.languages.forEach(lang => {
            stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;
        });

        // Count by position
        if (expert.currentRole.title.includes('Professor')) {
            stats.professorCount++;
        } else {
            stats.researcherCount++;
        }
    });

    return stats;
};

// Keep existing helper functions
export const getExpertiseAreas = (experts) => {
    const areas = new Set();
    experts.forEach(expert => {
        expert.expertise.primary.forEach(area => areas.add(area));
        expert.expertise.secondary.forEach(area => areas.add(area));
    });
    return Array.from(areas).sort();
};

export const getIndustries = (experts) => {
    const industries = new Set();
    experts.forEach(expert => {
        expert.expertise.industries.forEach(industry => industries.add(industry));
    });
    return Array.from(industries).sort();
};

export const getLocations = (experts) => {
    const locations = new Set();
    experts.forEach(expert => {
        locations.add(expert.institution.location);
    });
    return Array.from(locations).sort();
};

// Add new function to get languages
export const getLanguages = (experts) => {
    const languages = new Set();
    experts.forEach(expert => {
        expert.personalInfo.languages.forEach(lang => languages.add(lang));
    });
    return Array.from(languages).sort();
}; 