import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">That page is not in this archive.</p>
      <p className="mt-6">
        <Link href="/" className="btn btn-primary">
          Home
        </Link>
      </p>
    </div>
  );
}
