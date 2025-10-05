import React, { useState, createContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast"; 
import Step1Context from "./pages/Step1Context";
import Step2Upload from "./pages/Step2Upload";
import Step3Results from "./pages/Step3Results";
import ReportShare from "./pages/ReportShare";
import Header from "./components/Header";
import Loader from "./components/Loader";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export const AppContext = createContext();

function MainLayout() {
  const [contextData, setContextData] = useState({
    country: "US",
    erp: "Other",
    posture: 50,
  });
  const [uploadData, setUploadData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const location = useLocation();

  const getCurrentStep = () => {
    switch (location.pathname) {
      case "/":
        return 1;
      case "/upload":
        return 2;
      case "/results":
        return 3;
      default:
        return 0;
    }
  };

  const value = {
    contextData,
    setContextData,
    uploadData,
    setUploadData,
    analysisResult,
    setAnalysisResult,
    isLoading,
    setIsLoading,
    error,
    setError,
  };

  return (
    <AppContext.Provider value={value}>
      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        <Header currentStep={getCurrentStep()} />
        <main className="mt-8 bg-white p-6 md:p-10 rounded-lg shadow-md min-h-[300px]">
          {isLoading ? (
            <Loader message="Analyzing your data..." />
          ) : (
            <Routes>
              <Route path="/" element={<Step1Context />} />
              <Route path="/upload" element={<Step2Upload />} />
              <Route path="/results" element={<Step3Results />} />
            </Routes>
          )}
        </main>
      </div>
    </AppContext.Provider>
  );
}
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: "#F0FFF4",
              color: "#2F855A", 
            },
          },
          error: {
            style: {
              background: "#FFF5F5", 
              color: "#C53030", 
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/report/:id" element={<ReportShare />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<MainLayout />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
