import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

const ExpertFormPopup = ({ expert, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    titel: '',
    fullName: '',
    position: '',
    organisation: '',
    fachgebiet: '',
    dateOfBirth: '',
    nationality: '',
    expertise: [],
    education: { fields: [], universities: [], degrees: [] },
    academicPositions: [],
    kontakt: { email: '', phone: '', website: '', address: '' },
    social_media: { linkedin: '', twitter: '', github: '' },
    standort: '',
    selectedPublications: [],
    professionalMemberships: [],
    awards: [],
    sources: {},
    data_quality: { completeness: 0.85, verification_level: 'medium' },
    image_url: ''
  });

  useEffect(() => {
    if (expert) {
      // Deep clone expert data to avoid mutation
      const initialData = JSON.parse(JSON.stringify(expert));
      setFormData(initialData);
    }
  }, [expert]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleAddArrayItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const handleRemoveArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{expert ? 'Experte bearbeiten' : 'Neuen Experten erstellen'}</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ID</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Titel</label>
              <input
                type="text"
                name="titel"
                value={formData.titel}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Vollständiger Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Position</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Organisation</label>
              <input
                type="text"
                name="organisation"
                value={formData.organisation}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Contact & Social Media */}
          <div className="space-y-4">
              <div>
              <label className="block text-sm font-medium mb-1">E-Mail</label>
                  <input
                    type="email"
                name="email"
                value={formData.kontakt.email}
                onChange={(e) => handleNestedChange('kontakt', 'email', e.target.value)}
                className="w-full p-2 border rounded"
                  />
                </div>

                <div>
              <label className="block text-sm font-medium mb-1">Telefon</label>
                  <input
                    type="tel"
                name="phone"
                value={formData.kontakt.phone}
                onChange={(e) => handleNestedChange('kontakt', 'phone', e.target.value)}
                className="w-full p-2 border rounded"
                  />
                </div>

                <div>
              <label className="block text-sm font-medium mb-1">LinkedIn</label>
                  <input
                type="url"
                name="linkedin"
                value={formData.social_media.linkedin}
                onChange={(e) => handleNestedChange('social_media', 'linkedin', e.target.value)}
                className="w-full p-2 border rounded"
                  />
                </div>

                <div>
              <label className="block text-sm font-medium mb-1">Twitter</label>
                  <input
                    type="url"
                name="twitter"
                value={formData.social_media.twitter}
                onChange={(e) => handleNestedChange('social_media', 'twitter', e.target.value)}
                className="w-full p-2 border rounded"
                  />
                </div>

                <div>
              <label className="block text-sm font-medium mb-1">GitHub</label>
                  <input
                    type="url"
                name="github"
                value={formData.social_media.github}
                onChange={(e) => handleNestedChange('social_media', 'github', e.target.value)}
                className="w-full p-2 border rounded"
                  />
                </div>

                <div>
              <label className="block text-sm font-medium mb-1">Bild-URL</label>
                  <input
                    type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                  />
                </div>
              </div>

          {/* Expertise Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">Expertise</h3>
            {formData.expertise.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange('expertise', index, e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('expertise', index)}
                  className="px-2 bg-red-500 text-white rounded"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('expertise')}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Expertise hinzufügen
            </button>
              </div>

          {/* Education Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">Ausbildung</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Studienfelder</label>
                {formData.education.fields.map((field, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                      value={field}
                      onChange={(e) => handleNestedChange('education', 'fields', 
                        formData.education.fields.map((f, i) => i === index ? e.target.value : f)
                      )}
                      className="flex-1 p-2 border rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleNestedChange('education', 'fields', 
                        formData.education.fields.filter((_, i) => i !== index)
                      )}
                      className="px-2 bg-red-500 text-white rounded"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleNestedChange('education', 'fields', [...formData.education.fields, ''])}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Feld hinzufügen
                </button>
              </div>

              {/* Similar sections for universities and degrees */}
              </div>
            </div>

          {/* Submit Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Abbrechen
              </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {expert ? 'Aktualisieren' : 'Erstellen'}
            </button>
            </div>
          </form>
        </div>
    </div>
  );
};

export default ExpertFormPopup; 