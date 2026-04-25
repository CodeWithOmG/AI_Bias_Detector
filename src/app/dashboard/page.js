"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Dashboard from "@/components/Dashboard";
import ModelInspection from "@/components/ModelInspection";
import MitigationHistory from "@/components/MitigationHistory";
import CodeBiasPredictor from "@/components/CodeBiasPredictor";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDomain, setSelectedDomain] = useState("Universal");
  const [analysisResult, setAnalysisResult] = useState(null);

  return (
    <>
      {/* Background Blobs */}
      <div className="blob blob-cyan" />
      <div className="blob blob-lavender" />
      <div className="blob blob-rose" />

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDomain={selectedDomain}
        setSelectedDomain={setSelectedDomain}
      />

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-6 pt-28 pb-12">
        {activeTab === "dashboard" && (
          <Dashboard
            selectedDomain={selectedDomain}
            onAuditComplete={setAnalysisResult}
          />
        )}
        {activeTab === "models" && (
          <ModelInspection analysisResult={analysisResult} />
        )}
        {activeTab === "code-bias" && (
          <CodeBiasPredictor />
        )}
        {activeTab === "history" && (
          <MitigationHistory selectedDomain={selectedDomain} />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
