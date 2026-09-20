export function BlogLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--primary)" />
      <path
        d="M9 8.5h10.5a2 2 0 0 1 2 2V23L16 20.2 9 23V8.5Z"
        fill="var(--primary-foreground)"
        opacity="0.95"
      />
      <path d="M12 12h8M12 15.2h6" stroke="var(--primary)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
