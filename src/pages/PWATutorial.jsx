import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { detectPlatform } from '../hooks/usePWAInstallBanner';

const VIDEOS = {
  ios: 'https://res.cloudinary.com/dykhmifto/video/upload/v1772744412/VIDEO5_cypyd6.mov',
  android: 'https://res.cloudinary.com/dykhmifto/video/upload/v1772744421/VIDEO6_fz4qxi.mp4',
};

const STEPS = {
  ios: [
    { num: 1, title: 'Tap the Share button', desc: 'Find the Share icon at the bottom of Safari (box with arrow pointing up).' },
    { num: 2, title: 'Add to Home Screen', desc: 'Scroll down in the Share menu and tap "Add to Home Screen".' },
    { num: 3, title: 'Confirm Installation', desc: 'Tap "Add" in the top right corner to install the app.' },
    { num: 4, title: 'Open from Home Screen', desc: 'Find AA Lifestyle on your home screen and tap to launch.' },
  ],
  android: [
    { num: 1, title: 'Open the Menu', desc: 'Tap the three-dot menu icon in the top right corner of Chrome.' },
    { num: 2, title: 'Install the App', desc: 'Select "Add to Home screen" or "Install app" from the menu.' },
    { num: 3, title: 'Confirm Installation', desc: 'Tap "Install" to confirm and add to your home screen.' },
    { num: 4, title: 'Open from Home Screen', desc: 'Find AA Lifestyle on your home screen and tap to launch.' },
  ],
};

export default function PWATutorial() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ios');
  const videoRef = useRef(null);

  useEffect(() => {
    const platform = detectPlatform();
    setActiveTab(platform === 'android' ? 'android' : 'ios');
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [activeTab]);

  return (
    <div className="min-h-full pb-32" style={{ color: '#F5F1E8' }}>
      <div
        className="relative border-b-2 page-safe-x py-5 flex items-center"
        style={{ borderColor: 'rgba(201,169,98,0.2)' }}
      >
        <button onClick={() => navigate(-1)} className="hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-[#C9A962]" strokeWidth={1.5} />
        </button>
        <h1
          className="flex-1 text-center text-3xl text-[#C9A962] font-light tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Install AA Lifestyle
        </h1>
        <div className="w-6" />
      </div>

      <div className="page-safe-x py-6 max-w-lg mx-auto">
        <div
          className="flex rounded-xl p-1 mb-6"
          style={{ background: 'rgba(37,37,37,0.8)', border: '1px solid rgba(201,169,98,0.2)' }}
        >
          {['ios', 'android'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-lg text-sm transition-all duration-200"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '16px',
                letterSpacing: '0.04em',
                background: activeTab === tab ? 'linear-gradient(135deg, #B8955A 0%, #C9A962 100%)' : 'transparent',
                color: activeTab === tab ? '#1A1209' : 'rgba(201,169,98,0.6)',
                boxShadow: activeTab === tab ? '0 2px 8px rgba(184,149,90,0.3)' : 'none',
                fontWeight: activeTab === tab ? '600' : '400',
              }}
            >
              {tab === 'ios' ? 'iOS' : 'Android'}
            </button>
          ))}
        </div>

        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ border: '1px solid rgba(201,169,98,0.2)', background: 'rgba(37,37,37,0.6)' }}
        >
          <video
            ref={videoRef}
            key={activeTab}
            className="w-full"
            controls
            autoPlay
            loop
            playsInline
            muted
            style={{ display: 'block', maxHeight: '60vh', objectFit: 'contain', background: '#000000' }}
          >
            <source src={VIDEOS[activeTab]} type={activeTab === 'ios' ? 'video/mp4' : 'video/mp4'} />
          </video>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(37,37,37,0.6)', border: '1px solid rgba(201,169,98,0.2)' }}
        >
          <h2
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: '#8A7E72', fontFamily: "'Inter', sans-serif" }}
          >
            Installation Steps — {activeTab === 'ios' ? 'iOS (Safari)' : 'Android (Chrome)'}
          </h2>
          <div className="space-y-4">
            {STEPS[activeTab].map((step) => (
              <div key={step.num} className="flex items-start gap-4">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #B8955A 0%, #C9A962 100%)',
                    boxShadow: '0 2px 8px rgba(184,149,90,0.3)',
                  }}
                >
                  <span
                    className="text-sm font-semibold text-[#1A1209]"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px' }}
                  >
                    {step.num}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-base font-medium mb-0.5"
                    style={{ color: '#F5F1E8', fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }}
                  >
                    {step.title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: '#8A7E72', fontFamily: "'Inter', sans-serif" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
