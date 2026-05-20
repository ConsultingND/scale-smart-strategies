type EventProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: EventProps }) => void;
    gtag?: (command: 'event', name: string, params?: EventProps) => void;
  }
}

export function trackEvent(name: string, props?: EventProps): void {
  if (typeof window === 'undefined') return;
  try {
    window.plausible?.(name, props ? { props } : undefined);
  } catch {
    /* swallow analytics errors */
  }
  try {
    window.gtag?.('event', name, props);
  } catch {
    /* swallow analytics errors */
  }
}
