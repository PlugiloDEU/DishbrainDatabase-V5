import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const ResearchAIAgentPopup = ({ expert, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedFields, setSelectedFields] = useState({});
  const [imageUploadMode, setImageUploadMode] = useState('url');
  const [uploadedImage, setUploadedImage] = useState(null);

  const searchFields = [
    'url', 'domain', 'name', 'legal_name', 'description', 'logo_url', 
    'founded_year', 'company_type', 'employee_count', 'revenue_range',
    'street_address', 'city', 'state', 'country', 'postal_code',
    'latitude', 'longitude', 'industry', 'industry_group', 'sector',
    'sub_industry', 'gics_code', 'naics_codes', 'sic_codes',
    'linkedin_url', 'linkedin_followers', 'twitter_handle',
    'twitter_followers', 'facebook_handle', 'facebook_likes',
    'alexa_rank', 'annual_revenue', 'estimated_annual_revenue',
    'market_cap', 'raised_amount', 'traffic_rank', 'technologies',
    'tech_categories', 'domain_aliases', 'email_provider', 'tags',
    'facebook_url', 'twitter_url', 'street', 'address', 'keywords',
    'phone', 'email', 'ceo_info', 'profile_image'
  ];

  const fetchAIResults = async () => {
    setIsLoading(true);
    try {
      const searchQuery = `${expert.name} ${expert.position || ''} ${expert.company?.name || ''} ${expert.email || ''} ${expert.url || ''}`.trim();
      
      console.log('Searching for:', searchQuery);

      const response = await fetch('/api/research-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          fields: searchFields,
          currentData: expert
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch AI results');
      }

      const data = await response.json();
      console.log('AI Results:', data);
      setResults(data);
    } catch (error) {
      console.error('Error fetching AI results:', error);
      alert('Fehler beim Abrufen der KI-Ergebnisse: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldToggle = (field) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    const selectedData = {};
    Object.entries(selectedFields).forEach(([field, isSelected]) => {
      if (isSelected && results[field]) {
        selectedData[field] = results[field];
      }
    });

    await onSave(selectedData);
    onClose();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/i)) {
      alert('Bitte nur JPG, PNG oder WebP Dateien hochladen.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      setUploadedImage(url);
      
      setResults(prev => ({
        ...prev,
        profile_image: url
      }));
      setSelectedFields(prev => ({
        ...prev,
        profile_image: true
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Fehler beim Hochladen des Bildes.');
    }
  };

  const renderImageSection = () => (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
      <input
        type="checkbox"
        id="profile_image"
        checked={selectedFields.profile_image || false}
        onChange={() => handleFieldToggle('profile_image')}
        className="w-5 h-5 text-blue-600 rounded"
      />
      <div className="flex-1">
        <label htmlFor="profile_image" className="block text-sm font-medium text-gray-700">
          Profilbild
        </label>
        <div className="mt-2 space-y-4">
          {expert.personalInfo?.image && (
            <div className="flex items-center gap-4 mb-2">
              <div className="text-sm text-gray-500">Aktuelles Bild:</div>
              <Image
                src={expert.personalInfo.image}
                alt="Aktuelles Profilbild"
                width={80}
                height={80}
                className="rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-expert-avatar.png';
                }}
                unoptimized
              />
            </div>
          )}

          {(results?.profile_image || uploadedImage) && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">Neues Bild:</div>
              <Image
                src={uploadedImage || results.profile_image}
                alt="Neues Profilbild"
                width={80}
                height={80}
                className="rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-expert-avatar.png';
                }}
                unoptimized
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setImageUploadMode('url')}
              className={`px-3 py-1 rounded ${
                imageUploadMode === 'url' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              URL
            </button>
            <button
              type="button"
              onClick={() => setImageUploadMode('file')}
              className={`px-3 py-1 rounded ${
                imageUploadMode === 'file' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Datei hochladen
            </button>
          </div>

          {imageUploadMode === 'url' ? (
            <input
              type="url"
              value={results?.profile_image || ''}
              onChange={(e) => {
                setResults(prev => ({
                  ...prev,
                  profile_image: e.target.value
                }));
              }}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2 border rounded"
            />
          ) : (
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="w-full"
            />
          )}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    fetchAIResults();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">KI-Recherche Agent</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Recherchiere Informationen...</p>
          </div>
        ) : results ? (
          <div className="space-y-6">
            {renderImageSection()}

            {searchFields.filter(field => field !== 'profile_image').map(field => {
              if (!results[field]) return null;
              return (
                <div key={field} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id={field}
                    checked={selectedFields[field] || false}
                    onChange={() => handleFieldToggle(field)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                      {field}
                    </label>
                    <p className="text-gray-900">{results[field]}</p>
                  </div>
                </div>
              );
            })}

            <div className="sticky bottom-0 bg-white py-4 border-t mt-6">
              <button
                onClick={handleSave}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={Object.values(selectedFields).every(v => !v)}
              >
                Ausgewählte Informationen speichern
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">Keine Ergebnisse gefunden</p>
        )}
      </div>
    </div>
  );
};

export default ResearchAIAgentPopup; 