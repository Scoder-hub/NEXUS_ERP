import React from 'react';

// 使用固定种子生成星星位置，避免每次渲染产生不同位置
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const STAR_COUNT = 35;
const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  width: seededRandom(i * 3 + 1) > 0.8 ? '2px' : '1px',
  height: seededRandom(i * 3 + 1) > 0.8 ? '2px' : '1px',
  top: `${seededRandom(i * 3 + 2) * 100}%`,
  left: `${seededRandom(i * 3 + 3) * 100}%`,
  animationDuration: `${4 + seededRandom(i * 5 + 4) * 4}s`,
  animationDelay: `${seededRandom(i * 5 + 5) * 4}s`,
  opacity: 0.3 + seededRandom(i * 7 + 6) * 0.5,
}));

const AuroraBackground = React.memo(function AuroraBackground() {
  return (
    <div data-cmp="AuroraBackground" className="fixed inset-0 overflow-hidden pointer-events-none z-0" style={{ contain: 'strict' }}>
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg" />

      {/* Aurora orb 1 - top left violet */}
      <div
        className="aurora-orb"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, var(--aurora-1) 0%, transparent 70%)',
          top: '-100px',
          left: '-100px',
          animationDelay: '0s',
        }}
      />

      {/* Aurora orb 2 - top right cyan */}
      <div
        className="aurora-orb"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, var(--aurora-3) 0%, transparent 70%)',
          top: '-50px',
          right: '100px',
          animationDelay: '2s',
        }}
      />

      {/* Aurora orb 3 - bottom center purple */}
      <div
        className="aurora-orb"
        style={{
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, var(--aurora-2) 0%, transparent 70%)',
          bottom: '-150px',
          left: '30%',
          animationDelay: '4s',
        }}
      />

      {/* Aurora orb 4 - middle right small */}
      <div
        className="aurora-orb"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, var(--color-aurora-rose) 0%, transparent 70%)',
          top: '40%',
          right: '-50px',
          animationDelay: '1s',
        }}
      />

      {/* Subtle stars — hidden in light theme via opacity variable */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: star.width,
            height: star.height,
            background: 'var(--color-star)',
            top: star.top,
            left: star.left,
            animation: `aurora-float ${star.animationDuration} ease-in-out ${star.animationDelay} infinite`,
            opacity: star.opacity,
            willChange: 'transform',
            contain: 'strict',
          }}
        />
      ))}
    </div>
  );
});

export default AuroraBackground;
