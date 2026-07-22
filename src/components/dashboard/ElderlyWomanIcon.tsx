interface IconProps {
  className?: string
}

export function ElderlyWomanIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Afro hair */}
      <path
        d="M50 14c-14 0-26 6-28 18-8 3-14 10-14 19 0 7 4 14 10 17l4-4c-3-3-5-8-5-13 0-8 5-15 13-17l1-2c3-9 12-14 19-14s16 5 19 14l1 2c8 2 13 9 13 17 0 5-2 10-5 13l4 4c6-3 10-10 10-17 0-9-6-16-14-19-2-12-14-18-28-18z"
        fill="#3E1F0A"
      />
      {/* Face */}
      <circle cx="50" cy="54" r="22" fill="#8B6C4E" />
      {/* Eyes */}
      <ellipse cx="40" cy="52" rx="2.5" ry="3" fill="#1a1a1a" />
      <ellipse cx="60" cy="52" rx="2.5" ry="3" fill="#1a1a1a" />
      {/* Eye highlights */}
      <circle cx="39" cy="51" r="1" fill="#fff" opacity="0.6" />
      <circle cx="59" cy="51" r="1" fill="#fff" opacity="0.6" />
      {/* Glasses */}
      <circle cx="40" cy="52" r="6" stroke="#555" strokeWidth="1.5" fill="none" />
      <circle cx="60" cy="52" r="6" stroke="#555" strokeWidth="1.5" fill="none" />
      <line x1="46" y1="52" x2="54" y2="52" stroke="#555" strokeWidth="1.5" />
      {/* Glasses arms */}
      <line x1="34" y1="50" x2="28" y2="48" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="66" y1="50" x2="72" y2="48" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
      {/* Nose */}
      <path d="M48 57 Q50 60 52 57" stroke="#6B4F3A" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Smile */}
      <path d="M43 63 Q50 69 57 63" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Cheek blush */}
      <circle cx="34" cy="59" r="3.5" fill="#D4A08A" opacity="0.4" />
      <circle cx="66" cy="59" r="3.5" fill="#D4A08A" opacity="0.4" />
      {/* Earrings */}
      <circle cx="27" cy="59" r="2.5" fill="#D4A017" />
      <circle cx="73" cy="59" r="2.5" fill="#D4A017" />
      {/* Neck */}
      <rect x="43" y="74" width="14" height="8" rx="2" fill="#8B6C4E" />
      {/* Scarf/collar */}
      <path
        d="M36 79 Q50 86 64 79"
        stroke="#8B4513"
        strokeWidth="1"
        fill="#6B2FA0"
      />
      <path
        d="M36 80 Q50 87 64 80 L64 84 Q50 91 36 84Z"
        fill="#7B3FA0"
      />
    </svg>
  )
}
