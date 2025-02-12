import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const CompanyFormPopup = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: uuidv4(),
    name: '', // required
    website: '', // required
    legal_name: '',
    industry: '',
    company_type: '',
    founded_year: '',
    employee_count: '',
    revenue_range: '',
    description: '',
    city: '',
    country: '',
    street_address: '',
    postal_code: '',
    phone: '',
    email: '',
    linkedin_url: '',
    twitter_url: '',
    facebook_url: '',
    technologies: [],
    ai_focus_areas: [],
    products: [],
    services: []
  });

  const [showEnrichmentDialog, setShowEnrichmentDialog] = useState(false);
  const [enrichmentOptions, setEnrichmentOptions] = useState({
    companyInfo: true,
    socialMedia: true,
    technologies: true,
    products: true,
    financials: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const industryOptions = [
    'Artificial Intelligence',
    'Machine Learning',
    'Computer Vision',
    'Natural Language Processing',
    'Robotics',
    'Data Analytics',
    'Cloud Computing',
    'Internet of Things',
    // ... add more
  ];

  const validateWebsite = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    if (!formData.name || !formData.website) {
      setError('Firmenname und Website sind erforderlich');
      setIsLoading(false);
      return;
    }

    if (!validateWebsite(formData.website)) {
      setError('Bitte geben Sie eine gültige Website-URL ein (inkl. https:// oder http://)');
      setIsLoading(false);
      return;
    }

    try {
      setShowEnrichmentDialog(true);
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Fehler bei der Vorbereitung der Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrichmentSubmit = async (enrich) => {
    setIsLoading(true);
    try {
      const urlFriendlyId = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      let companyData = {
        ...formData,
        id: urlFriendlyId,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };

      if (enrich) {
        const enrichedData = await enrichCompanyData(companyData, enrichmentOptions);
        companyData = { ...companyData, ...enrichedData };
      }

      await onSubmit(companyData);
      
      toast.success('Firma erfolgreich erstellt');
      onClose();

    } catch (error) {
      console.error('Error creating company:', error);
      toast.error(error.message || 'Fehler beim Erstellen der Firma');
    } finally {
      setIsLoading(false);
    }
  };

  const enrichCompanyData = async (companyData, options) => {
    try {
      const response = await fetch('/api/enrich-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: companyData,
          options: options
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enrich company data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error enriching data:', error);
      throw error;
    }
  };

  const handleArrayChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  // Add this component for loading animation
  const LoadingSpinner = () => (
    <motion.div
      className="flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );

  const SuccessCheck = () => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <motion.div
        className="bg-white rounded-full p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.svg
          className="w-16 h-16 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {showEnrichmentDialog ? (
          <motion.div 
            className="bg-white rounded-lg p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <h2 className="text-xl font-bold mb-4">KI-Anreicherung der Firmendaten</h2>
            <p className="mb-4">Möchten Sie die Firmendaten mit KI anreichern?</p>

            <div className="flex gap-4">
              <button
                onClick={() => handleEnrichmentSubmit(true)}
                disabled={isLoading}
                className={`flex-1 ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded-lg transition-colors`}
              >
                {isLoading ? 'Wird verarbeitet...' : 'Ja, mit KI anreichern'}
              </button>
              <button
                onClick={() => handleEnrichmentSubmit(false)}
                disabled={isLoading}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Nein, direkt speichern
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <motion.div 
              className="flex justify-between items-center mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold">Neue Firma hinzufügen</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <i className="fas fa-times"></i>
              </button>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                className="bg-blue-50 p-4 rounded-lg space-y-4 mb-6"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-semibold text-blue-800">Erforderliche Felder</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Firmenname <span className="text-red-500">*</span>
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
                    Website <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.example.com"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Vollständige URL inkl. https:// oder http://
                  </p>
                </div>
              </motion.div>

              {['basic', 'contact', 'address', 'social', 'tech'].map((section, index) => (
                <motion.div
                  key={section}
                  className="border-t pt-4"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + (index * 0.1) }}
                >
                  <h3 className="font-semibold mb-4">{section.charAt(0).toUpperCase() + section.slice(1)}</h3>
                  {section === 'basic' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Offizieller Name</label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={formData.legal_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, legal_name: e.target.value }))}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Branche</label>
                          <input
                            type="text"
                            list="industries"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={formData.industry}
                            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                          />
                          <datalist id="industries">
                            {industryOptions.map(industry => (
                              <option key={industry} value={industry} />
                            ))}
                          </datalist>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Unternehmenstyp</label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={formData.company_type}
                            onChange={(e) => setFormData(prev => ({ ...prev, company_type: e.target.value }))}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Gründungsjahr</label>
                          <input
                            type="number"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={formData.founded_year}
                            onChange={(e) => setFormData(prev => ({ ...prev, founded_year: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
                        <textarea
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          rows="3"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                    </>
                  )}

                  {section === 'contact' && (
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
                    </div>
                  )}

                  {section === 'address' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Straße</label>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={formData.street_address}
                          onChange={(e) => setFormData(prev => ({ ...prev, street_address: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">PLZ</label>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={formData.postal_code}
                          onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
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
                  )}

                  {section === 'social' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                        <input
                          type="url"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={formData.linkedin_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Twitter</label>
                        <input
                          type="url"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={formData.twitter_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, twitter_url: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Facebook</label>
                        <input
                          type="url"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={formData.facebook_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {section === 'tech' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Technologien (mit Komma getrennt)</label>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Python, TensorFlow, AWS, etc."
                          onChange={(e) => handleArrayChange('technologies', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">KI-Fokusgebiete (mit Komma getrennt)</label>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Machine Learning, Computer Vision, NLP, etc."
                          onChange={(e) => handleArrayChange('ai_focus_areas', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              <motion.div
                className="flex gap-4 mt-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95`}
                >
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Firma erstellen
                    </motion.span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Abbrechen
                </button>
              </motion.div>
            </form>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CompanyFormPopup; 