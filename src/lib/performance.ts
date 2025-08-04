// lib/performance.ts
declare global {
  interface Window {
    gtag: (
      command: 'event',
      action: string,
      params: {
        value?: number;
        event_category?: string;
        non_interaction?: boolean;
        [key: string]: any;
      }
    ) => void;
  }
}

export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    console.log('Performance metric:', metric);
  
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_category: 'Web Vitals',
        non_interaction: true,
      });
    }
  }
}

export {};