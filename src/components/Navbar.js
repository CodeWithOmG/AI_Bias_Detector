"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "shield_with_heart" },
  { id: "models", label: "Metrics", icon: "analytics" },
  { id: "code-bias", label: "Code Bias", icon: "code_blocks" },
  { id: "history", label: "Logs", icon: "history" },
];

const DOMAINS = ["Universal", "Healthcare", "Finance", "Hiring"];

export default function Navbar({ activeTab, setActiveTab, selectedDomain, setSelectedDomain }) {
  const [domainOpen, setDomainOpen] = useState(false);

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div
        className="flex items-center gap-1 px-2 py-2 rounded-full"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.4)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 px-4 pr-6 border-r border-outline-variant/30 mr-1 hover:opacity-80 transition-opacity cursor-pointer">
          <span className="font-serif text-lg font-medium tracking-tight text-primary">
            Fair
          </span>
          <span
            className="text-[0.625rem] font-sans font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              color: "white",
            }}
          >
            MIND
          </span>
        </Link>

        {/* Nav Items */}
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                background: isActive ? "rgba(0, 240, 255, 0.1)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--on-surface-variant)",
              }}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
              {isActive && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{
                    background: "var(--primary-container)",
                    boxShadow: "0 0 8px var(--primary-container)",
                  }}
                />
              )}
            </button>
          );
        })}

        {/* Domain Selector */}
        <div className="relative ml-2 pl-2 border-l border-outline-variant/30">
          <button
            onClick={() => setDomainOpen(!domainOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
            style={{
              background: "rgba(0, 240, 255, 0.06)",
              color: "var(--primary)",
              border: "1px solid rgba(0, 240, 255, 0.15)",
            }}
          >
            <span className="material-symbols-outlined text-[18px]">domain</span>
            <span className="hidden md:inline">{selectedDomain}</span>
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>

          {domainOpen && (
            <div
              className="absolute top-full right-0 mt-2 py-1 rounded-2xl min-w-[160px] animate-fade-in"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.4)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.1)",
              }}
            >
              {DOMAINS.map((d) => (
                <button
                  key={d}
                  onClick={() => { setSelectedDomain(d); setDomainOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl"
                  style={{
                    color: d === selectedDomain ? "var(--primary)" : "var(--on-surface-variant)",
                    background: d === selectedDomain ? "rgba(0,240,255,0.08)" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (d !== selectedDomain) e.currentTarget.style.background = "rgba(0,0,0,0.03)"; }}
                  onMouseLeave={(e) => { if (d !== selectedDomain) e.currentTarget.style.background = "transparent"; }}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
