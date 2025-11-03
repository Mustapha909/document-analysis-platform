export default function DocumentItemSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title skeleton */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>

          {/* Metadata skeleton */}
          <div className="flex items-center gap-4 mb-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>

          {/* Content preview skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex flex-col gap-2 ml-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
        </div>
      </div>
    </div>
  );
}
