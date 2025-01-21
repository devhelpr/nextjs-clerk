export const LoadingSpinner = () => (
  <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
  </div>
);

export default LoadingSpinner;
