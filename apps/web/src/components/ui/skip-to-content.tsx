/**
 * Skip-to-content link for keyboard/screen reader users.
 * Visually hidden until focused.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-2 focus:left-2 focus:z-[200]
        focus:px-4 focus:py-2 focus:rounded-xl
        focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-medium
        focus:shadow-glow-primary focus:outline-none
        transition-all
      "
    >
      Skip to main content
    </a>
  );
}
