import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CompanyResearchPopup = ({ company, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [researchData, setResearchData] = useState(null);
  const [selectedData, setSelectedData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!company?.url) {
      setError('Keine URL für die Recherche verfügbar');
      setIsLoading(false);
      return;
    }
    fetchCompanyData(company.url);
  }, [company]);

  const fetchCompanyData = async (url) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/research/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentData: { url }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Fehler beim Laden der Daten');
      }

      // Parse Gemini's response into structured data
      const parsedData = parseGeminiResponse(data.enriched);
      setResearchData(parsedData);
    } catch (error) {
      console.error('Error fetching company data:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const extractValue = (text, field) => {
    try {
      // Look for the field in the text
      const regex = new RegExp(`\\*\\*${field}:\\*\\* ([^\\n]+)`, 'i');
      const match = text.match(regex);
      if (match) {
        return match[1].trim();
      }

      // Try alternative format
      const regex2 = new RegExp(`- ${field}: ([^\\n]+)`, 'i');
      const match2 = text.match(regex2);
      if (match2) {
        return match2[1].trim();
      }

      return null;
    } catch (error) {
      console.error(`Error extracting ${field}:`, error);
      return null;
    }
  };

  const normalizeValue = (value, type) => {
    if (!value || value === 'Not provided' || value === 'Nicht angegeben' || value === 'N/A') {
      return null;
    }

    switch (type) {
      case 'number':
        // Extract numbers from strings like "Approx. 221,000" or "$211.9 billion USD"
        const numberMatch = value.match(/[\d,.]+/);
        if (numberMatch) {
          return parseFloat(numberMatch[0].replace(/,/g, ''));
        }
        return null;

      case 'currency':
        // Extract currency values and convert to number
        const currencyMatch = value.match(/[\d,.]+/);
        if (currencyMatch) {
          const number = parseFloat(currencyMatch[0].replace(/,/g, ''));
          // Convert billions/millions to full numbers
          if (value.toLowerCase().includes('billion')) {
            return number * 1e9;
          }
          if (value.toLowerCase().includes('million')) {
            return number * 1e6;
          }
          return number;
        }
        return null;

      case 'year':
        const yearMatch = value.match(/\d{4}/);
        return yearMatch ? parseInt(yearMatch[0]) : null;

      case 'url':
        if (!value.startsWith('http')) {
          return `https://${value}`;
        }
        return value;

      case 'array':
        if (typeof value === 'string') {
          return value.split(/,\s*/).filter(Boolean);
        }
        return Array.isArray(value) ? value : null;

      default:
        return value;
    }
  };

  const parseGeminiResponse = (text) => {
    return {
      company_info: {
        legal_name: extractValue(text, 'Legal Name'),
        company_type: extractValue(text, 'Company Type'),
        industry: extractValue(text, 'Industry'),
        industry_group: extractValue(text, 'Industry Group'),
        sector: extractValue(text, 'Sector'),
        sub_industry: extractValue(text, 'Sub-Industry'),
        gics_code: extractValue(text, 'GICS Code'),
        founded_year: normalizeValue(extractValue(text, 'Year Founded'), 'year'),
        employee_count: normalizeValue(extractValue(text, 'Number of Employees'), 'number'),
        revenue_range: extractValue(text, 'Revenue Range'),
        description: extractValue(text, 'Description'),
      },
      location: {
        address: extractValue(text, 'Address'),
        city: extractValue(text, 'City'),
        state: extractValue(text, 'State/Province'),
        country: extractValue(text, 'Country'),
        postal_code: extractValue(text, 'Zip Code'),
      },
      contact: {
        phone: extractValue(text, 'Phone'),
        email: extractValue(text, 'Email'),
        website: normalizeValue(extractValue(text, 'Website'), 'url'),
      },
      financials: {
        annual_revenue: normalizeValue(extractValue(text, 'Annual Revenue'), 'currency'),
        market_cap: normalizeValue(extractValue(text, 'Market Cap'), 'currency'),
        investments: normalizeValue(extractValue(text, 'Investments'), 'currency'),
      },
      social_media: {
        linkedin: normalizeValue(extractValue(text, 'LinkedIn'), 'url'),
        twitter: normalizeValue(extractValue(text, 'Twitter'), 'url'),
        facebook: normalizeValue(extractValue(text, 'Facebook'), 'url'),
      },
      tech_stack: {
        technologies: normalizeValue(extractValue(text, 'Technologies'), 'array'),
        categories: normalizeValue(extractValue(text, 'Tech Categories'), 'array'),
        tags: normalizeValue(extractValue(text, 'Tags'), 'array'),
      }
    };
  };

  const handleSave = async () => {
    try {
      await onSave(selectedData);
      toast.success('Daten erfolgreich aktualisiert');
      onClose();
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Fehler beim Speichern der Daten');
    }
  };

  const toggleSelection = (category, field, value) => {
    setSelectedData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">KI-Recherche: {company?.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p className="text-gray-600">Recherchiere Unternehmensdaten...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => fetchCompanyData(company?.url)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Erneut versuchen
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(researchData || {}).map(([category, fields]) => (
              <section key={category} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">
                  <i className={`fas fa-${getCategoryIcon(category)} text-blue-500 mr-2`}></i>
                  {formatCategory(category)}
                </h3>
                <div className="space-y-2">
                  {Object.entries(fields).map(([field, value]) => (
                    <div key={field} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`${category}-${field}`}
                        checked={selectedData[category]?.[field] === value}
                        onChange={() => toggleSelection(category, field, value)}
                        className="rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label 
                        htmlFor={`${category}-${field}`} 
                        className="flex-1 flex justify-between items-center hover:bg-gray-100 p-2 rounded cursor-pointer"
                      >
                        <span className="font-medium">{formatFieldName(field)}:</span>
                        <span className="ml-2 text-gray-700">
                          {formatValue(value, field)}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-4 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  Object.entries(researchData || {}).forEach(([category, fields]) => {
                    Object.keys(fields).forEach(field => {
                      toggleSelection(category, field, fields[field]);
                    });
                  });
                }}
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                Alle auswählen
              </button>
              <button
                onClick={handleSave}
                disabled={Object.keys(selectedData).length === 0}
                className={`px-4 py-2 rounded-lg ${
                  Object.keys(selectedData).length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Ausgewählte Daten übernehmen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getCategoryIcon = (category) => {
  const icons = {
    'company_type': 'building',
    'social_media': 'share-alt',
    'technologies': 'microchip',
    'metrics': 'chart-line',
    'contact': 'address-card',
    'location': 'map-marker-alt',
    'ai_enrichment': 'robot',
    'market_insights': 'chart-pie',
    'tech_stack': 'layer-group',
    'key_metrics': 'tachometer-alt',
    'trust_score': 'shield-alt',
    'sources': 'link',
    'funding': 'hand-holding-usd',
    'employee_count': 'users',
    'revenue_range': 'money-bill-wave',
    'industry': 'industry'
  };
  return icons[category] || 'info-circle';
};

const formatCategory = (category) => {
  const translations = {
    'company_type': 'Unternehmenstyp',
    'social_media': 'Social Media',
    'technologies': 'Technologien',
    'metrics': 'Kennzahlen',
    'contact': 'Kontakt',
    'location': 'Standort',
    'ai_enrichment': 'KI-Anreicherung',
    'market_insights': 'Markteinblicke',
    'tech_stack': 'Technologie-Stack',
    'key_metrics': 'Wichtige Kennzahlen',
    'trust_score': 'Vertrauenswürdigkeit',
    'sources': 'Quellen',
    'funding': 'Finanzierung',
    'employee_count': 'Mitarbeiter',
    'revenue_range': 'Umsatzbereich',
    'industry': 'Branche'
  };
  return translations[category] || category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const formatFieldName = (field) => {
  const translations = {
    // Basic info
    'company_type': 'Unternehmenstyp',
    'employee_count': 'Mitarbeiter',
    'revenue_range': 'Umsatzbereich',
    'address': 'Adresse',
    'city': 'Stadt',
    'state': 'Bundesland',
    'country': 'Land',
    'postal_code': 'PLZ',
    'industry': 'Branche',
    'founded': 'Gründungsjahr',
    'funding': 'Finanzierung',
    'url': 'Website',

    // Social media
    'linkedin_url': 'LinkedIn',
    'linkedin_followers': 'LinkedIn Follower',
    'twitter_url': 'Twitter',
    'twitter_followers': 'Twitter Follower',
    'facebook_url': 'Facebook',
    'facebook_likes': 'Facebook Likes',

    // Technologies
    'technologies': 'Technologien',
    'tech_stack': 'Tech Stack',
    'tags': 'Tags',

    // AI enrichment
    'confidence': 'Konfidenz',
    'last_updated': 'Zuletzt aktualisiert',
    'enriched_fields': 'Angereicherte Felder',
    'market_insights': 'Markteinblicke',
    'industry_position': 'Marktposition',
    'market_share': 'Marktanteil',
    'growth_trend': 'Wachstumstrend',
    'market_presence': 'Marktpräsenz',
    'competitors': 'Wettbewerber',

    // Metrics
    'alexa_rank': 'Alexa Rank',
    'traffic_rank': 'Traffic Rank',
    'annual_revenue': 'Jahresumsatz',

    // Trust score
    'score': 'Vertrauenswert',
    'verified_sources': 'Verifizierte Quellen',
    'official_links': 'Offizielle Links',
    'institution_verified': 'Institution verifiziert',
    'profile_completeness': 'Profilvollständigkeit'
  };

  return translations[field] || field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatValue = (value, field) => {
  if (value === null || value === undefined) return 'Nicht verfügbar';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nein';
  
  // Special formatting for specific fields
  if (field.includes('date')) return new Date(value).toLocaleDateString('de-DE');
  if (field.includes('revenue') || field.includes('funding')) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact'
    }).format(value);
  }
  if (field.includes('count') || field.includes('followers')) {
    return new Intl.NumberFormat('de-DE', { notation: 'compact' }).format(value);
  }
  if (field.includes('url')) {
    return value.replace(/^https?:\/\//, '').replace(/^www\./, '');
  }
  if (field.includes('score')) {
    return `${value}%`;
  }
  
  return value.toString();
};

export default CompanyResearchPopup; 