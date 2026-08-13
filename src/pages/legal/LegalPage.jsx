import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

// Shared shell for the Privacy Policy and Terms. Both have to be reachable
// without an account — App Store Connect asks for public URLs, and the review
// team opens them while signed out.
export default function LegalPage({ title, lastUpdated, children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-full pb-32" style={{ background: 'var(--app-bg)' }}>
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6 flex items-center">
        <button onClick={() => navigate(-1)} className="absolute left-4 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[color:var(--app-gold)]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[color:var(--app-gold)] font-light tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {title}
          </h1>
        </div>
      </div>

      <div className="px-6 pt-6 legal-body" style={{ color: 'var(--app-text-2)' }}>
        <p className="text-xs uppercase tracking-widest mb-6" style={{ color: 'var(--app-text-3)' }}>
          Last updated: {lastUpdated}
        </p>
        {children}
      </div>
    </div>
  );
}

export function Section({ heading, children }) {
  return (
    <section className="mb-7">
      <h2 className="text-lg font-light mb-2" style={{ color: 'var(--app-gold)', fontFamily: "'Cormorant Garamond', serif" }}>
        {heading}
      </h2>
      <div className="text-sm font-light leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export function Bullets({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}
