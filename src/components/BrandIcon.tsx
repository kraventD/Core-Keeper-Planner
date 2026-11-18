import React from 'react';

/** Compact blueprint room surrounding the Core Keeper crystal. */
export const BrandIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M8 8h17v7h14V8h17v17h-7v14h7v17H39v-7H25v7H8V39h7V25H8V8Z"
      fill="#111d30"
      stroke="#67e8f9"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M13 13h7v7h-7zM44 13h7v7h-7zM13 44h7v7h-7zM44 44h7v7h-7z"
      fill="#36516c"
    />
    <path
      d="m32 17 15 15-15 15-15-15z"
      fill="#22d3ee"
      fillOpacity=".2"
      stroke="#a5f3fc"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="m32 21 11 11-11 11-11-11z" fill="#22d3ee" />
    <path d="m32 21 1 22 10-11z" fill="#0891b2" />
    <path d="M32 21v22" stroke="#cffafe" strokeOpacity=".8" strokeWidth="1.5" />
    <circle cx="32" cy="32" r="2.5" fill="#ecfeff" />
  </svg>
);
