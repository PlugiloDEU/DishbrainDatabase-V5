import React from 'react';
import Component3DButtonDesign from './component-3-d-button-design';

export default function FilterModal({ 
    showFilterModal, 
    setShowFilterModal, 
    activeFilters, 
    setActiveFilters,
    handleSearch 
}) {
    if (!showFilterModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-blue-500 p-6 rounded-lg shadow-lg border border-black w-[500px] max-h-[90vh] transform transition-transform hover:scale-105">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Filter Optionen</h3>
                    <button 
                        onClick={() => setShowFilterModal(false)}
                        className="text-white hover:text-gray-200"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 160px)' }}>
                    <div className="space-y-6">
                        {/* Expertise Section */}
                        <div>
                            <label className="block text-white mb-2 font-medium">Expertise</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    'Machine Learning',
                                    'Deep Learning',
                                    'Computer Vision',
                                    'NLP',
                                    'Robotik',
                                    'Data Science',
                                    'Neural Networks',
                                    'Reinforcement Learning'
                                ].map((expertise) => (
                                    <div 
                                        key={expertise}
                                        onClick={() => {
                                            const newExpertise = activeFilters.expertise.includes(expertise)
                                                ? activeFilters.expertise.filter(e => e !== expertise)
                                                : [...activeFilters.expertise, expertise];
                                            setActiveFilters({...activeFilters, expertise: newExpertise});
                                        }}
                                        className={`
                                            p-2 rounded cursor-pointer transition-colors
                                            border-2 border-white
                                            ${activeFilters.expertise.includes(expertise)
                                                ? 'bg-white text-blue-500 font-medium'
                                                : 'bg-transparent text-white hover:bg-white/10'}
                                        `}
                                    >
                                        {expertise}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Experience Level */}
                        <div>
                            <label className="block text-white mb-2 font-medium">Erfahrungslevel</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: 'Junior', value: 'junior' },
                                    { label: 'Middle', value: 'middle' },
                                    { label: 'Senior', value: 'senior' }
                                ].map((level) => (
                                    <div
                                        key={level.value}
                                        onClick={() => setActiveFilters({
                                            ...activeFilters,
                                            experienceLevel: level.value
                                        })}
                                        className={`
                                            p-2 rounded cursor-pointer text-center transition-colors
                                            border-2 border-white
                                            ${activeFilters.experienceLevel === level.value
                                                ? 'bg-white text-blue-500 font-medium'
                                                : 'bg-transparent text-white hover:bg-white/10'}
                                        `}
                                    >
                                        {level.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Availability Section */}
                        <div>
                            <label className="block text-white mb-2 font-medium">Verfügbarkeit</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'Sofort verfügbar', value: 'immediate' },
                                    { label: 'Diese Woche', value: 'this_week' },
                                    { label: 'Nächster Monat', value: 'next_month' },
                                    { label: 'Remote möglich', value: 'remote' }
                                ].map((availability) => (
                                    <div
                                        key={availability.value}
                                        onClick={() => setActiveFilters({
                                            ...activeFilters,
                                            availability: availability.value
                                        })}
                                        className={`
                                            p-2 rounded cursor-pointer transition-colors
                                            border-2 border-white
                                            ${activeFilters.availability === availability.value
                                                ? 'bg-white text-blue-500 font-medium'
                                                : 'bg-transparent text-white hover:bg-white/10'}
                                        `}
                                    >
                                        {availability.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location Section */}
                        <div>
                            <label className="block text-white mb-2 font-medium">Standort</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    'Berlin',
                                    'München',
                                    'Hamburg',
                                    'Frankfurt',
                                    'Köln',
                                    'Stuttgart',
                                    'Dresden',
                                    'Leipzig',
                                    'Düsseldorf'
                                ].map((location) => (
                                    <div
                                        key={location}
                                        onClick={() => {
                                            const newLocations = activeFilters.locations?.includes(location)
                                                ? activeFilters.locations.filter(l => l !== location)
                                                : [...(activeFilters.locations || []), location];
                                            setActiveFilters({...activeFilters, locations: newLocations});
                                        }}
                                        className={`
                                            p-2 rounded cursor-pointer text-center transition-colors
                                            border-2 border-white
                                            ${activeFilters.locations?.includes(location)
                                                ? 'bg-white text-blue-500 font-medium'
                                                : 'bg-transparent text-white hover:bg-white/10'}
                                        `}
                                    >
                                        {location}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Filters */}
                        <div>
                            <label className="block text-white mb-2 font-medium">Weitere Filter</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'Mit Publikationen', value: 'has_publications' },
                                    { label: 'Zertifiziert', value: 'certified' },
                                    { label: 'Projektleiter', value: 'project_lead' },
                                    { label: 'Internationale Erfahrung', value: 'international' }
                                ].map((filter) => (
                                    <div
                                        key={filter.value}
                                        onClick={() => {
                                            const newAdditionalFilters = activeFilters.additionalFilters?.includes(filter.value)
                                                ? activeFilters.additionalFilters.filter(f => f !== filter.value)
                                                : [...(activeFilters.additionalFilters || []), filter.value];
                                            setActiveFilters({...activeFilters, additionalFilters: newAdditionalFilters});
                                        }}
                                        className={`
                                            p-2 rounded cursor-pointer transition-colors
                                            border-2 border-white
                                            ${activeFilters.additionalFilters?.includes(filter.value)
                                                ? 'bg-white text-blue-500 font-medium'
                                                : 'bg-transparent text-white hover:bg-white/10'}
                                        `}
                                    >
                                        {filter.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between mt-4 pt-3 border-t border-white/20">
                    <Component3DButtonDesign 
                        onClick={() => {
                            setActiveFilters({
                                expertise: [],
                                experienceLevel: null,
                                availability: 'all',
                                locations: [],
                                additionalFilters: []
                            });
                        }}
                        className="bg-white text-blue-500 hover:bg-gray-100 text-sm px-3 py-1.5"
                    >
                        <i className="fas fa-undo-alt mr-1"></i>
                        Zurücksetzen
                    </Component3DButtonDesign>
                    
                    <div className="space-x-2">
                        <Component3DButtonDesign 
                            onClick={() => setShowFilterModal(false)} 
                            className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1.5"
                        >
                            <i className="fas fa-times mr-1"></i>
                            Abbrechen
                        </Component3DButtonDesign>
                        <Component3DButtonDesign 
                            onClick={() => {
                                handleSearch();
                                setShowFilterModal(false);
                            }} 
                            className="bg-white text-blue-500 hover:bg-gray-100 text-sm px-3 py-1.5"
                        >
                            <i className="fas fa-check mr-1"></i>
                            Anwenden
                        </Component3DButtonDesign>
                    </div>
                </div>
            </div>
        </div>
    );
} 