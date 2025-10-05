import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import { uploadFile, analyzeData } from "../api";
import TablePreview from "../components/TablePreview";
import { UploadCloud, FileCheck, AlertTriangle } from "lucide-react";

const Step2Upload = () => {
  const {
    contextData,
    uploadData,
    setUploadData,
    setAnalysisResult,
    setIsLoading,
    error,
    setError,
  } = useContext(AppContext);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const handleFileChange = (e) => {
    setError("");
    setUploadData(null);
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleUpload(selectedFile);
    }
  };
  const handleUpload = async (fileToUpload) => {
    setIsLoading(true);
    try {
      const { data } = await uploadFile(fileToUpload);
      setUploadData(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload file.");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAnalyze = async () => {
    if (!uploadData) return;
    setIsLoading(true);
    setError("");
    try {
      const payload = {
        uploadId: uploadData.uploadId,
        fileData: uploadData.fullData,
        context: contextData,
      };
      const { data } = await analyzeData(payload);
      setAnalysisResult(data);
      navigate("/results");
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-slide-in">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Upload Your Invoice Data
      </h2>
      <p className="text-gray-600 mb-6">
        Upload a CSV or JSON file. We'll analyze the first 200 rows.
      </p>

      {/* --- FIX: The entire div is now wrapped in the label --- */}
      <label htmlFor="file-upload" className="w-full cursor-pointer">
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-brand-primary">
            <span className="hover:underline">
              {file ? "Choose a different file" : "Click to upload a file"}
            </span>
          </p>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            accept=".csv, .json"
          />
          <p className="text-xs text-gray-500 mt-1">
            or drag and drop CSV or JSON (up to 5MB)
          </p>

          {uploadData && (
            <div className="mt-4 flex items-center justify-center text-green-700 bg-green-100 p-2 rounded-md">
              <FileCheck className="w-5 h-5 mr-2" />
              <span className="font-medium text-sm">
                {uploadData.fileName} uploaded successfully.
              </span>
            </div>
          )}
          {error && (
            <div className="mt-4 flex items-center justify-center text-red-700 bg-red-100 p-2 rounded-md">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="font-medium text-sm">{error}</span>
            </div>
          )}
        </div>
      </label>

      {uploadData && (
        <div className="mt-8">
          {/* --- FIX: Display filename above the table --- */}
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Preview for:{" "}
            <span className="font-mono bg-gray-100 p-1 rounded-md text-brand-primary">
              {uploadData.fileName}
            </span>
          </h3>
          <TablePreview data={uploadData.previewData} />
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigate("/")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-md transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleAnalyze}
          disabled={!uploadData}
          className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-6 rounded-md transition-all duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
        >
          Analyze Data
        </button>
      </div>
    </div>
  );
};

export default Step2Upload;
