import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

const ExpertFormPopup = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: uuidv4(),
    name: '', // required
    company: '', // required
    title: '',
    position: '',
    institution: '',
    department: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    expertise: [],
    technologies: [],
    publications: '',
    hIndex: '',
    linkedin_url: '',
    twitter_url: '',
    website: '',
    bio: '',
    research_areas: [],
    languages: [],
    certifications: [],
    awards: [],
    speaking_engagements: [],
  });

  const [showEnrichmentDialog, setShowEnrichmentDialog] = useState(false);
  const [enrichmentOptions, setEnrichmentOptions] = useState({
    academicBackground: true,
    researchAreas: true,
    publications: true,
    expertise: true,
    projects: true,
    customPrompt: false
  });

  const [customPrompt, setCustomPrompt] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.company) {
      alert('Name und Firma sind erforderlich');
      return;
    }

    try {
      const urlFriendlyId = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const expertData = {
        ...formData,
        id: urlFriendlyId,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };

      // Show enrichment dialog instead of submitting directly
      setShowEnrichmentDialog(true);
    } catch (error) {
      console.error('Error preparing expert data:', error);
      alert('Fehler bei der Vorbereitung der Daten: ' + error.message);
    }
  };

  const handleEnrichmentSubmit = async (enrich) => {
    setIsLoading(true);
    try {
      let expertData = {
        ...formData,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };

      if (enrich) {
        toast.loading('KI analysiert Expertenprofil...', { id: 'enrichExpert' });
        
        const response = await fetch('/api/enrich-expert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expert: expertData,
            options: enrichmentOptions,
            customPrompt: enrichmentOptions.customPrompt ? customPrompt : null
          })
        });

        if (!response.ok) {
          throw new Error('Fehler bei der KI-Anreicherung');
        }

        const enrichedData = await response.json();
        
        // Merge enriched data
        expertData = {
          ...expertData,
          academic_background: enrichedData.academic_background,
          research_areas: enrichedData.research_areas,
          publications: enrichedData.publications,
          expertise: [...(expertData.expertise || []), ...enrichedData.expertise],
          projects: enrichedData.projects,
          h_index: enrichedData.h_index,
          citations: enrichedData.citations
        };

        toast.success('KI-Anreicherung abgeschlossen', { id: 'enrichExpert' });
      }

      await onSubmit(expertData);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Fehler beim Speichern', { id: 'enrichExpert' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleArrayChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {showEnrichmentDialog ? (
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">KI-Anreicherung des Expertenprofils</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Akademischer Werdegang
              </label>
              <input
                type="checkbox"
                checked={enrichmentOptions.academicBackground}
                onChange={(e) => setEnrichmentOptions(prev => ({
                  ...prev,
                  academicBackground: e.target.checked
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Forschungsgebiete
              </label>
              <input
                type="checkbox"
                checked={enrichmentOptions.researchAreas}
                onChange={(e) => setEnrichmentOptions(prev => ({
                  ...prev,
                  researchAreas: e.target.checked
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Publikationen
              </label>
              <input
                type="checkbox"
                checked={enrichmentOptions.publications}
                onChange={(e) => setEnrichmentOptions(prev => ({
                  ...prev,
                  publications: e.target.checked
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Expertise
              </label>
              <input
                type="checkbox"
                checked={enrichmentOptions.expertise}
                onChange={(e) => setEnrichmentOptions(prev => ({
                  ...prev,
                  expertise: e.target.checked
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Projekte
              </label>
              <input
                type="checkbox"
                checked={enrichmentOptions.projects}
                onChange={(e) => setEnrichmentOptions(prev => ({
                  ...prev,
                  projects: e.target.checked
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Eigener Prompt
              </label>
              <input
                type="checkbox"
                checked={enrichmentOptions.customPrompt}
                onChange={(e) => setEnrichmentOptions(prev => ({
                  ...prev,
                  customPrompt: e.target.checked
                }))}
              />
            </div>

            {enrichmentOptions.customPrompt && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Geben Sie Ihren eigenen Prompt ein
                </label>
                <textarea
                  className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Beschreiben Sie, welche Informationen die KI über den Experten finden soll..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tipp: Die Antwort sollte im JSON-Format erfolgen.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleEnrichmentSubmit(true)}
              disabled={isLoading || (enrichmentOptions.customPrompt && !customPrompt.trim())}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {isLoading ? 'Wird verarbeitet...' : 'Mit KI anreichern'}
            </button>
            <button
              onClick={() => handleEnrichmentSubmit(false)}
              disabled={isLoading}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Direkt speichern
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Neuen Experten hinzufügen</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Required Fields Section */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-4 mb-6">
              <h3 className="font-semibold text-blue-800">Erforderliche Felder</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Firma <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Persönliche Informationen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Titel</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Kontaktinformationen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <input
                    type="tel"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Stadt</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Land</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Fachliche Informationen</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Expertise (mit Komma getrennt)</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="KI, Machine Learning, Data Science"
                  onChange={(e) => handleArrayChange('expertise', e.target.value)}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Technologien (mit Komma getrennt)</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Python, TensorFlow, PyTorch"
                  onChange={(e) => handleArrayChange('technologies', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Publikationen (Anzahl)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.publications}
                    onChange={(e) => setFormData(prev => ({ ...prev, publications: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">H-Index</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.hIndex}
                    onChange={(e) => setFormData(prev => ({ ...prev, hIndex: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Social Media & Web Presence */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Online Präsenz</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                  <input
                    type="url"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Twitter URL</label>
                  <input
                    type="url"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.twitter_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitter_url: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    type="url"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Zusätzliche Informationen</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Biographie</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Sprachen (mit Komma getrennt)</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Deutsch, Englisch, Französisch"
                  onChange={(e) => handleArrayChange('languages', e.target.value)}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Zertifizierungen (mit Komma getrennt)</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="AWS Certified, Google Cloud Professional"
                  onChange={(e) => handleArrayChange('certifications', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Experten erstellen
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExpertFormPopup; 