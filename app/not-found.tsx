import Link from "next/link";
import "./globals.css";

// The root layout lives under /[locale], so unmatched URLs render this standalone shell.
export default function NotFound() {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">That page is not in this archive.</p>
          <p className="mt-6">
            <Link href="/" className="btn btn-primary">
              Home
            </Link>
          </p>
        </div>
      </body>
    </html>
  );
}
