export function FloatingCTA() {
  return (
    <a
      href="mailto:ngocha2k0.ln@gmail.com?subject=Let%27s%20talk"
      className="group fixed bottom-6 right-6 z-40 inline-flex items-center gap-2.5 rounded-full border border-teal-300/30 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-teal-300 shadow-lg shadow-slate-950/40 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-teal-300/60 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 motion-reduce:transition-none"
      aria-label="Email Lê Ngọc Hà — available for hire (opens your email client)"
    >
      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300/70 motion-reduce:animate-none" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-300" />
      </span>
      Let&apos;s talk
    </a>
  );
}
