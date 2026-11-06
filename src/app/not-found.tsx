import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rise">
      <p className="font-mono text-xs text-secondary">404</p>
      <h1 className="mt-2 text-2xl text-foreground">Page not found</h1>
      <p className="mt-3 text-secondary">
        Whatever you were looking for isn't here.
      </p>
      <Link href="/" className="link mt-6 inline-block text-foreground">
        Back to the index
      </Link>
    </div>
  );
}
