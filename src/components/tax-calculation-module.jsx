"use client";
import React, { useState } from 'react';
import Component3DButtonDesign from "../components/component-3-d-button-design";

const TaxCalculationModule = ({ title = "Tax Calculator" }) => {
  const [income, setIncome] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formattedTitle = title ? title
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") : "Tax Calculator";

  const calculateTax = async () => {
    setLoading(true);
    setError("");
    try {
      const incomeNum = parseFloat(income);
      const rateNum = parseFloat(taxRate);
      
      if (!isNaN(incomeNum) && !isNaN(rateNum)) {
        const taxAmount = (incomeNum * rateNum) / 100;
        setResult({
          taxAmount,
          netIncome: incomeNum - taxAmount
        });
      }
    } catch (err) {
      setError(
        "An error occurred while calculating the tax. Please try again."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg border border-black max-w-md w-full">
      <h3 className="text-3xl font-bold mb-6">{formattedTitle}</h3>
      <p className="mb-4 font-cabin">Calculate your taxes</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Einkommen
          </label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Geben Sie Ihr Einkommen ein"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Steuersatz (%)
          </label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Geben Sie den Steuersatz ein"
          />
        </div>

        <Component3DButtonDesign onClick={calculateTax} disabled={loading}>
          {loading ? "Calculating..." : "Calculate Tax"}
        </Component3DButtonDesign>

        {error && <div className="mt-4 text-red-500 font-cabin">{error}</div>}

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Ergebnis:</h3>
            <p>Steuerbetrag: €{result.taxAmount.toFixed(2)}</p>
            <p>Nettoeinkommen: €{result.netIncome.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

function TaxCalculationModuleStory() {
  return (
    <div className="bg-[#F5F5F5] min-h-screen flex items-center justify-center p-4">
      <TaxCalculationModule title="Tax Calculation" />
    </div>
  );
}

export default TaxCalculationModule;