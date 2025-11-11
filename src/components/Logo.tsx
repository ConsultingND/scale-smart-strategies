const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 300"
      className={className}
    >
      {/* Background gradient for modern tech feel */}
      <defs>
        <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Logo icon: Ascending steps/blocks representing scale and growth with neural network nodes */}
      <g transform="translate(40, 80)">
        {/* Step blocks representing scaling */}
        <rect x="0" y="80" width="35" height="35" fill="url(#mainGradient)" rx="4"/>
        <rect x="45" y="50" width="35" height="65" fill="url(#mainGradient)" rx="4"/>
        <rect x="90" y="20" width="35" height="95" fill="url(#mainGradient)" rx="4"/>

        {/* Neural network nodes overlay representing AI */}
        <circle cx="17.5" cy="97.5" r="6" fill="#06B6D4" opacity="0.9"/>
        <circle cx="62.5" cy="67.5" r="6" fill="#06B6D4" opacity="0.9"/>
        <circle cx="107.5" cy="37.5" r="6" fill="#06B6D4" opacity="0.9"/>

        {/* Connection lines for AI/network concept */}
        <line x1="22" y1="95" x2="58" y2="70" stroke="#06B6D4" strokeWidth="2" opacity="0.5"/>
        <line x1="67" y1="65" x2="103" y2="40" stroke="#06B6D4" strokeWidth="2" opacity="0.5"/>

        {/* Tech circuit accent */}
        <path d="M 130 115 L 145 115 L 145 100 L 160 100" stroke="url(#accentGradient)" strokeWidth="2.5" fill="none" opacity="0.7"/>
        <circle cx="160" cy="100" r="4" fill="#3B82F6"/>
      </g>

      {/* Company name */}
      <g transform="translate(220, 150)">
        <text x="0" y="0" fontFamily="'Inter', 'Segoe UI', Arial, sans-serif" fontSize="56" fontWeight="700" fill="#1E293B">
          ND
          <tspan fill="url(#mainGradient)">Scale</tspan>
          <tspan fill="#1E293B">Smart</tspan>
        </text>
      </g>

      {/* Tagline */}
      <g transform="translate(220, 190)">
        <text x="0" y="0" fontFamily="'Inter', 'Segoe UI', Arial, sans-serif" fontSize="32" fontWeight="400" fill="#64748B" letterSpacing="0.5">
          AI & Tech Strategy Consulting
        </text>
      </g>

      {/* Subtle tech accent line */}
      <line x1="220" y1="205" x2="480" y2="205" stroke="url(#accentGradient)" strokeWidth="2" opacity="0.3"/>
    </svg>
  );
};

export default Logo;
