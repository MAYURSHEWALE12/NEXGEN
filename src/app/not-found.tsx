import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4 text-center font-sans">
      <h1 className="text-4xl font-bold font-mono text-zinc-900">404</h1>
      <h2 className="text-sm font-semibold text-zinc-800 mt-2">Page not found</h2>
      <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-5">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/products"
        className="px-3 py-1.5 rounded-md bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
