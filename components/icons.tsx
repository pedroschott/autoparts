type P = { className?: string };

export const Logo = ({ className }: P) => (
  <svg viewBox="0 0 40 40" className={className} aria-hidden>
    <rect width="40" height="40" rx="9" fill="var(--color-brand-700)" />
    <path
      d="M20 8.5 30.5 14.5v11L20 31.5 9.5 25.5v-11L20 8.5Z"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <circle cx="20" cy="20" r="4.4" fill="#fff" />
  </svg>
);

export const Search = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
    <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Car = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path
      d="M3.5 14.5h17M5 14.5l1.4-5A2 2 0 0 1 8.3 8h7.4a2 2 0 0 1 1.9 1.5l1.4 5M4 14.5v3h3v-3m10 0v3h3v-3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="7.5" cy="14.5" r="1.2" fill="currentColor" />
    <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" />
  </svg>
);

export const Cart = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path
      d="M3 4h2.2l2.1 10.2a2 2 0 0 0 2 1.6h7.3a2 2 0 0 0 2-1.5L20.5 7H6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="19.5" r="1.4" fill="currentColor" />
    <circle cx="17" cy="19.5" r="1.4" fill="currentColor" />
  </svg>
);

export const Menu = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Chevron = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="m8 10 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronRight = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="m10 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Store = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path
      d="M4 9.5h16v9.5H4V9.5ZM4 9.5 5.5 5h13L20 9.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M9.5 19v-5h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

export const Book = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path
      d="M5 4.5h6.5A2.5 2.5 0 0 1 14 7v12.5a2 2 0 0 0-2-2H5v-13ZM19 4.5h-4.5A2.5 2.5 0 0 0 12 7"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path d="M19 4.5v13h-5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);

export const Check = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Trash = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path
      d="M4.5 6.5h15M9.5 6.5V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7M6.5 6.5l.9 12.2A1.8 1.8 0 0 0 9.2 20.4h5.6a1.8 1.8 0 0 0 1.8-1.7l.9-12.2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Star = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="m12 3.6 2.6 5.3 5.8.85-4.2 4.1 1 5.8-5.2-2.75L6.8 19.6l1-5.8-4.2-4.1 5.8-.85L12 3.6Z"
      fill="currentColor"
    />
  </svg>
);

export const Truck = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path
      d="M2.5 6.5h11v10h-11v-10ZM13.5 10h3.6l2.9 3v3.5h-6.5V10Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <circle cx="7" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="17" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);
