// src/components/ui/SummarySkeleton.tsx
export default function SummarySkeleton() {
  return (
    <div className="p-4 border rounded-lg bg-white/70 dark:bg-gray-800 animate-pulse space-y-3">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
  );
}
