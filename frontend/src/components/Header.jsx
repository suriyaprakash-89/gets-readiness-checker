import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { CheckCircle, LogOut } from "lucide-react";

// Step component remains unchanged
const Step = ({ number, title, active, completed }) => (
  <div className="flex items-center">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition-colors ${
        completed ? "bg-green-500" : active ? "bg-brand-primary" : "bg-gray-300"
      }`}
    >
      {completed ? <CheckCircle size={20} /> : number}
    </div>
    <div
      className={`ml-3 font-medium transition-colors ${
        active || completed ? "text-gray-800" : "text-gray-500"
      }`}
    >
      {title}
    </div>
  </div>
);

const Header = ({ currentStep }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="relative">
      {/* --- FIX: User info and Sign Out button --- */}
      {user && (
        <div className="flex justify-end items-center mb-4 h-8">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden md:block">
              Signed in as <strong className="font-medium">{user.email}</strong>
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-brand-primary font-medium transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* --- Main Header Content --- */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-primary">
          E-Invoicing Readiness & Gap Analyzer
        </h1>
        <p className="mt-2 text-gray-600">
          Check how close your invoice data is to standard e-invoicing schemas.
        </p>
      </div>

      {/* Wizard Steps */}
      {currentStep > 0 && (
        <nav className="mt-8 flex justify-center items-center space-x-4 md:space-x-8">
          <Step
            number={1}
            title="Context"
            active={currentStep === 1}
            completed={currentStep > 1}
          />
          <div className="flex-1 h-0.5 bg-gray-300"></div>
          <Step
            number={2}
            title="Upload"
            active={currentStep === 2}
            completed={currentStep > 2}
          />
          <div className="flex-1 h-0.5 bg-gray-300"></div>
          <Step
            number={3}
            title="Results"
            active={currentStep === 3}
            completed={currentStep > 3}
          />
        </nav>
      )}
    </header>
  );
};

export default Header;
