import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import CustomSelect from "../components/CustomSelect";

const countryOptions = [
  { id: "US", name: "United States" },
  { id: "CA", name: "Canada" },
  { id: "GB", name: "United Kingdom" },
  { id: "DE", name: "Germany" },
  { id: "FR", name: "France" },
  { id: "AE", name: "United Arab Emirates" },
  { id: "SA", name: "Saudi Arabia" },
];

const erpOptions = [
  { id: "SAP", name: "SAP" },
  { id: "Oracle NetSuite", name: "Oracle NetSuite" },
  { id: "QuickBooks", name: "QuickBooks" },
  { id: "Xero", name: "Xero" },
  { id: "Custom/In-house", name: "Custom / In-house" },
  { id: "Other", name: "Other" },
];

const Step1Context = () => {
  const { contextData, setContextData } = useContext(AppContext);
  const navigate = useNavigate();

  // Local state to manage the selected object for the custom select component
  const [selectedCountry, setSelectedCountry] = useState(
    countryOptions.find((o) => o.id === contextData.country) ||
      countryOptions[0]
  );
  const [selectedErp, setSelectedErp] = useState(
    erpOptions.find((o) => o.id === contextData.erp) || erpOptions[5]
  );

  const handlePostureChange = (e) => {
    setContextData((prev) => ({ ...prev, posture: parseInt(e.target.value) }));
  };

  const handleCountryChange = (option) => {
    setSelectedCountry(option);
    setContextData((prev) => ({ ...prev, country: option.id }));
  };

  const handleErpChange = (option) => {
    setSelectedErp(option);
    setContextData((prev) => ({ ...prev, erp: option.id }));
  };

  return (
    <div className="animate-slide-in">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Tell us about your setup
      </h2>
      <p className="text-gray-600 mb-8">
        This helps us tailor the readiness score to your situation.
      </p>

      <div className="space-y-8">
        <CustomSelect
          label="Operating Country"
          options={countryOptions}
          selected={selectedCountry}
          onChange={handleCountryChange}
        />

        <CustomSelect
          label="Primary ERP/Accounting System"
          options={erpOptions}
          selected={selectedErp}
          onChange={handleErpChange}
        />

        <div>
          <label
            htmlFor="posture"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            How prepared is your organization for automation?
          </label>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Just Starting</span>
            <input
              type="range"
              id="posture"
              name="posture"
              min="0"
              max="100"
              step="10"
              value={contextData.posture}
              onChange={handlePostureChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <span className="text-sm text-gray-500">Fully Prepared</span>
          </div>
          <p className="text-center font-bold text-brand-primary mt-2 text-lg">
            {contextData.posture}%
          </p>
        </div>
      </div>

      <div className="mt-10 text-right">
        <button
          onClick={() => navigate("/upload")}
          className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-6 rounded-md transition-all duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
        >
          Next: Upload Data
        </button>
      </div>
    </div>
  );
};

export default Step1Context;
