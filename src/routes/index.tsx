import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Cover,
});

function Cover() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl text-center paper rounded-2xl px-10 py-16">
        <p className="hand text-2xl text-primary/80">for you,</p>
        <h1 className="serif text-6xl md:text-7xl mt-3 text-ink italic">Our Album</h1>
        <div className="gold-divider my-6 mx-auto w-40" />
        <p className="text-muted-foreground leading-relaxed">
          Every quiet morning, every messy laugh, every somewhere-we-got-lost.
          A little home for the moments I never want to forget.
        </p>
        <div className="mt-10">
          <Link
            to="/unlock"
            className="inline-flex items-center rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm tracking-wide uppercase shadow-md hover:shadow-lg transition"
          >
            Open the album
          </Link>
        </div>
        <p className="hand text-xl mt-8 text-primary/70">— always yours</p>
      </div>
    </div>
  );
}
