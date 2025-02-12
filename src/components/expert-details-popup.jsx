"use client";
import React, { useEffect, useState } from 'react';
import CompanyDetailsPopup from './company-details-popup';
import Image from 'next/image';
import ResearchAIAgentPopup from './research-ai-agent-popup';
import { toast } from 'react-hot-toast';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23CBD5E0' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

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
      // Create updated expert object with proper image structure
      const updatedExpert = {
        ...editedExpert,
        personalInfo: {
          ...editedExpert.personalInfo,
          image: editedExpert.personalInfo?.image || editedExpert.personalInfo?.imageUrl || editedExpert.imageUrl
        }
      };

      // Clean up any duplicate image fields
      delete updatedExpert.imageUrl;
      if (updatedExpert.personalInfo) {
        delete updatedExpert.personalInfo.imageUrl;
      }

      await onUpdate(updatedExpert);
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
    return expert.fullName || expert.name || `${expert.titel || ''} ${expert.firstName || ''} ${expert.lastName || ''}`.trim();
  };

  const getPosition = () => {
    return expert.position || expert.currentRole?.title;
  };

  const getOrganization = () => {
    return expert.organisation || expert.currentRole?.organization;
  };

  const getFachgebiet = () => {
    return expert.fachgebiet || expert.expertise?.primary?.[0];
  };

  const getExpertise = () => {
    return expert.expertise || [];
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

  // Add this helper function
  const renderSourceInfo = (sourceData) => {
    if (!sourceData) return null;
    
    return (
      <div className="text-xs text-gray-400 mt-1">
        <span className="flex items-center gap-1">
          <i className={`fas fa-${sourceData.verified ? 'check-circle text-green-400' : 'info-circle text-gray-500'}`}></i>
          Quelle: 
          <a 
            href={sourceData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            {new URL(sourceData.url).hostname}
          </a>
          <span className="text-gray-500">
            (Geprüft: {new Date(sourceData.last_checked).toLocaleDateString('de-DE')})
          </span>
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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-800 shadow-2xl backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-xl pointer-events-none"></div>

        <div className="p-6 border-b border-gray-800/50 backdrop-blur-sm bg-black/20 rounded-t-lg">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-32 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 ring-1 ring-gray-700/50 shadow-lg relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                <img
                src={expert.image_url || expert.personalInfo?.image || '/experts/default-avatar.png'}
                  alt={getName()}
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
                    {getName()}
                  </h2>
                  <div className="text-gray-300/90 mt-1">
                    <p className="font-medium">{getPosition()}</p>
                    <p className="text-gray-400">{getOrganization()}</p>
                    <p className="text-sm mt-1 text-gray-400">{getFachgebiet()}</p>
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
            { id: 'projects', label: 'Projekte' },
            { id: 'contact', label: 'Kontakt' },
            { id: 'sources', label: 'Quellen' }
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
                <h3 className="font-semibold mb-2 text-gray-100">Über</h3>
                <p className="text-gray-300">{expert.description}</p>
            </section>

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="font-semibold mb-2 text-gray-100">Persönliche Informationen</h3>
                <div className="bg-gray-800 p-4 rounded-lg grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="font-medium text-gray-100">{getName()}</p>
                    {renderSourceInfo(expert.sources?.personal_info?.name)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Titel</p>
                    <p className="font-medium text-gray-100">{expert.titel}</p>
                    {renderSourceInfo(expert.sources?.personal_info?.titel)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Standort</p>
                    <p className="font-medium text-gray-100">{expert.standort}</p>
                    {renderSourceInfo(expert.sources?.personal_info?.standort)}
                  </div>
                  {expert.nationality && (
                    <div>
                      <p className="text-sm text-gray-400">Nationalität</p>
                      <p className="font-medium text-gray-100">{expert.nationality}</p>
                      {renderSourceInfo(expert.sources?.personal_info?.nationality)}
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="font-semibold mb-2 text-gray-100">Sprachen</h3>
                <div className="flex flex-wrap gap-2">
                  {expert.languages?.map((lang, index) => (
                    <div key={index}>
                      <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                        {lang}
                      </span>
                      {renderSourceInfo(expert.sources?.personal_info?.languages)}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'expertise' && (
            <>
              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="font-semibold mb-2 text-gray-100">Fachgebiete</h3>
                <div className="flex flex-wrap gap-2">
                  {getExpertise().map((item, index) => (
                    <div key={index} className="flex flex-col">
                      <span className="px-3 py-1 bg-blue-800 text-blue-100 rounded-full text-sm">
                          {item}
                        {expert.expertise_sources?.[item] === 'human' && (
                          <i className="fas fa-check-circle ml-1 text-green-400" title="Verifiziert"></i>
                        )}
                        </span>
                      {renderSourceInfo(expert.sources?.expertise?.[item])}
                    </div>
                      ))}
                    </div>
              </section>

              {expert.selectedPublications && (
                <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                  <h3 className="font-semibold mb-2 text-gray-100">Ausgewählte Publikationen</h3>
                  <div className="space-y-3">
                    {expert.selectedPublications.map((pub, index) => (
                      <div key={index} className="bg-gray-800 p-4 rounded-lg">
                        <p className="font-medium text-gray-100">{pub.title}</p>
                        <p className="text-gray-300">{pub.journal || pub.publisher}</p>
                        <p className="text-gray-400 text-sm">{pub.year}</p>
                        {renderSourceInfo(expert.sources?.publications?.[pub.title.toLowerCase().replace(/ /g, '_')])}
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
                <h3 className="font-semibold mb-2 text-gray-100">Ausbildung</h3>
                <div className="space-y-4">
                  {getEducation().fields?.map((field, index) => (
                    <div key={index}>
                      <span className="px-3 py-1 bg-blue-800 text-blue-100 rounded-full text-sm">
                        {field}
                        </span>
                      {renderSourceInfo(expert.sources?.academic_background?.fields?.[field])}
                    </div>
                  ))}
                  {getEducation().universities && (
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-gray-100">Universitäten</h4>
                      <div className="space-y-3">
                        {getEducation().universities.map((uni, index) => (
                          <div key={index} className="mb-2">
                            <div className="text-gray-100">{uni}</div>
                            {renderSourceInfo(expert.sources?.academic_background?.universities?.[uni.replace(/\s+/g, '_').toLowerCase()])}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                  {getEducation().degrees && (
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-gray-100">Abschlüsse</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {getEducation().degrees.map((degree, index) => (
                          <li key={index} className="text-gray-100">{degree}</li>
                        ))}
                      </ul>
                  </div>
                )}
              </div>
            </section>

              {expert.academicPositions?.map((position, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                  <p className="font-medium text-gray-100">{position.title}</p>
                  <p className="text-gray-300">{position.institution}</p>
                  <p className="text-gray-400 text-sm">{position.period}</p>
                  {position.additionalRole && (
                    <p className="text-gray-300 mt-1 italic">{position.additionalRole}</p>
                  )}
                  {renderSourceInfo(expert.sources?.academic_positions?.[`${position.institution.replace(/\s+/g, '_')}_${position.title.split(' ')[0]}`])}
                    </div>
              ))}
            </>
          )}

          {activeTab === 'professional' && (
            <>
              {expert.professionalMemberships && (
                <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                  <h3 className="font-semibold mb-2 text-gray-100">Professionelle Mitgliedschaften</h3>
                  <div className="space-y-4">
                    {expert.professionalMemberships.map((membership, index) => (
                      <div key={index} className="bg-gray-800 p-4 rounded-lg">
                        <p className="font-medium text-gray-100">{membership.organization}</p>
                        {membership.roles?.map((role, roleIndex) => (
                          <div key={roleIndex} className="mt-2">
                            <p className="text-gray-300">{role.position}</p>
                            <p className="text-gray-400 text-sm">{role.period}</p>
                    </div>
                        ))}
                        {membership.committee && (
                          <p className="text-gray-300 mt-1 italic">{membership.committee}</p>
                  )}
                        {renderSourceInfo(expert.sources?.professionalMemberships?.[membership.organization.replace(/\s+/g, '_').toLowerCase()])}
                </div>
                    ))}
                  </div>
              </section>
            )}

              {expert.awards && (
                <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                  <h3 className="font-semibold mb-2 text-gray-100">Auszeichnungen</h3>
                  <div className="space-y-3">
                    {expert.awards.map((award, index) => (
                      <div key={index} className="bg-gray-800 p-4 rounded-lg">
                        <p className="font-medium text-gray-100">{award.name}</p>
                        {award.type && <p className="text-gray-300">{award.type}</p>}
                        {award.institution && <p className="text-gray-300">{award.institution}</p>}
                        <p className="text-gray-400 text-sm">{award.year}</p>
                        {renderSourceInfo(expert.sources?.awards?.[award.name.toLowerCase().replace(/ /g, '_')])}
                      </div>
                    ))}
              </div>
              </section>
              )}
            </>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Aktuelle Projekte</h3>
                <div className="space-y-6">
                  {/* Embedded Ethics Project */}
                  <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-medium text-gray-100">Embedded Ethics Approach in AI Development</h4>
                      <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-sm">
                        Laufend
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-400">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        <span>Initiiert: 2020</span>
                      </div>
                      <p className="text-gray-300">
                        In Zusammenarbeit mit der Munich School of Robotics and Machine Intelligence (MSRM) und dem Munich Center for Technology in Society (MCTS) setzt sich Prof. Buyx für die Integration von Ethikern in AI-Entwicklungsteams von Beginn an ein. Dieser Ansatz stellt sicher, dass ethische Überlegungen während des gesamten Entwicklungsprozesses berücksichtigt werden.
                      </p>
                      <div className="flex items-center text-sm text-gray-400 mt-4">
                        <i className="fas fa-link mr-2"></i>
                        <a 
                          href="https://nachrichten.idw-online.de" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          NACHRICHTEN.IDW-ONLINE.DE
                        </a>
          </div>
                      {renderSourceInfo(expert.sources?.projects?.embedded_ethics)}
                    </div>
                  </div>

                  {/* Swarm Learning Project */}
                  <div className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-medium text-gray-100">Swarm Learning for Decentralized Data Analysis</h4>
                      <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-sm">
                        Laufend
                  </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-400">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        <span>Initiiert: 2024</span>
                      </div>
                      <p className="text-gray-300">
                        Prof. Buyx ist Teil eines Konsortiums, das "Swarm Learning", eine neuartige KI-Technologie, einsetzt, um dezentrale Daten zu COVID-19 zu analysieren. Dieses Projekt zielt darauf ab, das Verständnis der Immunantwort auf das Virus zu verbessern und dabei die Datenschutzanforderungen einzuhalten.
                      </p>
                      <div className="flex items-center text-sm text-gray-400 mt-4">
                        <i className="fas fa-link mr-2"></i>
                        <a 
                          href="https://www.dzne.de" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          DZNE.DE
                        </a>
                      </div>
                      {renderSourceInfo(expert.sources?.projects?.swarm_learning)}
                    </div>
                  </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'contact' && (
            <>
              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="font-semibold mb-2 text-gray-100">Kontaktdaten</h3>
                <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                {getContact().email && (
                    <div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-envelope text-gray-400"></i>
                        <a href={`mailto:${getContact().email}`} className="text-blue-400 hover:underline">
                      {getContact().email}
                    </a>
                      </div>
                      {renderSourceInfo(expert.sources?.contact_info?.email)}
                  </div>
                )}
                {getContact().phone && (
                    <div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-phone text-gray-400"></i>
                        <a href={`tel:${getContact().phone}`} className="text-blue-400 hover:underline">
                      {getContact().phone}
                    </a>
                      </div>
                      {renderSourceInfo(expert.sources?.contact_info?.phone)}
                    </div>
                  )}
                  {getContact().website && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-globe text-gray-400"></i>
                      <a href={getContact().website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        Website
                      </a>
                  </div>
                )}
              </div>
            </section>

              {getContact().address && (
                <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                  <h3 className="font-semibold mb-2 text-gray-100">Adresse</h3>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div>
                      <p>{getContact().address.institution}</p>
                      <p>{getContact().address.department}</p>
                      <p>{getContact().address.country}</p>
                  </div>
                    {renderSourceInfo(expert.sources?.contact_info?.address)}
                  </div>
                </section>
              )}

              {getContact().officeHours && (
                <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                  <h3 className="font-semibold mb-2 text-gray-100">Sprechzeiten</h3>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div>
                      {Object.entries(getContact().officeHours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize">{day}:</span>
                          <span>{hours}</span>
                    </div>
                      ))}
                    </div>
                    {renderSourceInfo(expert.sources?.contact_info?.office_hours)}
                  </div>
                </section>
              )}

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="font-semibold mb-2 text-gray-100">Social Media</h3>
                <div className="space-y-2">
                  {Object.entries(getSocialMedia()).map(([platform, url]) => {
                    if (!url) return null;
                    const icon = {
                      linkedin: 'fab fa-linkedin',
                      twitter: 'fab fa-twitter',
                      researchgate: 'fab fa-researchgate'
                    }[platform];
                    
                    return (
                      <div key={platform}>
                  <div className="flex items-center gap-2">
                          <i className={`${icon} text-gray-400`}></i>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                </div>
                        {renderSourceInfo(expert.sources?.social_media?.[platform])}
              </div>
                    );
                  })}
          </div>
              </section>
            </>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-8">
              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Datenquellen-Übersicht</h3>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-300">Verteilung der Datenquellen</h4>
                    <span className="text-xs text-gray-400">
                      Gesamt: {calculateDataSourceStats(expert).total} Datenpunkte
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${calculateDataSourceStats(expert).human}%` }}
                    />
                    <div 
                      className="absolute right-0 top-0 h-full bg-green-600 transition-all duration-500"
                      style={{ width: `${calculateDataSourceStats(expert).ai}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
                      <span className="text-gray-300">
                        Manuell verifiziert ({calculateDataSourceStats(expert).human}%)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                      <span className="text-gray-300">
                        KI-generiert ({calculateDataSourceStats(expert).ai}%)
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    <p className="flex items-center">
                      <i className="fas fa-info-circle mr-2"></i>
                      Letzte Aktualisierung: {new Date(expert.last_updated || expert.letzte_aktualisierung).toLocaleDateString('de-DE')}
                    </p>
                    {expert.data_quality && (
                      <p className="flex items-center mt-1">
                        <i className="fas fa-chart-line mr-2"></i>
                        Datenqualität: {(expert.data_quality.completeness * 100).toFixed(0)}% vollständig
            </p>
          )}
                  </div>
                </div>
        </section>

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Persönliche Informationen</h3>
                <div className="space-y-3">
                  {Object.entries(expert.sources?.personal_info || {}).map(([key, source]) => (
                    <div key={key} className="bg-gray-800 p-4 rounded-lg">
                      <p className="font-medium capitalize text-gray-100">{key.replace(/_/g, ' ')}</p>
                      {renderSourceInfo(source)}
                  </div>
                ))}
              </div>
            </section>

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Expertise & Fachgebiete</h3>
                <div className="space-y-3">
                  {Object.entries(expert.sources?.expertise || {}).map(([key, source]) => (
                    <div key={key} className="bg-gray-800 p-4 rounded-lg">
                      <p className="font-medium text-gray-100">{key}</p>
                      {renderSourceInfo(source)}
          </div>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Akademischer Hintergrund</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2 text-gray-100">Fachgebiete</h4>
                    <div className="space-y-3">
                      {Object.entries(expert.sources?.academic_background?.fields || {}).map(([key, source]) => (
                        <div key={key} className="bg-gray-800 p-4 rounded-lg">
                          <p className="font-medium text-gray-100">{key}</p>
                          {renderSourceInfo(source)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-gray-100">Universitäten</h4>
                    <div className="space-y-3">
                      {Object.entries(expert.sources?.academic_background?.universities || {}).map(([key, source]) => (
                        <div key={key} className="bg-gray-800 p-4 rounded-lg">
                          <p className="font-medium text-gray-100">{key.replace(/_/g, ' ')}</p>
                          {renderSourceInfo(source)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-gray-100">Abschlüsse</h4>
                    <div className="space-y-3">
                      {Object.entries(expert.sources?.academic_background?.degrees || {}).map(([key, source]) => (
                        <div key={key} className="bg-gray-800 p-4 rounded-lg">
                          <p className="font-medium text-gray-100">{key.replace(/_/g, ' ')}</p>
                          {renderSourceInfo(source)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Akademische Positionen</h3>
                <div className="space-y-3">
                  {Object.entries(expert.sources?.academic_positions || {}).map(([key, source]) => (
                    <div key={key} className="bg-gray-800 p-4 rounded-lg">
                      <p className="font-medium text-gray-100">{key.replace(/_/g, ' ')}</p>
                      {renderSourceInfo(source)}
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Berufliche Erfahrung</h3>
                <div className="space-y-3">
                  {Object.entries(expert.sources?.professional_experience || {}).map(([key, source]) => (
                    <div key={key} className="bg-gray-800 p-4 rounded-lg">
                      <p className="font-medium text-gray-100">{key.replace(/_/g, ' ')}</p>
                      {renderSourceInfo(source)}
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Publikationen</h3>
                <div className="space-y-3">
                  {Object.entries(expert.sources?.publications || {}).map(([key, source]) => (
                    <div key={key} className="bg-gray-800 p-4 rounded-lg">
                      <p className="font-medium text-gray-100">{key.replace(/_/g, ' ')}</p>
                      {renderSourceInfo(source)}
                      {source.doi && (
                        <p className="text-sm text-gray-400 mt-1">DOI: {source.doi}</p>
        )}
      </div>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Professionelle Mitgliedschaften</h3>
                <div className="space-y-3">
                  {Object.entries(expert.sources?.professionalMemberships || {}).map(([key, source]) => (
                    <div key={key} className="bg-gray-800 p-4 rounded-lg">
                      <p className="font-medium text-gray-100">{key.replace(/_/g, ' ')}</p>
                      {renderSourceInfo(source)}
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Auszeichnungen</h3>
                <div className="space-y-3">
                  {Object.entries(expert.sources?.awards || {}).map(([key, source]) => (
                    <div key={key} className="bg-gray-800 p-4 rounded-lg">
                      <p className="font-medium text-gray-100">{key.replace(/_/g, ' ')}</p>
                      {renderSourceInfo(source)}
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Kontaktinformationen</h3>
                <div className="space-y-3">
                  {Object.entries(expert.sources?.contact_info || {}).map(([key, source]) => (
                    <div key={key} className="bg-gray-800 p-4 rounded-lg">
                      <p className="font-medium capitalize text-gray-100">{key.replace(/_/g, ' ')}</p>
                      {renderSourceInfo(source)}
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-100">Social Media</h3>
                <div className="space-y-3">
                  {Object.entries(expert.sources?.social_media || {}).map(([key, source]) => (
                    <div key={key} className="bg-gray-800 p-4 rounded-lg">
                      <p className="font-medium capitalize text-gray-100">{key}</p>
                      {renderSourceInfo(source)}
                    </div>
                  ))}
                </div>
              </section>

              {expert.sources?.image && (
                <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-100">Bild</h3>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    {renderSourceInfo(expert.sources.image)}
                    {expert.sources.image.license && (
                      <p className="text-sm text-gray-400 mt-1">
                        Lizenz: {expert.sources.image.license}
                        {expert.sources.image.author && ` | Autor: ${expert.sources.image.author}`}
                      </p>
                    )}
                  </div>
                </section>
              )}

              {expert.data_quality && (
                <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-100">Datenqualität</h3>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <p><span className="font-medium text-gray-100">Vollständigkeit:</span> {(expert.data_quality.completeness * 100).toFixed(0)}%</p>
                    <p><span className="font-medium text-gray-100">Verifizierungslevel:</span> {expert.data_quality.verification_level}</p>
                    <p><span className="font-medium text-gray-100">Letzte Vollprüfung:</span> {new Date(expert.data_quality.last_full_verification).toLocaleDateString('de-DE')}</p>
                    <p><span className="font-medium text-gray-100">Verifizierungsmethode:</span> {expert.data_quality.verification_method}</p>
                    {expert.data_quality.missing_fields?.length > 0 && (
                      <p><span className="font-medium text-gray-100">Fehlende Felder:</span> {expert.data_quality.missing_fields.join(', ')}</p>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800/50">
          <section className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 backdrop-blur-sm border border-gray-800/50 shadow-lg">
            <h3 className="font-semibold mb-2 text-gray-100">Quellen & Verifizierung</h3>
            <div className="text-sm text-gray-400">
              <p>Verifizierungsstatus: {expert.verified ? 'Verifiziert' : 'Nicht verifiziert'}</p>
              {expert.verification_source && (
                <p>Verifizierungsquelle: {expert.verification_source}</p>
              )}
              <p>Letzte Aktualisierung: {new Date(expert.last_updated || expert.letzte_aktualisierung).toLocaleDateString('de-DE')}</p>
            </div>
          </section>
        </div>
      </div>

      {showCompanyDetails && (
        <CompanyDetailsPopup
          companyId={expert.company.id}
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
