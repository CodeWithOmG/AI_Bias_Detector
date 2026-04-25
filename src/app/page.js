"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen w-full bg-[#0a0c10] text-white selection:bg-primary/30">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Radial Gradient */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% -20%, #1a1f25, #0a0c10 70%)" }} />

        {/* Mesh Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Floating Lite Images */}
        <div className="absolute top-[15%] left-[10%] w-48 h-48 opacity-10 animate-slow-float blur-[1px]">
          <Image src="/images/finance_icon.png" alt="Finance" width={200} height={200} className="invert" />
        </div>
        <div className="absolute top-[40%] right-[12%] w-56 h-56 opacity-10 animate-slow-float blur-[1px]" style={{ animationDelay: '2s' }}>
          <Image src="/images/healthcare_icon.png" alt="Healthcare" width={200} height={200} className="invert" />
        </div>
        <div className="absolute bottom-[20%] left-[15%] w-40 h-40 opacity-10 animate-slow-float blur-[1px]" style={{ animationDelay: '4s' }}>
          <Image src="/images/hiring_icon.png" alt="Hiring" width={200} height={200} className="invert" />
        </div>

        {/* Pulsing Auras */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20">
          <div className="stagger-children flex flex-col items-center">
            <h1 className="font-serif text-7xl sm:text-9xl font-normal tracking-tighter text-white mb-8 animate-text-glow">
              Fair<span className="text-primary-container italic">MIND</span>
            </h1>

            <p className="text-xl sm:text-2xl max-w-2xl mx-auto mb-14 leading-relaxed text-white/60">
              Transforming complex data into ethical clarity. The premier guardian of fairness for the modern enterprise.
            </p>

            <Link href="/dashboard" className="group relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/40 transition-all rounded-full" />
              <button className="pill-btn pill-btn-primary px-20 py-7 text-2xl tracking-[0.2em] font-black relative animate-slow-float shadow-[0_0_50px_rgba(0,240,255,0.2)]">
                START
              </button>
            </Link>

            <div className="mt-24 flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Trusted In</span>
                <div className="flex items-center gap-6 font-serif text-lg italic">
                  <span>Finance</span>
                  <span className="h-1 w-1 bg-white rounded-full"></span>
                  <span>Healthcare</span>
                  <span className="h-1 w-1 bg-white rounded-full"></span>
                  <span>Hiring</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
            <span className="material-symbols-outlined text-4xl">expand_more</span>
          </div>
        </section>

        {/* Domains / Features Section */}
        <section className="max-w-6xl mx-auto px-6 py-32 border-t border-white/5">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif mb-4">Domain Guardians</h2>
            <p className="text-white/40 max-w-xl mx-auto">Specialized intelligence cores designed for the most critical sectors of our society.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Finance", desc: "Conditional fairness audits using credit-tier analysis to detect systemic zip-code bias.", color: "var(--primary-container)" },
              { title: "Healthcare", desc: "Continuous attribute binning to ensure socioeconomic equality in patient care.", color: "var(--secondary-container)" },
              { title: "Hiring", desc: "Standardized disparate impact analysis for gender and racial equity in recruitment.", color: "var(--tertiary-container)" }
            ].map((d, i) => (
              <div key={i} className="glass-card p-10 group hover:-translate-y-2" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                  <span className="material-symbols-outlined" style={{ color: d.color }}>{i === 0 ? "payments" : i === 1 ? "medical_services" : "groups"}</span>
                </div>
                <h3 className="text-xl font-serif mb-4">{d.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process Section */}
        <section className="max-w-6xl mx-auto px-6 py-32 bg-white/[0.01] rounded-[4rem] mb-32 border border-white/5">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <div className="flex items-center gap-8 mb-8">
                <h2 className="text-5xl font-serif leading-tight">Bias <br />Detection <span className="text-primary-container italic">Workflow</span></h2>
                <div className="opacity-70 flex-shrink-0 animate-slow-float hidden sm:block">
                  <Image
                    src="/images/fairness_audit.png"
                    alt="Bias Detection"
                    width={120}
                    height={120}
                    className="rounded-3xl border border-white/10 shadow-2xl"
                  />
                </div>
              </div>
              <div className="space-y-8">
                {[
                  { step: "01", title: "Dataset Upload", desc: "Securely upload CSV files with our Domain Guardian validation." },
                  { step: "02", title: "Algorithmic Audit", desc: "Guardian Intelligence Core performs tiered domain-specific analysis." },
                  { step: "03", title: "Ethical Mitigation", desc: "Receive AI-powered recommendations to neutralize bias instantly." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <span className="text-primary-container font-black tracking-tighter text-2xl">{s.step}</span>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{s.title}</h4>
                      <p className="text-white/40 text-sm">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center">
                <div className="w-4/5 aspect-square glass-card flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer opacity-20" />
                  <Image
                    src="/images/workflow_illustration.png"
                    alt="Workflow Illustration"
                    fill
                    className="object-cover opacity-60"
                  />
                </div>
              </div>
              {/* Decorative detail */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 glass-card flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-secondary">analytics</span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 blur-[120px]" />
          <h2 className="text-6xl font-serif mb-12 relative z-10">Ready to audit?</h2>
          <Link href="/dashboard" className="relative z-10">
            <button className="pill-btn pill-btn-primary px-16 py-6 text-xl tracking-widest font-bold">
              GET STARTED
            </button>
          </Link>
        </section>

        {/* Footer */}
        <footer className="py-20 border-t border-white/5 text-center text-[10px] font-bold tracking-[0.5em] text-white/20">
          FairMIND &copy; 2026. ALL RIGHTS RESERVED.
        </footer>
      </div>

      <style jsx>{`
        .animate-slow-float {
          animation: float 8s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
      `}</style>
    </div>
  );
}
