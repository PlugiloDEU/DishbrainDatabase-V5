"use client";
import React, { useEffect, useState } from 'react';
import CompanyDetailsPopup from './company-details-popup';
import Image from 'next/image';
import ResearchAIAgentPopup from './research-ai-agent-popup';
import { toast } from 'react-hot-toast';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23CBD5E0' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const ExpertiseDisplay = ({ expertise }) => {
  if (!expertise) return null;

  // If expertise is an array
  if (Array.isArray(expertise)) {
    return (
      <div className="flex flex-wrap gap-2">
        {expertise.map((item, index) => (
          <span key={index} className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-full text-sm">
            {item}
          </span>
        ))}
      </div>
    );
  }

  // If expertise is an object with primary/secondary/industries
  if (typeof expertise === 'object') {
    return (
      <div className="space-y-4">
        {expertise.primary && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Primary Expertise</h4>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(expertise.primary) ? 
                expertise.primary.map((item, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-full text-sm">
                    {item}
                  </span>
                )) : 
                <span className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-full text-sm">
                  {expertise.primary}
                </span>
              }
            </div>
          </div>
        )}

        {expertise.secondary && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Secondary Expertise</h4>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(expertise.secondary) ? 
                expertise.secondary.map((item, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-full text-sm">
                    {item}
                  </span>
                )) : 
                <span className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-full text-sm">
                  {expertise.secondary}
                </span>
              }
            </div>
          </div>
        )}

        {expertise.industries && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Industries</h4>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(expertise.industries) ? 
                expertise.industries.map((item, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-full text-sm">
                    {item}
                  </span>
                )) : 
                <span className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-full text-sm">
                  {expertise.industries}
                </span>
              }
            </div>
          </div>
        )}
      </div>
    );
  }

  // If expertise is a string
  return (
    <span className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-full text-sm">
      {expertise.toString()}
    </span>
  );
};

