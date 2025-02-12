"use client";
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import CompanyResearchPopup from './company-research-popup';

const getCompanyLogo = (domain) => {
  if (!domain) return null;
  const cleanDomain = domain
    .replace(/^https?:\/\//, '')  // Remove protocol (http:// or https://)
    .replace(/^www\./, '')        // Remove www.
    .split('/')[0];               // Remove path
  return `https://logo.clearbit.com/${cleanDomain}`;
};

const renderAIEnrichment = (company) => {
  if (!company.ai_enrichment) return null;

  return (
    <section className="bg-gray-50 p-4 rounded-lg mt-6">
      <h3 className="text-lg font-semibold mb-3">
        <i className="fas fa-robot text-blue-500 mr-2"></i>
        KI-Anreicherung
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Konfidenz:</span>
          <div className="flex items-center">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${company.ai_enrichment.confidence}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {company.ai_enrichment.confidence}%
            </span>
          </div>
        </div>

        <div>
          <span className="text-sm text-gray-600">Letzte Aktualisierung:</span>
          <span className="ml-2 text-sm">
            {company.ai_enrichment.last_updated}
          </span>
        </div>

        <div>
          <span className="text-sm text-gray-600">Angereicherte Felder:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {company.ai_enrichment.enriched_fields?.map((field, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
              >
                {field}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm text-gray-600">Quellen:</span>
          <div className="mt-2 space-y-2">
            {company.ai_enrichment.sources?.map((source, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm bg-white p-2 rounded"
              >
                <i className="fas fa-link text-gray-400"></i>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {source.name}
                </a>
                <span className="text-gray-500 text-xs">({source.type})</span>
              </div>
            ))}
          </div>
        </div>

        {company.ai_enrichment.market_insights && (
          <div>
            <span className="text-sm text-gray-600">Markteinblicke:</span>
            <div className="mt-2 space-y-2">
              {Object.entries(company.ai_enrichment.market_insights).map(([key, value], index) => (
                <div key={index} className="bg-white p-2 rounded">
                  <span className="text-sm font-medium">{key}:</span>
                  <span className="text-sm ml-2">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {company.ai_enrichment.tech_stack && (
          <div>
            <span className="text-sm text-gray-600">Tech Stack:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {company.ai_enrichment.tech_stack.map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const CompanyDetailsPopup = ({ company, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState(company);
  const [isEnriching, setIsEnriching] = useState(false);
  const [showResearchPopup, setShowResearchPopup] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Enhanced URL rendering with clickable link
  const renderUrlField = (label, value, fieldName, icon) => {
    return (
      <div className="flex items-center gap-2">
        <i className={`fas fa-${icon} text-gray-400 w-5`}></i>
        <span className="text-gray-600 font-medium">{label}:</span>
        {isEditing ? (
          <input
            type="url"
            value={editedCompany[fieldName] || ''}
            onChange={(e) => setEditedCompany({
              ...editedCompany,
              [fieldName]: e.target.value
            })}
            className="flex-1 border rounded px-2 py-1"
            placeholder="https://"
          />
        ) : (
          value ? (
            <a 
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {extractDomain(value)}
            </a>
          ) : (
            <span className="text-gray-700">Nicht angegeben</span>
          )
        )}
      </div>
    );
  };

  // Helper function to render editable arrays (technologies, tags, etc.)
  const renderEditableArray = (label, array, fieldName) => {
    if (isEditing) {
      return (
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">{label}:</h4>
          <div className="space-y-2">
            {editedCompany[fieldName]?.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newArray = [...editedCompany[fieldName]];
                    newArray[index] = e.target.value;
                    setEditedCompany({
                      ...editedCompany,
                      [fieldName]: newArray
                    });
                  }}
                  className="flex-1 border rounded px-2 py-1"
                />
                <button
                  onClick={() => {
                    const newArray = editedCompany[fieldName].filter((_, i) => i !== index);
                    setEditedCompany({
                      ...editedCompany,
                      [fieldName]: newArray
                    });
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setEditedCompany({
                  ...editedCompany,
                  [fieldName]: [...(editedCompany[fieldName] || []), '']
                });
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              <i className="fas fa-plus mr-1"></i>
              Hinzufügen
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">{label}:</h4>
        <div className="flex flex-wrap gap-2">
          {array?.map((item, index) => (
            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {item}
            </span>
          )) || <span className="text-gray-500">Keine Einträge</span>}
        </div>
      </div>
    );
  };

  const handleResearchResults = async (selectedData) => {
    try {
      const updatedCompany = {
        ...company,
        ...selectedData,
        ai_enrichment: {
          ...company.ai_enrichment,
          last_updated: new Date().toISOString(),
          confidence: 85,
          enriched_fields: Object.keys(selectedData)
        }
      };
      
      await onUpdate(updatedCompany);
      toast.success('Unternehmensdaten aktualisiert');
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  // Update the KI-Anreicherung button click handler
  const handleEnrichmentClick = () => {
    setShowResearchPopup(true);
    setIsEnriching(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate(editedCompany);
      setIsEditing(false);
      toast.success('Änderungen gespeichert');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Fehler beim Speichern der Änderungen');
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/companies?domain=${company.domain}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete company');
      }

      toast.success('Firma erfolgreich gelöscht');
      onClose();
      onDelete(company); // Update parent state
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Löschen fehlgeschlagen: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header with buttons */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Firma bearbeiten' : 'Firmen Details'}
          </h2>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Bearbeiten
                </button>
                <button
                  onClick={handleEnrichmentClick}
                  className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <i className="fas fa-magic mr-2"></i>
                  KI-Anreicherung
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-save mr-2"></i>
                  Speichern
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Abbrechen
                </button>
              </>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Wird gelöscht...' : 'Firma löschen'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Header with Trust Score */}
        <div className="flex justify-between items-start mb-8 pt-4">
          {/* Company Logo and Name */}
          <div className="flex items-center gap-6 mb-8 mt-4">
            {company.domain ? (
              <img 
                src={getCompanyLogo(company.domain)}
                alt={company.name}
                className="w-32 h-32 rounded-full object-contain bg-white p-2 border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-company-logo.png'; // Fallback to default logo
                }}
              />
            ) : (
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <i className="fas fa-building text-blue-500 text-4xl"></i>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
              <p className="text-lg text-gray-600">{company.industry}</p>
              <p className="text-sm text-gray-500">{company.legal_name}</p>
            </div>
          </div>

          {/* Trust Score and Close Button */}
          <div className="flex items-start gap-4">
            {company.trust_score && (
              <div className="bg-white rounded-lg shadow-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <i className={`fas fa-shield-alt ${
                    company.trust_score.score >= 80 ? 'text-emerald-500' :
                    company.trust_score.score >= 50 ? 'text-amber-500' :
                    'text-red-500'
                  }`}></i>
                  <span className="font-semibold">Vertrauenswürdigkeit</span>
                </div>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      company.trust_score.score >= 80 ? 'bg-emerald-500' :
                      company.trust_score.score >= 50 ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${company.trust_score.score}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  <span>{company.trust_score.score}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <section className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">
              <i className="fas fa-info-circle text-blue-500 mr-2"></i>
              Unternehmensinformationen
            </h3>
            <div className="space-y-2">
              {renderUrlField('Rechtlicher Name', company.legal_name, 'legal_name', 'file-signature')}
              {renderUrlField('Unternehmenstyp', company.company_type, 'company_type', 'building')}
              {renderUrlField('Branche', company.industry, 'industry', 'industry')}
              {renderUrlField('Branchengruppe', company.industry_group, 'industry_group', 'layer-group')}
              {renderUrlField('Sektor', company.sector, 'sector', 'chart-pie')}
              {renderUrlField('Sub-Industrie', company.sub_industry, 'sub_industry', 'sitemap')}
              {renderUrlField('GICS Code', company.gics_code, 'gics_code', 'hashtag')}
              {renderUrlField('Gründungsjahr', company.founded_year, 'founded_year', 'calendar')}
              {renderUrlField('Mitarbeiter', company.employee_count, 'employee_count', 'users')}
              {renderUrlField('Umsatzbereich', company.revenue_range, 'revenue_range', 'chart-line')}
              {renderUrlField('Domain', company.url, 'url', 'globe')}
            </div>
          </section>

          {/* Contact & Location */}
          <section className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">
              <i className="fas fa-address-card text-blue-500 mr-2"></i>
              Kontakt & Standort
            </h3>
            <div className="space-y-2">
              {renderUrlField('Adresse', company.street_address, 'street_address', 'map-marker-alt')}
              {renderUrlField('Stadt', company.city, 'city', 'city')}
              {renderUrlField('Bundesland', company.state, 'state', 'map')}
              {renderUrlField('Land', company.country, 'country', 'globe')}
              {renderUrlField('PLZ', company.postal_code, 'postal_code', 'mail-bulk')}
              {renderUrlField('Telefon', company.phone, 'phone', 'phone', 'tel')}
              {renderUrlField('Email', company.email, 'email', 'envelope', 'email')}
              {renderUrlField('Website', company.url, 'url', 'globe', 'url')}
            </div>
          </section>

          {/* Financial & Metrics */}
            <section className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
              <i className="fas fa-chart-bar text-blue-500 mr-2"></i>
              Finanzen & Metriken
              </h3>
            <div className="space-y-2">
              {renderUrlField('Jahresumsatz', company.annual_revenue, 'annual_revenue', 'money-bill')}
              {renderUrlField('Geschätzter Umsatz', company.estimated_annual_revenue, 'estimated_annual_revenue', 'calculator')}
              {renderUrlField('Marktwert', company.market_cap, 'market_cap', 'chart-line')}
              {renderUrlField('Investitionen', company.raised_amount, 'raised_amount', 'hand-holding-usd')}
              {renderUrlField('Alexa Rank', company.alexa_rank, 'alexa_rank', 'sort-numeric-down')}
              {renderUrlField('Traffic Rank', company.traffic_rank, 'traffic_rank', 'chart-area')}
              </div>
            </section>

          {/* Social Media & Online Presence */}
            <section className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
              <i className="fas fa-share-alt text-blue-500 mr-2"></i>
              Online Präsenz
              </h3>
              <div className="space-y-2">
              {renderUrlField('LinkedIn', company.linkedin_url, 'linkedin_url', 'linkedin')}
              {renderUrlField('Twitter', company.twitter_url, 'twitter_url', 'twitter')}
              {renderUrlField('Facebook', company.facebook_url, 'facebook_url', 'facebook')}
            </div>
          </section>

          {/* Technologies & Categories */}
          <section className="bg-gray-50 p-4 rounded-lg col-span-2">
            <h3 className="text-lg font-semibold mb-3">
              <i className="fas fa-microchip text-blue-500 mr-2"></i>
              Technologien & Kategorien
            </h3>
            <div className="space-y-4">
              {renderEditableArray('Technologien', company.technologies, 'technologies')}
              {renderEditableArray('Tech-Kategorien', company.tech_categories, 'tech_categories')}
              {renderEditableArray('Tags', company.tags, 'tags')}
            </div>
          </section>
        </div>

        {/* Description */}
        <div className="mt-6">
          <section className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">
              <i className="fas fa-align-left text-blue-500 mr-2"></i>
              Beschreibung
            </h3>
            {isEditing ? (
              <textarea
                value={editedCompany.description || ''}
                onChange={(e) => setEditedCompany({
                  ...editedCompany,
                  description: e.target.value
                })}
                className="w-full h-32 border rounded p-2"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-line">
                {company.description}
              </p>
            )}
          </section>
        </div>

        {/* Sources */}
        {company.sources && company.sources.length > 0 && (
          <div className="mt-6">
            <section className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                <i className="fas fa-link text-blue-500 mr-2"></i>
                Quellen
              </h3>
              <div className="space-y-2">
                {company.sources.map((source, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <i className={`fas fa-${source.verified ? 'check-circle text-emerald-500' : 'info-circle text-gray-400'}`}></i>
                    <a 
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {source.url}
                    </a>
                    <span className="text-gray-500">({source.type.replace('_', ' ')})</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Add AI Enrichment section */}
        {renderAIEnrichment(company)}

        {/* Research popup */}
        {showResearchPopup && (
          <CompanyResearchPopup
            company={company}
            onClose={() => {
              setShowResearchPopup(false);
              setIsEnriching(false);
            }}
            onSave={handleResearchResults}
          />
        )}

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Firma löschen</h3>
              <p className="mb-6">
                Sind Sie sicher, dass Sie die Firma "{company.legal_name}" löschen möchten? 
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Wird gelöscht...' : 'Endgültig löschen'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to extract domain from URL
const extractDomain = (url) => {
  if (!url) return 'Nicht verfügbar';
  try {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  } catch (error) {
    return 'Nicht verfügbar';
  }
};

export default CompanyDetailsPopup;
