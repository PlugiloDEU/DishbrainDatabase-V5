'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/export');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Export failed');
      }

      toast.success('Export erfolgreich! Die CSV-Dateien wurden erstellt.');
      
      // Optional: Download the files directly
      window.location.href = '/data/exports/ai_experts.csv';
      setTimeout(() => {
        window.location.href = '/data/exports/ai_companies.csv';
      }, 1000);

    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export fehlgeschlagen: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {isExporting ? 'Exportiere...' : 'Als CSV exportieren'}
    </button>
  );
} 