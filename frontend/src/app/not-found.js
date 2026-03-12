import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-6 md:p-24 text-center bg-background transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <h1 className="text-7xl md:text-9xl font-black mb-4 text-foreground relative z-10 tracking-tight">
        404
      </h1>
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground relative z-10">
        Lost in space?
      </h2>
      <p className="text-lg md:text-xl text-foreground/60 mb-10 md:mb-12 max-w-lg relative z-10">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <Link
        href="/"
        className="px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-sm relative z-10"
      >
        Back to Home
      </Link>
    </div>
  );
}
