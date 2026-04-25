"use client";

export default function Footer() {
  return (
    <footer className="relative z-10 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: "1px solid var(--outline-variant)" }}
        >
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-medium text-primary">
              FairMIND
            </span>
            <span className="text-xs text-on-surface-variant">
              — Built with clarity.
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            © 2024 FairMIND. Ethical auditing for responsible AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
