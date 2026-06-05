import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Reading() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full pb-8">
      <div className="relative border-b-2 border-[rgba(201,169,98,0.25)] page-safe-x py-6">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[#C9A962]" strokeWidth={1.5} />
        </button>
        <div className="w-full text-center">
          <h1 className="text-3xl text-[#C9A962] font-light tracking-wide">Reading</h1>
        </div>
      </div>

      <div className="page-safe-x pt-6">
        <p className="text-[#B8B8B8]">Reading page content will be added here.</p>
      </div>
    </div>
  );
}
