import dynamic from 'next/dynamic';

export const LazyHeatmap = dynamic(
  () => import('./heatmap/HeatmapWidget'),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />,
    ssr: false,
  }
);

// Lazy load profile activity
export const LazyProfileActivity = dynamic(
  () => import('./profil/profileActivity'),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-32 rounded" />
        ))}
      </div>
    ),
  }
);

// // Lazy load chart components
// export const LazyChart = dynamic(
//   () => import('./Chart'),
//   {
//     loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />,
//     ssr: false,
//   }
// );