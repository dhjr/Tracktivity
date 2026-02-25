import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-24 text-center bg-background transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <h1 className="text-9xl font-black mb-4 premium-gradient bg-clip-text text-transparent relative z-10">
        404
      </h1>
      <h2 className="text-3xl font-bold mb-6 text-foreground relative z-10">
        Lost in space?
      </h2>
      <p className="text-xl text-foreground/60 mb-12 max-w-lg relative z-10">
        The page you're looking for doesn't exist or has been moved to another
        dimension.
      </p>

      <Link
        href="/"
        className="px-10 py-4 rounded-2xl font-bold bg-primary text-white premium-gradient shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300 relative z-10"
      >
        Back to Reality
      </Link>
    </div>
  );
}
