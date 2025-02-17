"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const DocumentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('expert'); // 'expert' or 'company'
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Bitte geben Sie einen Suchbegriff ein');
      return;
    }

    try {
      const endpoint = searchType === 'expert' ? '/api/experts/search' : '/api/companies/search';
      const response = await fetch(`${endpoint}?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Suche fehlgeschlagen');
      }

      const results = await response.json();
      setSearchResults(results);

      if (results.length === 0) {
        toast.error('Keine Ergebnisse gefunden');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Fehler bei der Suche');
    }
  };

  const handleFileUpload = async (event, entityId) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Nicht unterstütztes Dateiformat. Erlaubt sind: PDF, Word, JPG, TXT');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityId', entityId);
    formData.append('entityType', searchType);

    setIsUploading(true);
    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen');
      }

      toast.success('Dokument erfolgreich hochgeladen');
      setSelectedEntity(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Fehler beim Hochladen');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 shadow-xl border border-gray-800/50">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">Dokumentenverwaltung</h2>
        
        <div className="space-y-4">
          {/* Search Type Selection */}
          <div className="flex gap-4">
            <button
              onClick={() => setSearchType('expert')}
              className={`px-4 py-2 rounded-lg ${
                searchType === 'expert'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              KI Experten
            </button>
            <button
              onClick={() => setSearchType('company')}
              className={`px-4 py-2 rounded-lg ${
                searchType === 'company'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Unternehmen
            </button>
          </div>

          {/* Search Input */}
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`${searchType === 'expert' ? 'Experten' : 'Unternehmen'} suchen...`}
              className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Suchen
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-200">Suchergebnisse</h3>
              <div className="space-y-3">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-gray-200 font-medium">{result.name}</p>
                      <p className="text-sm text-gray-400">
                        {searchType === 'expert' ? result.position : result.location}
                      </p>
                    </div>
                    {selectedEntity?.id === result.id ? (
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.txt"
                          onChange={(e) => handleFileUpload(e, result.id)}
                          className="text-sm text-gray-400"
                        />
                        <button
                          onClick={() => setSelectedEntity(null)}
                          className="text-gray-400 hover:text-gray-300"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedEntity(result)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Dokument hochladen
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement; 