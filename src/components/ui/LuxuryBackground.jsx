import React from 'react';

export default function LuxuryBackground() {
  return (
    <>
      {/* Extended background layer - darker with subtle gray gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at top, rgba(35, 35, 35, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse at center, rgba(28, 28, 28, 0.3) 0%, transparent 60%),
            radial-gradient(ellipse at bottom, rgba(22, 22, 22, 0.35) 0%, transparent 70%),
            linear-gradient(to bottom,
              #1f1f1f 0%,
              #000000 15%,
              #151515 30%,
              #0f0f0f 50%,
              #151515 70%,
              #000000 85%,
              #1f1f1f 100%
            )
          `,
          zIndex: 0
        }}
      />

      {/* Very subtle gold overlay - barely visible */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(226,186,139,0.01) 0%, transparent 60%)
          `,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
    </>
  );
}
