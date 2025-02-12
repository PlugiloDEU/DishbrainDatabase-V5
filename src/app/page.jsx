"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import ItemInventoryManager from "../components/item-inventory-manager";
import PaymentRemindersModule from "../components/payment-reminders-module";
import TaxCalculationModule from "../components/tax-calculation-module";
import Component3DButtonDesign from "../components/component-3-d-button-design";
import PayrollManager from "../components/payroll-manager";
import { loadExpertsData, saveExpertsData, loadExpertsInChunks, loadMoreExperts, loadCompanies } from '../utils/dataLoader';
import ExpertDetailsPopup from '../components/expert-details-popup';
import Pagination from '../components/common/pagination';
import CompanyDetailsPopup from '../components/company-details-popup';
import ExpertFormPopup from '../components/expert-form-popup';
import CompanyFormPopup from '../components/company-form-popup';
import { toast } from 'react-hot-toast';
import ExportButton from '@/components/export-button';
import ExpertCard from '../components/expert-card';
import { motion } from 'framer-motion';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23CBD5E0' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

function AdvancedSearchModal({ onClose, onSearch }) {
  const [filters, setFilters] = useState({
    name: '',
    expertise: '',
    institution: '',
    location: '',
    technologies: '',
    researchAreas: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-800 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-100">Suche</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Name des Experten"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Expertise
            </label>
            <input
              type="text"
              className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="z.B. Machine Learning, NLP"
              value={filters.expertise}
              onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Institution
            </label>
            <input
              type="text"
              className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Universität oder Firma"
              value={filters.institution}
              onChange={(e) => setFilters({ ...filters, institution: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Standort
            </label>
            <input
              type="text"
              className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Stadt oder Land"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Technologien
            </label>
            <input
              type="text"
              className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="z.B. Python, TensorFlow"
              value={filters.technologies}
              onChange={(e) => setFilters({ ...filters, technologies: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Forschungsgebiete
            </label>
            <input
              type="text"
              className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="z.B. Computer Vision, Robotik"
              value={filters.researchAreas}
              onChange={(e) => setFilters({ ...filters, researchAreas: e.target.value })}
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-900 to-blue-800 text-blue-100 rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-900/20"
            >
              Suchen
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper function to ensure expertise is always an array
const getExpertiseArray = (expert) => {
  if (!expert.expertise) return [];
  if (Array.isArray(expert.expertise)) return expert.expertise;
  if (typeof expert.expertise === 'string') return [expert.expertise];
  return [];
};

// Update the getTopCategories function
const getTopCategories = (experts) => {
  const categoryCount = {};
  
  experts.forEach(expert => {
    const expertiseArray = getExpertiseArray(expert);
    expertiseArray.forEach(category => {
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
  });

  // Convert to array and sort by count
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([category, count]) => ({
      category,
      count
    }));
};

const renderCompanyField = (label, value, icon) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <i className={`fas fa-${icon} text-gray-400 w-5`}></i>
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className="text-gray-700">
        {value || 'Nicht angegeben'}
      </span>
    </div>
  );
};

const getCompanyLogo = (domain) => {
  if (!domain) return null;
  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
  return `https://logo.clearbit.com/${cleanDomain}`;
};

const getImageUrl = (expert) => {
  if (!expert) return DEFAULT_AVATAR;
  
  // If it's already a full URL, use it
  if (expert.image_url?.startsWith('http')) {
    return expert.image_url;
  }
  
  // Check for image in personalInfo
  if (expert.personalInfo?.image?.startsWith('/')) {
    return `${window.location.origin}${expert.personalInfo.image}`;
  }
  
  if (expert.personalInfo?.imageUrl?.startsWith('/')) {
    return `${window.location.origin}${expert.personalInfo.imageUrl}`;
  }
  
  // Fallback to default avatar
  return DEFAULT_AVATAR;
};

const renderExpertCard = (expert, setSelectedExpert) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:border-blue-500/30"
  >
    <div className="flex items-start space-x-4">
      {/* Expert Image - Updated with new image handling */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <img
          src={getImageUrl(expert)}
          alt={expert.name}
          className="w-full h-full object-cover rounded-lg ring-2 ring-blue-500/20 shadow-lg"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_AVATAR;
          }}
        />
        {expert.sources?.image?.license && (
          <div className="absolute bottom-0 right-0 bg-black/50 text-xs text-white px-1 rounded">
            <i className="fas fa-camera mr-1"></i>
            {expert.sources.image.license}
          </div>
        )}
      </div>

      {/* Expert Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          {expert.name}
        </h3>
        <p className="text-sm text-gray-400 mt-1">{expert.position}</p>
        <p className="text-sm text-gray-500">{expert.organisation}</p>

        {/* Expertise Tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          {getExpertiseArray(expert).slice(0, 3).map((item, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs rounded-full bg-blue-900/30 text-blue-400 border border-blue-800/50 shadow-inner"
            >
              {item}
            </span>
          ))}
          {getExpertiseArray(expert).length > 3 && (
            <span className="text-gray-500 text-xs">
              +{getExpertiseArray(expert).length - 3} weitere
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setSelectedExpert(expert)}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-900 to-blue-800 text-blue-100 rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-900/20 text-sm flex items-center gap-2"
          >
            <i className="fas fa-info-circle"></i>
            Details
          </button>
          <button
            onClick={() => handleContactExpert(expert)}
            className="px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg shadow-gray-900/20 text-sm flex items-center gap-2"
          >
            <i className="fas fa-envelope"></i>
            Kontakt
          </button>
        </div>
      </div>

      {/* Verification Badge */}
      {expert.verified && (
        <div className="absolute top-4 right-4">
          <i className="fas fa-check-circle text-blue-500"></i>
        </div>
      )}
    </div>

    {/* Data Quality Indicator */}
    <div className="mt-4 pt-4 border-t border-gray-800/50">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Datenqualität</span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
              style={{ width: `${expert.data_quality?.completeness * 100}%` }}
            ></div>
          </div>
          <span className="text-blue-400">
            {Math.round(expert.data_quality?.completeness * 100)}%
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

const renderSearchField = (label, value, onChange, placeholder) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2 bg-gradient-to-br from-gray-900 to-black rounded-lg border border-gray-800/50 text-gray-100 placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 shadow-inner transition-all duration-300"
    />
  </div>
);

const renderFilterTag = (label, onRemove) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900/30 text-blue-400 border border-blue-800/50">
    {label}
    <button
      onClick={onRemove}
      className="ml-2 text-blue-400 hover:text-blue-300 focus:outline-none"
    >
      <i className="fas fa-times"></i>
    </button>
  </span>
);

const Page = () => {
  const [showAddExpertPopup, setShowAddExpertPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [experts, setExperts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expertsPerPage] = useState(9);
  const [isLoadingExperts, setIsLoadingExperts] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [newsItems, setNewsItems] = useState([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [recentActivity] = useState([
    {
      action: "New expert profile added: Dr. Sarah Chen",
      timestamp: "2 minutes ago"
    },
    {
      action: "AI enrichment completed for 23 profiles",
      timestamp: "15 minutes ago"
    },
    {
      action: "New company added: AI Solutions GmbH",
      timestamp: "1 hour ago"
    },
    {
      action: "Expert profile updated: Prof. Michael Schmidt",
      timestamp: "2 hours ago"
    }
  ]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalExperts, setTotalExperts] = useState(0);
  const [offset, setOffset] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [showAdvancedCompanySearch, setShowAdvancedCompanySearch] = useState(false);
  const [showAddCompanyPopup, setShowAddCompanyPopup] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
    { id: 'experts', label: 'KI Experten', icon: 'fas fa-users' },
    { id: 'office', label: 'Büro Tools', icon: 'fas fa-toolbox' },
    { id: 'development', label: 'Entwicklung', icon: 'fas fa-code' },
    { id: 'firms', label: 'KI Firmen', icon: 'fas fa-building' }
  ];

  const handleMenuClick = (moduleId) => {
    setActiveModule(moduleId);
  };

  const handleGeneralSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setFilteredExperts(experts);
      return;
    }

    setIsSearching(true);
    try {
      // If searching, load all experts first
      if (hasMore) {
        const allExperts = await loadExpertsData();
        setExperts(allExperts);
        setHasMore(false);
      }

      const results = experts.filter(expert => {
        const searchLower = searchQuery.toLowerCase();
        return (
          expert.personalInfo?.fullName?.toLowerCase().includes(searchLower) ||
          expert.name?.toLowerCase().includes(searchLower) ||
          expert.institution?.toLowerCase().includes(searchLower) ||
          expert.expertise?.some(exp => exp.toLowerCase().includes(searchLower)) ||
          expert.position?.toLowerCase().includes(searchLower)
        );
      });

      setFilteredExperts(results);
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsSearching(false);
    }
  }, [experts, searchQuery, hasMore]);

  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
      handleGeneralSearch();
    }, 300),
    [handleGeneralSearch]
  );

  const handleEnrichment = async () => {
    // Add your AI enrichment logic here
    console.log("Running AI enrichment...");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdvancedSearch = (filters) => {
    const searchTerms = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value.trim()) {
        acc[key] = value.toLowerCase().trim();
      }
      return acc;
    }, {});

    if (Object.keys(searchTerms).length === 0) {
      setFilteredExperts(experts);
      return;
    }

    const getExpertiseArray = (expert) => {
      if (Array.isArray(expert.expertise)) {
        return expert.expertise;
      }
      if (expert.expertise?.primary) {
        return expert.expertise.primary;
      }
      return [];
    };

    const results = experts.filter(expert => {
      return Object.entries(searchTerms).every(([key, term]) => {
        switch (key) {
          case 'name':
            return (
              expert.personalInfo?.fullName?.toLowerCase().includes(term) ||
              expert.name?.toLowerCase().includes(term)
            );
          
          case 'expertise':
            const expertiseArray = getExpertiseArray(expert);
            return expertiseArray.some(exp => 
              exp.toLowerCase().includes(term)
            ) || expert.research_areas?.some(area => 
              area.toLowerCase().includes(term)
            );
          
          case 'institution':
            return (
              expert.institution?.toLowerCase().includes(term) ||
              expert.company?.toLowerCase().includes(term)
            );
          
          case 'location':
            return (
              expert.city?.toLowerCase().includes(term) ||
              expert.country?.toLowerCase().includes(term)
            );
          
          case 'technologies':
            return expert.technologies?.some?.(tech => 
              tech.toLowerCase().includes(term)
            ) || false;
          
          case 'researchAreas':
            return expert.research_areas?.some?.(area => 
              area.toLowerCase().includes(term)
            ) || false;
          
          default:
            return true;
        }
      });
    });

    setFilteredExperts(results);
    
    // Show feedback about search results
    if (results.length === 0) {
      toast.info('Keine Experten gefunden');
    } else {
      toast.success(`${results.length} Experten gefunden`);
    }
  };

  const handleExpertUpdate = async (updatedExpert) => {
    try {
      toast.loading('Aktualisiere Experten...', { id: 'updateExpert' });

      const response = await fetch('/api/experts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updatedExpert,
          personalInfo: {
            ...updatedExpert.personalInfo,
            imageUrl: updatedExpert.personalInfo?.imageUrl // Ensure imageUrl is included
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update expert');
      }

      // Update the experts list with the new data
      setExperts(prevExperts => 
        prevExperts.map(expert => 
          expert.id === updatedExpert.id ? updatedExpert : expert
        )
      );
      setFilteredExperts(prevExperts => 
        prevExperts.map(expert => 
          expert.id === updatedExpert.id ? updatedExpert : expert
        )
      );
      
      // Update the selected expert
      setSelectedExpert(updatedExpert);

      toast.success('Experte wurde aktualisiert', { id: 'updateExpert' });
    } catch (error) {
      console.error('Error updating expert:', error);
      toast.error(error.message || 'Fehler beim Aktualisieren', { id: 'updateExpert' });
    }
  };

  const handleExpertClick = (expert) => {
    console.log('Selected expert:', expert);
    setSelectedExpert(expert);
  };

  const loadMore = async () => {
    if (!hasMore || isLoadingExperts) return;

    setIsLoadingExperts(true);
    try {
      const { experts: moreExperts, hasMore: moreAvailable } = await loadMoreExperts(offset, 10);
      setExperts(prev => [...prev, ...moreExperts]);
      setFilteredExperts(prev => [...prev, ...moreExperts]);
      setHasMore(moreAvailable);
      setOffset(prev => prev + moreExperts.length);
    } catch (error) {
      console.error('Error loading more experts:', error);
    } finally {
      setIsLoadingExperts(false);
    }
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
  };

  const debouncedCompanySearch = useCallback(
    debounce((query) => {
      setCompanySearchQuery(query);
      // Implement company search logic here
    }, 300),
    []
  );

  const handleCompanyUpdate = async (updatedCompany) => {
    try {
      toast.loading('Aktualisiere Firma...', { id: 'updateCompany' });

      const response = await fetch('/api/companies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCompany),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update company');
      }

      // Update the companies list with the new data
      setCompanies(prevCompanies => 
        prevCompanies.map(company => 
          company.id === updatedCompany.id ? updatedCompany : company
        )
      );
      setFilteredCompanies(prevCompanies => 
        prevCompanies.map(company => 
          company.id === updatedCompany.id ? updatedCompany : company
        )
      );

      toast.success('Firma wurde aktualisiert', { id: 'updateCompany' });
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error(error.message || 'Fehler beim Aktualisieren', { id: 'updateCompany' });
    }
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI Expert Search Stats */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-100">KI Experten Analyse</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Gesamt Experten</span>
                  <span className="font-bold text-blue-400">{experts.length}</span>
                </div>
                
                {/* Top 5 Categories */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Top 5 Kategorien</h4>
                  <div className="space-y-2">
                    {getTopCategories(experts).map(({ category, count }, index) => (
                      <div key={category} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-sm text-gray-600">{category}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 bg-blue-100 rounded-full w-24 overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ 
                                  width: `${(count / experts.length) * 100}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {count}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Neu diese Woche</span>
                  <span className="font-bold text-purple-400">12</span>
                </div>
                <Component3DButtonDesign onClick={() => setActiveModule('experts')}>
                  Alle Experten anzeigen
                </Component3DButtonDesign>
              </div>
            </div>

            {/* AI Company Stats */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-100">KI Unternehmen</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Gesamt Unternehmen</span>
                  <span className="font-bold text-blue-400">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Top Branche</span>
                  <span className="font-bold text-green-400">GesundheitsTech</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Neue Startups</span>
                  <span className="font-bold text-purple-400">8</span>
                </div>
                <Component3DButtonDesign onClick={() => setActiveModule('firms')}>
                  Alle Unternehmen anzeigen
                </Component3DButtonDesign>
              </div>
            </div>

            {/* AI Enrichment Module */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-100">AI Enrichment</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400">AI Agent Status: Active</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Recent Enrichments:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Expert profiles updated: 23</li>
                    <li>New connections found: 45</li>
                    <li>Publications added: 12</li>
                  </ul>
                </div>
                <Component3DButtonDesign onClick={() => handleEnrichment()}>
                  Run AI Enrichment
                </Component3DButtonDesign>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-100">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 text-sm">
                    <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-100">{activity.action}</p>
                      <p className="text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Search */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-100">Quick Search</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  id="search-input"
                  name="search"
                  placeholder="Search experts or companies..."
                  className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-md text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    #MachineLearning
                  </button>
                  <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    #AI
                  </button>
                  <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    #Robotics
                  </button>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-100">AI Insights</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    Trending: Increased activity in Natural Language Processing sector
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    New collaboration opportunities detected between 5 experts
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    3 experts recently published papers in Computer Vision
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'experts':
        return (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-100">KI Experten</h1>
                <button
                  onClick={() => setShowAddExpertPopup(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <i className="fas fa-user-plus mr-2"></i>
                  Experte hinzufügen
                </button>
              </div>
                
              {/* Simplified Search UI */}
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-4 shadow-md">
                <div className="flex gap-4">
                    <button
                    onClick={() => setShowAdvancedSearch(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                          <i className="fas fa-search mr-2"></i>
                    Suche
                    </button>
                  </div>
                </div>

                {showAdvancedSearch && (
                  <AdvancedSearchModal
                    onClose={() => setShowAdvancedSearch(false)}
                    onSearch={handleAdvancedSearch}
                  />
                )}
              </div>

              {/* Results Section */}
              {isLoadingExperts ? (
                <div className="text-center py-8 min-h-[200px] flex flex-col items-center justify-center">
                  <div className="mb-4">
                    <i className="fas fa-circle-notch fa-spin text-blue-500 text-3xl"></i>
                  </div>
                  <p className="text-gray-600">Experten werden geladen...</p>
                </div>
              ) : filteredExperts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600 mb-4">Keine Experten gefunden</p>
                <button
                  onClick={() => setShowAddExpertPopup(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Experte hinzufügen
                </button>
                </div>
              ) : (
                <>
                  {/* Grid of expert cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExperts
                      .slice((currentPage - 1) * expertsPerPage, currentPage * expertsPerPage)
                      .map((expert) => (
                        <div key={expert.id || expert.name}>
                          {renderExpertCard(expert, setSelectedExpert)}
                        </div>
                      ))}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredExperts.length / expertsPerPage)}
                    onPageChange={handlePageChange}
                  />

                  {/* Add this before the pagination */}
                  {hasMore && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={loadMore}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        disabled={isLoadingExperts}
                      >
                        {isLoadingExperts ? (
                          <>
                            <span className="animate-spin">⌛</span>
                            Lade weitere Experten...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus"></i>
                            Weitere Experten laden
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
          </div>
        );
      case 'office':
        return (
          <div className="p-6">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-100">Office Tools</h2>
              {/* Add your office tools content here */}
            </div>
          </div>
        );
      case 'development':
        return (
          <div className="p-6">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-100">Entwicklung</h2>
              {/* Add your development content here */}
            </div>
          </div>
        );
      case 'firms':
        return (
          <div className="p-6">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-100">KI Firmen</h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowAddCompanyPopup(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i>
                    Firma hinzufügen
                  </button>
                  <button
                    onClick={handleEnrichment}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-magic"></i>
                    KI Anreicherung
                  </button>
                </div>
              </div>

              {/* Search Section */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Suche nach Firmen, Technologien oder Standorten..."
                    className="w-full p-4 pl-12 pr-4 rounded-lg border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={companySearchQuery}
                    onChange={(e) => {
                      setCompanySearchQuery(e.target.value);
                      debouncedCompanySearch(e.target.value);
                    }}
                  />
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={() => setShowAdvancedCompanySearch(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <i className="fas fa-sliders-h"></i>
                    Erweiterte Suche
                  </button>
                  <span className="text-sm text-gray-500">
                    {companies.length} Firmen gefunden
                  </span>
                </div>
              </div>

              {/* Companies Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <div 
                    key={company.id}
                    className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-800/50"
                  >
                    {/* Header with Logo and Name */}
                    <div className="flex items-center gap-4 mb-4">
                      {company.domain ? (
                        <img 
                          src={getCompanyLogo(company.domain)}
                          alt={company.name}
                          className="w-16 h-16 rounded-full object-contain bg-white p-1 border border-gray-800 shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-company-logo.png';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-building text-blue-500 text-2xl"></i>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-100">{company.name}</h3>
                        <p className="text-gray-400">{company.legal_name || 'Rechtlicher Name nicht angegeben'}</p>
                      </div>
                    </div>

                    {/* Company Information */}
                    <div className="space-y-3">
                      {/* Basic Info */}
                      <div className="space-y-2">
                        {renderCompanyField('Branche', company.industry, 'industry')}
                        {renderCompanyField('Typ', company.company_type, 'building')}
                        {renderCompanyField('Gründung', company.founded_year, 'calendar')}
                        {renderCompanyField('Mitarbeiter', company.employee_count, 'users')}
                        {renderCompanyField('Umsatz', company.revenue_range, 'chart-line')}
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        {renderCompanyField('Stadt', company.city, 'map-marker-alt')}
                        {renderCompanyField('Land', company.country, 'globe')}
                        {company.street_address && renderCompanyField('Adresse', company.street_address, 'location-arrow')}
                      </div>

                      {/* Description */}
                      <div className="mt-3">
                        <p className="text-gray-300 line-clamp-2">
                          {company.description || 'Keine Beschreibung verfügbar'}
                        </p>
                      </div>

                      {/* Technologies */}
                      <div className="space-y-1">
                        <span className="text-sm text-gray-400 font-medium">Technologien:</span>
                        <div className="flex flex-wrap gap-2">
                          {company.technologies && company.technologies.length > 0 ? (
                            <>
                              {company.technologies.slice(0, 3).map((tech, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                                >
                                  {tech}
                                </span>
                              ))}
                              {company.technologies.length > 3 && (
                                <span className="text-gray-500 text-xs">
                                  +{company.technologies.length - 3} weitere
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-500 text-sm">Keine Technologien angegeben</span>
                          )}
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="space-y-2">
                        {company.email && renderCompanyField('Email', company.email, 'envelope')}
                        {company.phone && renderCompanyField('Telefon', company.phone, 'phone')}
                        {company.url && renderCompanyField('Website', 
                          <a 
                            href={company.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {company.url}
                          </a>, 
                          'globe'
                        )}
                      </div>

                      {/* Social Media */}
                      <div className="flex flex-wrap gap-3">
                        {company.linkedin_url && (
                          <a 
                            href={company.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <i className="fab fa-linkedin text-lg"></i>
                          </a>
                        )}
                        {company.twitter_url && (
                          <a 
                            href={company.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-500"
                          >
                            <i className="fab fa-twitter text-lg"></i>
                          </a>
                        )}
                        {company.facebook_url && (
                          <a 
                            href={company.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <i className="fab fa-facebook text-lg"></i>
                          </a>
                        )}
                      </div>

                      {/* More Info Button */}
                      <button
                        onClick={() => handleCompanyClick(company)}
                        className="mt-4 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-info-circle"></i>
                        Mehr Informationen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-6">Select a module</div>;
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingExperts(true);
      setLoadError(null);
      
      try {
        const [expertsData, companiesData] = await Promise.all([
          loadExpertsData(),
          loadCompanies()
        ]);

        if (expertsData.length === 0) {
          setLoadError('Keine Experten gefunden');
        }

        setExperts(expertsData);
        setFilteredExperts(expertsData);
        setCompanies(companiesData);
        setFilteredCompanies(companiesData);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoadError('Fehler beim Laden der Daten');
        toast.error('Fehler beim Laden der Daten');
      } finally {
        setIsLoadingExperts(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadCompanyData = async () => {
      const data = await loadCompanies();
      setCompanies(data);
    };

    if (activeModule === 'firms') {
      loadCompanyData();
    }
  }, [activeModule]);

  // Update the loading UI
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Experten werden geladen...</p>
      {loadError && (
        <p className="text-red-500 mt-2">
          {loadError}
          <button 
            onClick={() => window.location.reload()}
            className="ml-2 text-blue-600 hover:underline"
          >
            Neu laden
          </button>
        </p>
      )}
    </div>
  );

  return (
    <div className="font-cabin min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100">
      <nav className="bg-gradient-to-br from-gray-900 to-black border-b border-gray-800/50 shadow-xl backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                AI Expert DB
              </span>
            </div>

            <div className="flex">
              {menuItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
                    activeModule === item.id
                      ? 'border-blue-500 text-blue-400 bg-gray-800/30'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/20'
                  }`}
                >
                  <i className={`${item.icon} mr-2`}></i>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-200 relative"
              >
                <i className="fas fa-bell"></i>
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-blue-500 text-white text-xs text-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {isLoadingExperts ? renderLoading() : renderContent()}
      </main>

      {showNotifications && (
        <div className="fixed top-16 right-4 w-80 bg-gradient-to-br from-gray-900 to-black rounded-lg border border-gray-800 shadow-xl backdrop-blur-sm">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification, index) => (
              <div key={index} className="p-4 border-b hover:bg-gray-800">
                <p className="text-sm text-gray-400">{notification.message}</p>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No new notifications
              </div>
            )}
          </div>
        </div>
      )}

      {showAddExpertPopup && (
        <ExpertFormPopup
          onClose={() => setShowAddExpertPopup(false)}
          onSubmit={async (expertData) => {
            try {
              // Show immediate feedback
              toast.loading('Speichere Experten...', { id: 'saveExpert' });

              // Make the API call to create the expert
              const response = await fetch('/api/experts', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(expertData),
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Fehler beim Erstellen des Experten');
              }

              // Update UI immediately with new expert
              setExperts(prev => [...prev, expertData]);
              setFilteredExperts(prev => [...prev, expertData]);
              
              // Close the popup immediately
              setShowAddExpertPopup(false);

              // Show success message
              toast.success(`Experte ${expertData.name} wurde gespeichert`, { id: 'saveExpert' });

              // Refresh the list in background
              loadExpertsData().then(updatedExperts => {
                setExperts(updatedExperts);
                setFilteredExperts(updatedExperts);
              });

            } catch (error) {
              console.error('Error creating expert:', error);
              toast.error(error.message || 'Fehler beim Speichern', { id: 'saveExpert' });
              throw error;
            }
          }}
        />
      )}

      {selectedExpert && (
        <ExpertDetailsPopup
          expert={selectedExpert}
          onClose={() => setSelectedExpert(null)}
          onUpdate={handleExpertUpdate}
        />
      )}

      {selectedCompany && (
        <CompanyDetailsPopup
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onUpdate={handleCompanyUpdate}
        />
      )}

      {showAddCompanyPopup && (
        <CompanyFormPopup
          onClose={() => setShowAddCompanyPopup(false)}
          onSubmit={async (companyData) => {
            try {
              const response = await fetch('/api/companies', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(companyData),
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create company');
              }

              // Get the response
              const result = await response.json();
              console.log('Company created:', result); // Add this for debugging

              // Refresh the companies list
              const updatedCompanies = await loadCompanies();
              setCompanies(updatedCompanies);
              setFilteredCompanies(updatedCompanies);
              
              // Show success notification
              toast.success(`Firma ${companyData.name} wurde erfolgreich erstellt`);
              
              // Close the popup
              setShowAddCompanyPopup(false);

            } catch (error) {
              console.error('Error creating company:', error);
              toast.error(error.message || 'Failed to create company');
              throw error;
            }
          }}
        />
      )}

      <div className="flex justify-end p-4">
        <ExportButton />
      </div>
    </div>
  );
};

export default Page;
