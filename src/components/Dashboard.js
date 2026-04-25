"use client";

import { useState, useRef, useEffect } from "react";
import AnalysisResults from "./AnalysisResults";
import ErrorToast from "./ErrorToast";

export default function Dashboard({ selectedDomain, onAuditComplete }) {
  const [file, setFile] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [errorToast, setErrorToast] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsValidated(false);
      setErrorToast("");
      setAnalysisResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setIsValidated(false);
      setErrorToast("");
      setAnalysisResult(null);
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    setIsValidating(true);
    setErrorToast("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("domain", selectedDomain);

    try {
      const response = await fetch("/api/audit", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Validation failed");
      }

      setIsValidated(true);
      const resultWithMeta = { ...data, datasetName: file.name };
      setAnalysisResult(resultWithMeta);
      if (onAuditComplete) onAuditComplete(resultWithMeta);

      // Run simulation to get recommended mitigation strategy
      let mitigation = "Threshold Adjustment";
      let newScore = Math.min(100, data.overall_fairness_score + 15);
      try {
        const simRes = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            overall_fairness_score: data.overall_fairness_score,
            categories: data.categories,
          }),
        });
        const simData = await simRes.json();
        if (simData.strategies && simData.recommendedId) {
          const recommended = simData.strategies.find(
            (s) => s.id === simData.recommendedId
          );
          if (recommended) {
            mitigation = recommended.name;
            newScore = recommended.fairness;
          }
        }
      } catch {
        // fallback values are fine
      }

      // Save to localStorage for history
      const newItem = {
        id: Date.now(),
        datasetName: file.name,
        domain: selectedDomain,
        originalScore: data.overall_fairness_score,
        mitigation,
        newScore,
        date: new Date().toISOString().split("T")[0],
      };
      const existing = JSON.parse(localStorage.getItem("auditHistory") || "[]");
      localStorage.setItem("auditHistory", JSON.stringify([newItem, ...existing]));
    } catch (error) {
      setIsValidated(false);
      setErrorToast(error.message || "Validation failed");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <ErrorToast message={errorToast} onClose={() => setErrorToast("")} />

      {/* Hero */}
      <div className="mb-10">
        <p
          className="text-xs font-semibold uppercase tracking-[0.15em] mb-3"
          style={{ color: "var(--primary)" }}
        >
          Audit Dashboard
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-on-surface leading-tight mb-4">
          Ethical Audit
          <br />
          <span style={{ color: "var(--primary)" }}>Guardian.</span>
        </h1>
        <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
          Initialize a comprehensive fairness evaluation on your dataset. Our models seek out biases with absolute clarity.
        </p>
      </div>

      {/* Upload Card */}
      <div className="glass-card p-8 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-[20px]">cloud_upload</span>
          <h3 className="font-serif text-xl font-normal text-on-surface">
            Drop Dataset
          </h3>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept=".csv"
        />

        {!file ? (
          <div
            className={`upload-zone ${isDragOver ? "active" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <span
              className="material-symbols-outlined mb-3"
              style={{ fontSize: "48px", color: "var(--primary-container)" }}
            >
              cloud_upload
            </span>
            <p className="text-on-surface font-medium mb-1">
              Drag and drop your CSV files here, or click to browse.
            </p>
            <p className="text-xs text-on-surface-variant">CSV Files Only</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* File info */}
            <div
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.5)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              <span className="material-symbols-outlined text-primary text-[24px]">
                description
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-on-surface truncate">{file.name}</p>
                <p className="text-xs text-on-surface-variant">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                className="text-sm text-primary font-medium hover:underline transition-all"
                onClick={() => { setFile(null); setAnalysisResult(null); setIsValidated(false); }}
              >
                Change
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                className={`pill-btn pill-btn-primary ${!isValidated && !isValidating ? "animate-pulse-glow" : ""}`}
                onClick={handleValidate}
                disabled={isValidating || isValidated}
              >
                {isValidating ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Validating…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">shield_with_heart</span>
                    Validate & Audit Dataset
                  </>
                )}
              </button>
              {isValidated && (
                <span className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--status-pass)" }}>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Audit Complete
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recent Audits (from localStorage) */}
      <RecentAudits />

      {/* Analysis Results */}
      <AnalysisResults result={analysisResult} />
    </div>
  );
}

function RecentAudits() {
  const [audits, setAudits] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("auditHistory") || "[]");
    setAudits(stored.slice(0, 3));
  }, []);

  if (audits.length === 0) return null;

  return (
    <div className="mb-10 animate-fade-in">
      <h3 className="font-serif text-lg font-normal text-on-surface mb-4">Recent Audits</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {audits.map((a) => (
          <div
            key={a.id}
            className="glass-card p-4 flex items-center gap-3"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{
                color: a.originalScore >= 80 ? "var(--status-pass)" : "var(--status-fail)",
              }}
            >
              {a.originalScore >= 80 ? "shield_with_heart" : "warning"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">{a.datasetName}</p>
              <p className="text-xs text-on-surface-variant">{a.date}</p>
            </div>
            <span
              className={`status-pill text-xs ${a.originalScore >= 80 ? "status-pass" : "status-fail"}`}
            >
              {a.originalScore >= 80 ? "Fair" : "Bias"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
