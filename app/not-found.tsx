import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 404 Illustration */}
          <div className="text-9xl font-bold text-gray-200 mb-4">404</div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