const ExpertDetailsPopup = ({ expert, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [editedExpert, setEditedExpert] = useState(expert);
  const [showResearchAgent, setShowResearchAgent] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Add debug logging
  useEffect(() => {
    console.log('Expert data in popup:', expert);
  }, [expert]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Helper function to render text with ellipsis if too long
  const renderText = (text, maxLength = 50) => {
    if (!text || text === '-') return '-';
    const textString = String(text); // Convert to string
    if (textString.length <= maxLength) return textString;
    return (
      <span title={textString}>
        {textString.substring(0, maxLength)}...
      </span>
    );
  };

  // Helper function to render clickable URLs
  const renderUrl = (url, label = url) => {
    if (!url || url === '-') return '-';
    return (
      <a 
        href={url.startsWith('http') ? url : `https://${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline break-all"
      >
        {label}
      </a>
    );
  };

  const renderExpertiseWithSources = () => {
    const expertise = getExpertiseArray(expert);
    
    if (!expertise?.length) {
      return (
        <div className="text-gray-500 italic">
          Keine Expertise angegeben
          <div className="text-xs text-gray-400 mt-1">
            Quelle: Keine Daten verfügbar
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {expert.sources?.map((item, index) => {
          const source = expert.sources?.find(source => 
            source.type === 'expertise' && source.tags?.includes(item)
          );

          return (
            <div key={index} className="flex flex-col">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm w-fit">
                {item}
              </span>
              <div className="text-xs text-gray-500 mt-1 ml-2">
                {source ? (
                  <>
                    Quelle: 
                    <a 
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-1"
                    >
                      {source.url}
                    </a>
                    <span className="text-gray-400 ml-1">
                      (Verifiziert: {source.date_accessed})
                    </span>
                  </>
                ) : (
                  <>
                    Quelle: KI-basierte Extraktion aus öffentlichen Profildaten
                    <i className="fas fa-robot ml-1 text-gray-400" title="Automatisch extrahiert"></i>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleSave = async () => {
    try {
      await onUpdate(editedExpert);
      setIsEditing(false);
      toast.success('Änderungen gespeichert');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Fehler beim Speichern der Änderungen');
    }
  };

  const handleResearchResults = async (selectedData) => {
    try {
      const updatedExpert = {
        ...expert,
        ...selectedData,
        personalInfo: {
          ...expert.personalInfo,
          ...selectedData.personalInfo,
          // Handle profile image separately with validation
          ...(selectedData.profile_image && {
            image: selectedData.profile_image.trim()
          })
        }
      };
      
      // Remove profile_image from the root level if it exists
      if ('profile_image' in updatedExpert) {
        delete updatedExpert.profile_image;
      }

      // Validate the image URL before saving
      if (updatedExpert.personalInfo?.image) {
        const imageUrl = updatedExpert.personalInfo.image;
        // Only save if it's a valid image URL
        if (!imageUrl.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i)) {
          delete updatedExpert.personalInfo.image;
        }
      }
      
      await onUpdate(updatedExpert);
      
      // Show success message
      console.log('Expert data updated with AI research results');
    } catch (error) {
      console.error('Error updating expert with research results:', error);
    }
  };

  const handleEnrichment = async () => {
    setShowResearchAgent(true);
  };

  // Add this helper function to render editable fields
  const renderEditableField = (label, value, fieldName, type = "text") => {
    return (
      <>
        <span className="text-gray-500">{label}:</span>
        {isEditing ? (
          <input
            type={type}
            value={editedExpert[fieldName] || ''}
            onChange={(e) => setEditedExpert({
              ...editedExpert,
              [fieldName]: e.target.value
            })}
            className="border rounded px-2 py-1 w-full"
          />
        ) : (
          <span className="break-words">{renderText(value)}</span>
        )}
      </>
    );
  };

  // Add this helper function to get expertise array
  const getExpertiseArray = (expert) => {
    if (Array.isArray(expert.expertise)) {
      return expert.expertise;
    }
    if (expert.expertise?.primary) {
      return expert.expertise.primary;
    }
    return [];
  };

  // Modified helper functions to match data structure
  const getName = () => {
    return expert.personalInfo?.fullName ||
           expert.fullName ||
           expert.name?.name ||
           expert.name ||
           `${expert.personalInfo?.firstName || expert.firstName || ''} ${expert.personalInfo?.lastName || expert.lastName || ''}`.trim() ||
           'Unnamed Expert';
  };

  const getPosition = () => {
    return expert.position || 
           expert.currentRole?.title || 
           expert.institution?.position || 
           expert.personalInfo?.title || 
           expert.headline?.split(' at ')[0] || 
           '';
  };

  const getOrganization = () => {
    return expert.organisation || 
           expert.currentRole?.organization || 
           expert.institution?.name || 
           expert.company?.name || 
           expert.headline?.split(' at ')[1] || 
           '';
  };

  const getFachgebiet = () => {
    return expert.fachgebiet || 
           expert.expertise?.primary?.[0] || 
           expert.currentRole?.focus || 
           expert.industryName || 
           '';
  };

  const getExpertise = () => {
    try {
      if (Array.isArray(expert.expertise)) return expert.expertise;
      if (Array.isArray(expert.expertise?.primary)) return expert.expertise.primary;
      if (Array.isArray(expert.tags)) return expert.tags;
      if (Array.isArray(expert.skills)) return expert.skills;
      if (expert.currentRole?.focus) return [expert.currentRole.focus];
      return [];
    } catch (error) {
      console.error('Error getting expertise:', error);
      return [];
    }
  };

  const getLocation = () => {
    try {
      return expert.standort || 
             expert.location || 
             expert.city || 
             expert.country || 
             expert.geoCountryName || 
             '';
    } catch (error) {
      console.error('Error getting location:', error);
      return '';
    }
  };

  const getContact = () => {
    return expert.kontakt || {
      email: expert.personalInfo?.email,
      phone: expert.personalInfo?.phone,
      website: expert.personalInfo?.website
    };
  };

  const getSocialMedia = () => {
    return expert.social_media || {};
  };

  const getEducation = () => {
    return expert.education || {
      fields: [],
      universities: [],
      degrees: []
    };
  };

  // Add this helper function near the other helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Nicht verfügbar';
    try {
      return new Date(dateString).toLocaleDateString('de-DE');
    } catch (error) {
      return 'Ungültiges Datum';
    }
  };

  // Add this helper function to render source info for any data point
  const renderDataSourceInfo = (source, type = 'info') => {
    if (!source) return null;
    
    return (
      <div className="text-xs text-gray-500 mt-1">
        <span className="flex items-center gap-1">
          <i className={`fas fa-${source.verified ? 'check-circle text-green-400' : 'info-circle text-gray-500'}`}></i>
          Quelle: {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              {new URL(source.url).hostname}
            </a>
          ) : (
            <span className="text-gray-400">KI-basierte Extraktion</span>
          )}
          {source.last_checked && (
            <span className="text-gray-500 ml-1">
              (Geprüft: {formatDate(source.last_checked)})
            </span>
          )}
        </span>
      </div>
    );
  };

  // Add this helper function at the top of the component
  const calculateDataSourceStats = (expert) => {
    let aiCount = 0;
    let humanCount = 0;
    
    // Count expertise sources
    Object.values(expert.expertise_sources || {}).forEach(source => {
      if (source === 'ai') aiCount++;
      if (source === 'human') humanCount++;
    });

    // Count data sources
    Object.values(expert.data_sources || {}).forEach(source => {
      if (source === 'ai') aiCount++;
      if (source === 'human') humanCount++;
    });

    const total = aiCount + humanCount;
    return {
      ai: total ? (aiCount / total * 100).toFixed(1) : 0,
      human: total ? (humanCount / total * 100).toFixed(1) : 0,
      total
    };
  };

  // Add this helper function to parse markdown content
  const parsePerplexityMarkdown = (content) => {
    try {
      // Basic markdown parsing - can be expanded based on needs
      const sections = content.split('---');
      const mainContent = sections[2] || sections[0]; // Get content after second --- or full content
      
      // Extract basic info
      const nameMatch = content.match(/# (.*?):/);
      const descriptionMatch = content.match(/## Executive Summary\n\n(.*?)\n\n/s);
      
      return {
        name: nameMatch ? nameMatch[1].trim() : null,
        description: descriptionMatch ? descriptionMatch[1].trim() : null,
        fullContent: mainContent.trim()
      };
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return null;
    }
  };

  // Add this to your ExpertDetailsPopup component
  const handlePerplexityUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.md') && !file.name.endsWith('.csv')) {
      toast.error('Bitte laden Sie eine Markdown- oder CSV-Datei von Perplexity AI hoch');
      return;
    }

    try {
      const content = await file.text();
      const parsedData = parsePerplexityMarkdown(content);

      if (!parsedData) {
        toast.error('Fehler beim Parsen der Datei');
        return;
      }

      // Update expert data
      const updatedExpert = {
        ...expert,
        description: parsedData.description || expert.description,
        perplexity_content: parsedData.fullContent,
        last_updated: new Date().toISOString()
      };

      await onUpdate(updatedExpert);
      toast.success('Perplexity Daten erfolgreich importiert');
    } catch (error) {
      console.error('Error processing Perplexity file:', error);
      toast.error('Fehler beim Verarbeiten der Datei');
    }
  };

  // Helper function to render object data
  const renderObjectData = (data) => {
    if (!data) return null;
    
    // Handle arrays
    if (Array.isArray(data)) {
      return data.join(', ');
    }
    
    // Handle strings
    if (typeof data === 'string') {
      return data;
    }
    
    // Handle expertise object specifically
    if (data.primary || data.secondary || data.industries) {
      return (
        <div className="space-y-2">
          {data.primary && (
            <div>
              <span className="font-medium">Primary: </span>
              {Array.isArray(data.primary) ? data.primary.join(', ') : data.primary}
            </div>
          )}
          {data.secondary && (
            <div>
              <span className="font-medium">Secondary: </span>
              {Array.isArray(data.secondary) ? data.secondary.join(', ') : data.secondary}
            </div>
          )}
          {data.industries && (
            <div>
              <span className="font-medium">Industries: </span>
              {Array.isArray(data.industries) ? data.industries.join(', ') : data.industries}
            </div>
          )}
        </div>
      );
    }
    
    // Handle other objects by converting them to a readable format
    if (typeof data === 'object') {
      return (
        <div className="space-y-1">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium">{key}: </span>
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </div>
          ))}
        </div>
      );
    }
    
    // Fallback for any other type
    return String(data);
  };

  // Update the expertise section to handle the data more safely
  const renderExpertiseSection = () => {
    try {
      return (
        <div className="space-y-4">
          {/* Primary Skills */}
          {expert.skills?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Hauptfähigkeiten</h4>
              <div className="flex flex-wrap gap-2">
                {expert.skills.map((skill, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="group relative">
                      <span className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-full text-sm flex items-center gap-2">
                        {skill}
                        {expert.sources?.skills?.[skill]?.verified && (
                          <i className="fas fa-check-circle text-green-400" title="Verifiziert"></i>
                        )}
                      </span>
                      {expert.sources?.skills?.[skill] && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-800 p-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <p className="text-gray-300">
                            Quelle: {expert.sources.skills[skill].url ? (
                              <a href={expert.sources.skills[skill].url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                {new URL(expert.sources.skills[skill].url).hostname}
                              </a>
                            ) : 'KI-basierte Extraktion'}
                          </p>
                          {expert.sources.skills[skill].last_checked && (
                            <p className="text-gray-400">
                              Zuletzt geprüft: {formatDate(expert.sources.skills[skill].last_checked)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary Expertise */}
          {expert.expertise?.primary?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Primäre Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {expert.expertise.primary.map((expertise, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="group relative">
                      <span className="px-3 py-1 bg-purple-900/30 text-purple-400 border border-purple-800/50 rounded-full text-sm flex items-center gap-2">
                        {expertise}
                        {expert.sources?.expertise?.[expertise]?.verified && (
                          <i className="fas fa-check-circle text-green-400" title="Verifiziert"></i>
                        )}
                      </span>
                      {expert.sources?.expertise?.[expertise] && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-800 p-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <p className="text-gray-300">
                            Quelle: {expert.sources.expertise[expertise].url ? (
                              <a href={expert.sources.expertise[expertise].url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                {new URL(expert.sources.expertise[expertise].url).hostname}
                              </a>
                            ) : 'KI-basierte Extraktion'}
                          </p>
                          {expert.sources.expertise[expertise].last_checked && (
                            <p className="text-gray-400">
                              Zuletzt geprüft: {formatDate(expert.sources.expertise[expertise].last_checked)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Expertise */}
          {expert.expertise?.secondary?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Sekundäre Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {expert.expertise.secondary.map((expertise, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="group relative">
                      <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-800/50 rounded-full text-sm flex items-center gap-2">
                        {expertise}
                        {expert.sources?.expertise?.[expertise]?.verified && (
                          <i className="fas fa-check-circle text-green-400" title="Verifiziert"></i>
                        )}
                      </span>
                      {expert.sources?.expertise?.[expertise] && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-800 p-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <p className="text-gray-300">
                            Quelle: {expert.sources.expertise[expertise].url ? (
                              <a href={expert.sources.expertise[expertise].url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                {new URL(expert.sources.expertise[expertise].url).hostname}
                              </a>
                            ) : 'KI-basierte Extraktion'}
                          </p>
                          {expert.sources.expertise[expertise].last_checked && (
                            <p className="text-gray-400">
                              Zuletzt geprüft: {formatDate(expert.sources.expertise[expertise].last_checked)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Industries */}
          {expert.expertise?.industries?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Branchen</h4>
              <div className="flex flex-wrap gap-2">
                {expert.expertise.industries.map((industry, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Show message if no skills are available */}
          {!expert.skills?.length && 
           !expert.expertise?.primary?.length && 
           !expert.expertise?.secondary?.length && 
           !expert.expertise?.industries?.length && (
            <div className="text-gray-500 italic">
              Keine Fähigkeiten angegeben
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error('Error rendering expertise section:', error);
      return (
        <div className="text-gray-500 italic">
          Fehler beim Laden der Expertise
        </div>
      );
    }
  };

  // Add this helper function near the other helper functions
  const getDocumentIcon = (type) => {
    const iconMap = {
      'pdf': 'file-pdf',
      'doc': 'file-word',
      'docx': 'file-word',
      'xls': 'file-excel',
      'xlsx': 'file-excel',
      'ppt': 'file-powerpoint',
      'pptx': 'file-powerpoint',
      'txt': 'file-alt',
      'csv': 'file-csv',
      'image': 'file-image',
      'video': 'file-video',
      'audio': 'file-audio'
    };
    return iconMap[type] || 'file';
  };

  // Add this helper function near the other helper functions
  const formatKey = (key) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-800 shadow-2xl backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-xl pointer-events-none"></div>

        <div className="p-6 border-b border-gray-800/50 backdrop-blur-sm bg-black/20 rounded-t-lg">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-32 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 ring-1 ring-gray-700/50 shadow-lg relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
              <img
                src={expert.personalInfo?.image || '/experts/default-avatar.png'}
                alt={expert.personalInfo?.fullName}
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/experts/default-avatar.png';
                }}
              />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {expert.personalInfo?.fullName}
                  </h2>
                  <div className="text-gray-300/90 mt-1">
                    <p className="font-medium">{expert.currentRole?.title}</p>
                    <p className="text-gray-400">{expert.currentRole?.organization}</p>
                    <p className="text-sm mt-1 text-gray-400">{expert.currentRole?.location}</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="flex gap-3 mt-4">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-900 to-blue-800 text-blue-100 rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-900/20"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Bearbeiten
                    </button>
                    <button
                      onClick={handleEnrichment}
                      className="px-4 py-2 bg-gradient-to-r from-green-900 to-green-800 text-green-100 rounded-lg hover:from-green-800 hover:to-green-700 transition-all duration-300 shadow-lg shadow-green-900/20"
                    >
                      <i className="fas fa-magic mr-2"></i>
                      KI-Anreicherung
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-600/20"
                    >
                      <i className="fas fa-save mr-2"></i>
                      Speichern
                    </button>
                    <button
                      onClick={() => {
                        setEditedExpert(expert);
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-gray-100 rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg shadow-gray-700/20"
                    >
                      Abbrechen
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-800/50 mb-6 overflow-x-auto backdrop-blur-sm bg-black/20 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {[
            { id: 'info', label: 'Info' },
            { id: 'expertise', label: 'Expertise' },
            { id: 'academic', label: 'Akademisch' },
            { id: 'professional', label: 'Beruflich' },
            { id: 'contact', label: 'Kontakt' },
            { id: 'sources', label: 'Quellen' },
            { id: 'documents', label: 'Dokumente' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'border-b-2 border-blue-500 text-blue-400 bg-gray-800/30' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/20'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === 'info' && (
            <>
              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="font-semibold mb-4 text-gray-100">Persönliche Informationen</h3>
                <div className="bg-gray-800 p-4 rounded-lg grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="font-medium text-gray-100">{expert.personalInfo?.fullName}</p>
                    {renderDataSourceInfo(expert.sources?.personal_info?.name)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Position</p>
                    <p className="font-medium text-gray-100">{expert.currentRole?.title}</p>
                    {renderDataSourceInfo(expert.sources?.current_position)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Unternehmen</p>
                    <p className="font-medium text-gray-100">{expert.currentRole?.organization}</p>
                    {renderDataSourceInfo(expert.sources?.current_position)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Standort</p>
                    <p className="font-medium text-gray-100">{expert.personalInfo?.allData?.geoLocationName || expert.personalInfo?.allData?.geoCountryName}</p>
                    {renderDataSourceInfo(expert.sources?.location)}
                  </div>
                  {expert.personalInfo?.languages?.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-400">Sprachen</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {expert.personalInfo.languages.map((lang, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {expert.personalInfo?.allData?.followersCount && (
                    <div>
                      <p className="text-sm text-gray-400">Follower</p>
                      <p className="font-medium text-gray-100">{expert.personalInfo.allData.followersCount}</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg mt-4">
                <h3 className="font-semibold mb-4 text-gray-100">Über</h3>
                <p className="text-gray-300">{expert.personalInfo?.allData?.summary || expert.summary}</p>
              </section>
            </>
          )}

          {activeTab === 'expertise' && (
            <>
              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="font-semibold mb-4 text-gray-100">Fähigkeiten</h3>
                <div className="space-y-4">
                  <ExpertiseDisplay expertise={expert.expertise} />
                </div>
              </section>

              {/* Professional Memberships Section */}
              {expert.professionalMemberships?.length > 0 && (
                <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg mt-4">
                  <h3 className="font-semibold mb-4 text-gray-100">Professional Memberships</h3>
                  <div className="space-y-4">
                    {expert.professionalMemberships.map((membership, index) => (
                      <div key={index} className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-200">{membership.organization}</h4>
                        {membership.roles ? (
                          <div className="space-y-2 mt-2">
                            {membership.roles.map((role, roleIndex) => (
                              <div key={roleIndex} className="text-gray-400">
                                <span className="text-blue-400">{role.position}</span>
                                {role.period && <span className="text-gray-500 ml-2">({role.period})</span>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 mt-1">
                            <span className="text-blue-400">{membership.role}</span>
                            {membership.committee && (
                              <p className="text-sm text-gray-500 mt-1">{membership.committee}</p>
                            )}
                            {membership.period && <span className="text-gray-500 ml-2">({membership.period})</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Publications Section */}
              {expert.publications?.length > 0 && (
                <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg mt-4">
                  <h3 className="font-semibold mb-4 text-gray-100">Recent Publications</h3>
                  <div className="space-y-4">
                    {expert.publications.map((publication, index) => (
                      <div key={index} className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-200">{publication.title}</h4>
                        <div className="mt-2 text-sm">
                          {publication.journal && (
                            <p className="text-blue-400">{publication.journal}</p>
                          )}
                          {publication.publisher && (
                            <p className="text-blue-400">{publication.publisher}</p>
                          )}
                          {publication.year && (
                            <p className="text-gray-500 mt-1">{publication.year}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Awards Section */}
              {expert.awards?.length > 0 && (
                <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg mt-4">
                  <h3 className="font-semibold mb-4 text-gray-100">Awards & Recognition</h3>
                  <div className="space-y-4">
                    {expert.awards.map((award, index) => (
                      <div key={index} className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="text-yellow-500 mt-1">
                            <i className="fas fa-award"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-200">{award.name}</h4>
                            <div className="mt-1 text-sm">
                              {award.type && (
                                <p className="text-gray-400">{award.type}</p>
                              )}
                              {award.institution && (
                                <p className="text-blue-400">{award.institution}</p>
                              )}
                              {award.year && (
                                <p className="text-gray-500 mt-1">{award.year}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {activeTab === 'academic' && (
            <>
              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="font-semibold mb-4 text-gray-100">Ausbildung</h3>
                <div className="space-y-4">
                  {Array.isArray(expert.education) && expert.education.length > 0 ? (
                    expert.education.map((edu, index) => (
                      <div key={index} className="bg-gray-800 p-4 rounded-lg">
                        <p className="font-medium text-gray-100">{edu.schoolName}</p>
                        {edu.fieldOfStudy && <p className="text-gray-300">{edu.fieldOfStudy}</p>}
                        {edu.degreeName && <p className="text-gray-300">{edu.degreeName}</p>}
                        {edu.timePeriod && (
                          <p className="text-gray-400 text-sm">
                            {edu.timePeriod?.startDate?.year} - {edu.timePeriod?.endDate?.year || 'Present'}
                          </p>
                        )}
                        {renderDataSourceInfo(expert.sources?.education?.[edu.schoolName])}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 italic">
                      Keine Ausbildungsinformationen verfügbar
                    </div>
                  )}
                </div>
              </section>

              {expert.certifications?.length > 0 && (
                <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg mt-4">
                  <h3 className="font-semibold mb-4 text-gray-100">Zertifizierungen</h3>
                  <div className="space-y-4">
                    {expert.certifications.map((cert, index) => (
                      <div key={index} className="bg-gray-800 p-4 rounded-lg">
                        <p className="font-medium text-gray-100">{cert.name}</p>
                        <p className="text-gray-300">{cert.authority}</p>
                        {cert.timePeriod && (
                          <p className="text-gray-400 text-sm">
                            {cert.timePeriod?.startDate?.month}/{cert.timePeriod?.startDate?.year}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {activeTab === 'professional' && (
            <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
              <h3 className="font-semibold mb-4 text-gray-100">Berufserfahrung</h3>
              <div className="space-y-4">
                {expert.experience?.map((exp, index) => {
                  const companyName = typeof exp.company === 'object' ? exp.company.name : exp.companyName;
                  const companyLogo = typeof exp.company === 'object' ? exp.company.logo : null;
                  const companyIndustries = typeof exp.company === 'object' ? exp.company.industries : null;
                  
                  return (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-start gap-4">
                        {companyLogo && (
                          <div className="w-12 h-12 flex-shrink-0">
                            <img
                              src={companyLogo}
                              alt={`${companyName} logo`}
                              className="w-full h-full object-contain rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-100">{exp.title}</p>
                          <p className="text-gray-300">{companyName}</p>
                          {exp.locationName && <p className="text-gray-300">{exp.locationName}</p>}
                          <p className="text-gray-400 text-sm">
                            {exp.timePeriod?.startDate?.month ? `${exp.timePeriod.startDate.month}/` : ''}{exp.timePeriod?.startDate?.year} - 
                            {exp.timePeriod?.endDate ? 
                              `${exp.timePeriod.endDate.month ? `${exp.timePeriod.endDate.month}/` : ''}${exp.timePeriod.endDate.year}` : 
                              'Present'}
                          </p>
                          {companyIndustries && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {companyIndustries.map((industry, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                                  {industry}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {renderDataSourceInfo(expert.sources?.experience?.[companyName])}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === 'contact' && (
            <>
              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="font-semibold mb-4 text-gray-100">Kontaktinformationen</h3>
                <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                  {expert.personalInfo?.email && expert.personalInfo.email !== '-' && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-envelope text-gray-400"></i>
                      <a href={`mailto:${expert.personalInfo.email}`} className="text-blue-400 hover:underline">
                        {expert.personalInfo.email}
                      </a>
                    </div>
                  )}
                  {expert.personalInfo?.phone && expert.personalInfo.phone !== '-' && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-phone text-gray-400"></i>
                      <a href={`tel:${expert.personalInfo.phone}`} className="text-blue-400 hover:underline">
                        {expert.personalInfo.phone}
                      </a>
                    </div>
                  )}
                  {expert.institution?.website && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-globe text-gray-400"></i>
                      <a href={expert.institution.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg mt-4">
                <h3 className="font-semibold mb-4 text-gray-100">Social Media</h3>
                <div className="space-y-2">
                  {expert.profiles?.linkedin && (
                    <div className="flex items-center gap-2">
                      <i className="fab fa-linkedin text-gray-400"></i>
                      <a href={expert.profiles.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {expert.profiles?.company && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-building text-gray-400"></i>
                      <a href={expert.profiles.company} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        Company Profile
                      </a>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === 'sources' && (
            <>
              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="font-semibold mb-4 text-gray-100">Datenquellen</h3>
                <div className="space-y-4">
                  {/* LinkedIn Data */}
                  {expert.profiles?.linkedin && (
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-400 mb-2">
                        <i className="fab fa-linkedin mr-2"></i>LinkedIn
                      </h4>
                      <a 
                        href={expert.profiles.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-blue-400 transition-colors"
                      >
                        {expert.profiles.linkedin}
                      </a>
                      <div className="text-xs text-gray-500 mt-1">
                        Zuletzt aktualisiert: {new Date(expert.lastEnriched).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                  )}

                  {/* Company Website */}
                  {expert.profiles?.company && (
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-400 mb-2">
                        <i className="fas fa-building mr-2"></i>Unternehmenswebsite
                      </h4>
                      <a 
                        href={expert.profiles.company}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-blue-400 transition-colors"
                      >
                        {expert.profiles.company}
                      </a>
                    </div>
                  )}

                  {/* Additional Sources */}
                  {expert.sources && Object.entries(expert.sources).map(([key, source], index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-400 mb-2">
                        <i className="fas fa-link mr-2"></i>{formatKey(key)}
                      </h4>
                      {typeof source === 'object' && Object.entries(source).map(([subKey, subSource], subIndex) => (
                        <div key={subIndex} className="mb-2">
                          <div className="text-gray-400 text-sm">{formatKey(subKey)}:</div>
                          {subSource.url && (
                            <a 
                              href={subSource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-300 hover:text-blue-400 transition-colors block ml-4"
                            >
                              {subSource.url}
                            </a>
                          )}
                          <div className="text-xs text-gray-500 ml-4">
                            Status: {subSource.verified ? 'Verifiziert' : 'Nicht verifiziert'}
                            {subSource.last_checked && ` • Zuletzt geprüft: ${new Date(subSource.last_checked).toLocaleDateString('de-DE')}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Data Quality Stats */}
                <div className="mt-6 bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Datenqualität</h4>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                          style={{ width: `${calculateDataSourceStats(expert).human}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{calculateDataSourceStats(expert).human}% Manuell verifiziert</span>
                        <span>{calculateDataSourceStats(expert).ai}% KI-basiert</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'documents' && (
            <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
              <h3 className="font-semibold mb-4 text-gray-100">Dokumente</h3>
              {expert.documents?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expert.documents.map((doc, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg flex items-start gap-3">
                      <div className="w-10 h-10 flex-shrink-0 bg-gray-700 rounded flex items-center justify-center">
                        <i className={`fas fa-${getDocumentIcon(doc.type)} text-gray-400`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-200 truncate">{doc.title || doc.filename}</h4>
                        <p className="text-sm text-gray-400 truncate">{doc.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <a 
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded-full transition-colors"
                          >
                            <i className="fas fa-external-link-alt mr-1"></i>
                            Öffnen
                          </a>
                          <span className="text-xs text-gray-500">
                            {new Date(doc.uploaded_at).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-8">
                  <i className="fas fa-folder-open text-4xl mb-3 block"></i>
                  Keine Dokumente verfügbar
                </div>
              )}
            </section>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800/50">
          <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
            <h3 className="font-semibold mb-2 text-gray-100">Quellen & Verifizierung</h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">
                <p>Verifizierungsstatus: {expert.verified ? 'Verifiziert' : 'Nicht verifiziert'}</p>
                <p>Letzte Aktualisierung: {formatDate(expert.last_updated || expert.lastEnriched)}</p>
              </div>
              <div className="mt-4">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                    style={{ width: `${calculateDataSourceStats(expert).human}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{calculateDataSourceStats(expert).human}% Manuell verifiziert</span>
                  <span>{calculateDataSourceStats(expert).ai}% KI-basiert</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {showCompanyDetails && (
        <CompanyDetailsPopup
          companyId={expert.company?.id}
          onClose={() => setShowCompanyDetails(false)}
        />
      )}

      {showResearchAgent && (
        <ResearchAIAgentPopup
          expert={expert}
          onClose={() => setShowResearchAgent(false)}
          onSave={handleResearchResults}
        />
      )}
    </div>
  );
};

export default ExpertDetailsPopup;
