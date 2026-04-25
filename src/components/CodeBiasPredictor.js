"use client";

import { useState, useRef } from "react";

export default function CodeBiasPredictor() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith(".zip")) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid ZIP file.");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setResults(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const response = await fetch(`${apiUrl}/audit-code`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSample = () => {
    window.open("/samples/sample_bias_code.py", "_blank");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-medium tracking-tight text-on-surface">
            Code Bias <span className="text-primary italic">Predictor</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed">
            Upload your project's ZIP file to identify algorithmic biases in your code. 
            Our analyzer scans logical branches and sensitive attribute usage.
          </p>
        </div>
        <button
          onClick={downloadSample}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: "rgba(0, 240, 255, 0.08)",
            color: "var(--primary)",
            border: "1px solid rgba(0, 240, 255, 0.2)",
          }}
        >
          <span className="material-symbols-outlined text-[20px]">download</span>
          Download Sample Code
        </button>
      </div>

      {/* Upload Card */}
      <div 
        className="relative p-10 rounded-[2rem] overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center animate-pulse-subtle"
            style={{
              background: "linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(186, 104, 200, 0.1))",
              border: "1px solid rgba(0, 240, 255, 0.2)",
            }}
          >
            <span className="material-symbols-outlined text-[40px] text-primary">folder_zip</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium text-on-surface">
              {file ? file.name : "Select your codebase ZIP"}
            </h3>
            <p className="text-sm text-on-surface-variant">
              Supported files: .py, .js, .java, .cpp, .go, and more.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-8 py-3 rounded-2xl text-sm font-medium bg-surface hover:bg-surface-variant transition-colors duration-200 border border-outline-variant"
            >
              Browse Files
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`px-8 py-3 rounded-2xl text-sm font-medium transition-all duration-300 shadow-lg ${
                !file || isUploading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 hover:shadow-primary/20 active:scale-95"
              }`}
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                color: "white",
              }}
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </div>
              ) : (
                "Run Predictor"
              )}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleFileChange}
          />

          {error && (
            <p className="text-error text-sm font-medium animate-shake">{error}</p>
          )}
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">fact_check</span>
            </div>
            <h2 className="text-2xl font-serif font-medium">
              Analysis Results 
              <span className="ml-3 text-sm font-sans font-normal text-on-surface-variant uppercase tracking-widest">
                {results.length} Issues Found
              </span>
            </h2>
          </div>

          {results.length === 0 ? (
            <div className="p-12 rounded-[2rem] bg-success/5 border border-success/20 text-center space-y-4">
              <span className="material-symbols-outlined text-[48px] text-success">check_circle</span>
              <p className="text-lg font-medium text-success">No bias detected in your code!</p>
              <p className="text-on-surface-variant">Your codebase seems to follow fairness best practices regarding sensitive attribute usage.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {results.map((issue, idx) => (
                <div 
                  key={idx}
                  className="p-6 rounded-3xl group transition-all duration-300 hover:translate-x-2"
                  style={{
                    background: "rgba(255, 255, 255, 0.6)",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-error/10 text-error">
                          High Risk
                        </span>
                        <span className="text-sm font-medium text-on-surface-variant">
                          {issue.file} : Line {issue.line}
                        </span>
                      </div>
                      <p className="text-on-surface font-medium leading-relaxed">
                        {issue.reason}
                      </p>
                      <div className="p-4 rounded-xl bg-surface/50 border border-outline-variant/30 font-mono text-sm overflow-x-auto whitespace-nowrap">
                        <span className="text-on-surface-variant mr-3 opacity-50">{issue.line}</span>
                        <span className="text-on-surface">{issue.snippet}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-error/5 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-error">warning</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
