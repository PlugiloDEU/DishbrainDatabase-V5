"use client";
import React from 'react';

const ExpertCard = ({ expert, onClick }) => {
  // Helper to get the expert's name
  const getName = () => {
    if (typeof expert.name === 'string') return expert.name;
    if (typeof expert.name === 'object') return expert.name.name || '';
    return expert.personalInfo?.fullName || 
           expert.personalInfo?.name || 
           'Unnamed Expert';
  };

  // Helper to get the expert's title and organization
  const getTitle = () => {
    try {
      if (typeof expert.titel === 'string') return expert.titel;
      if (typeof expert.title === 'string') return expert.title;
      if (expert.currentRole?.title) return expert.currentRole.title;
      if (expert.institution?.position) return expert.institution.position;
      return expert.personalInfo?.title || '';
    } catch (error) {
      console.error('Error processing title:', error);
      return '';
    }
  };

  const getOrganization = () => {
    try {
      if (typeof expert.organisation === 'string') return expert.organisation;
      if (typeof expert.organization === 'string') return expert.organization;
      if (expert.institution?.name) return expert.institution.name;
      if (expert.currentRole?.organization) return expert.currentRole.organization;
      return expert.company?.name || '';
    } catch (error) {
      console.error('Error processing organization:', error);
      return '';
    }
  };

  // Helper to get expertise
  const getExpertise = () => {
    try {
      // First try tags
      if (Array.isArray(expert.tags) && expert.tags.length > 0) {
        return expert.tags;
      }
      // Then try expertise.primary
      if (Array.isArray(expert.expertise?.primary)) {
        return expert.expertise.primary;
      }
      // Then try expertise as array
      if (Array.isArray(expert.expertise)) {
        return expert.expertise;
      }
      // Then try currentRole.focus
      if (expert.currentRole?.focus) {
        return [expert.currentRole.focus];
      }
      return [];
    } catch (error) {
      console.error('Error processing expertise:', error);
      return [];
    }
  };

  // Helper to get location
  const getLocation = () => {
    try {
      if (typeof expert.standort === 'string') return expert.standort;
      if (expert.city && expert.country) return `${expert.city}, ${expert.country}`;
      if (expert.city) return expert.city;
      if (expert.country) return expert.country;
      if (typeof expert.location === 'string') return expert.location;
      return '';
    } catch (error) {
      console.error('Error processing location:', error);
      return '';
    }
  };

  // Helper to get avatar URL
  const getAvatarUrl = () => {
    try {
      // Check all possible image paths in order of preference
      if (expert.personalInfo?.image) return expert.personalInfo.image;
      if (expert.personalInfo?.imageUrl) return expert.personalInfo.imageUrl;
      if (expert.avatar) return expert.avatar;
      if (expert.imageUrl) return expert.imageUrl;
      if (expert.image) return expert.image;
      return null;
    } catch (error) {
      console.error('Error processing avatar:', error);
      return null;
    }
  };

  const avatarUrl = getAvatarUrl();
  const expertise = getExpertise();
  const location = getLocation();
  const title = getTitle();
  const organization = getOrganization();

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(expert)}
    >
      <div className="flex items-start gap-4">
        {/* Avatar/Image */}
        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
          {getAvatarUrl() ? (
            <img 
              src={getAvatarUrl()}
              alt={getName()}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = '/experts/default-expert-avatar.png';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
              <span className="text-xl font-bold">
                {getName().charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Expert Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{getName()}</h3>
          
          {/* Title & Organization - Always show */}
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">{title || 'Keine Position angegeben'}</span>
            {organization && (
              <>
                <span className="mx-1">·</span>
                <span>{organization}</span>
              </>
            )}
          </div>

          {/* Expertise Tags - Always show */}
          <div className="flex flex-wrap gap-2 mt-2">
            {expertise.length > 0 ? (
              <>
                {expertise.slice(0, 3).map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {item}
                  </span>
                ))}
                {expertise.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{expertise.length - 3} more
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-500 italic">
                Keine Expertise angegeben
              </span>
            )}
          </div>

          {/* Location - Always show */}
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <i className="fas fa-map-marker-alt mr-1"></i>
            <span>{location || 'Standort nicht angegeben'}</span>
          </div>
        </div>

        {/* Verification Badge */}
        {expert.verified && (
          <div className="text-blue-500" title="Verified Expert">
            <i className="fas fa-check-circle"></i>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertCard;
