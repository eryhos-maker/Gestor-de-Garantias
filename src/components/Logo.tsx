import React from 'react';

export const LOGO_SVG_STRING = `<svg viewBox="0 0 500 220" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(0, 20)">
    <path d="M 122 128 L 482 128 L 472 188 L 132 188 Z" fill="#9CA3AF" />
    <path d="M 126 124 L 486 124 L 476 184 L 136 184 Z" fill="#FFFFFF" />
    <path d="M 130 120 L 490 120 L 480 180 L 140 180 Z" fill="#225B9E" />
    <text x="310" y="166" fill="#FFFFFF" font-size="54" font-weight="900" font-family="helvetica, sans-serif" text-anchor="middle" letter-spacing="1">Don Nico</text>
  </g>
  <g transform="translate(0, 10)">
    <g transform="rotate(-12 150 80)">
      <path d="M 32 28 L 282 28 L 262 108 L 142 108 L 152 148 L 112 108 L 42 108 Z" fill="#9CA3AF" />
      <path d="M 36 24 L 286 24 L 266 104 L 146 104 L 156 144 L 116 104 L 46 104 Z" fill="#FFFFFF" />
      <path d="M 40 20 L 290 20 L 270 100 L 150 100 L 160 140 L 120 100 L 50 100 Z" fill="#E8412A" />
      <text x="160" y="82" fill="#FFFFFF" font-size="68" font-weight="900" font-family="helvetica, sans-serif" text-anchor="middle" letter-spacing="1">Ferre</text>
    </g>
  </g>
</svg>`;

export const Logo = ({ className = "w-48" }: { className?: string }) => (
  <svg viewBox="0 0 500 220" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 20)">
      <path d="M 122 128 L 482 128 L 472 188 L 132 188 Z" fill="#9CA3AF" />
      <path d="M 126 124 L 486 124 L 476 184 L 136 184 Z" fill="#FFFFFF" />
      <path d="M 130 120 L 490 120 L 480 180 L 140 180 Z" fill="#225B9E" />
      <text x="310" y="166" fill="#FFFFFF" fontSize="54" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle" style={{ letterSpacing: '1px' }}>Don Nico</text>
    </g>
    <g transform="translate(0, 10)">
      <g transform="rotate(-12 150 80)">
        <path d="M 32 28 L 282 28 L 262 108 L 142 108 L 152 148 L 112 108 L 42 108 Z" fill="#9CA3AF" />
        <path d="M 36 24 L 286 24 L 266 104 L 146 104 L 156 144 L 116 104 L 46 104 Z" fill="#FFFFFF" />
        <path d="M 40 20 L 290 20 L 270 100 L 150 100 L 160 140 L 120 100 L 50 100 Z" fill="#E8412A" />
        <text x="160" y="82" fill="#FFFFFF" fontSize="68" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle" style={{ letterSpacing: '1px' }}>Ferre</text>
      </g>
    </g>
  </svg>
);
