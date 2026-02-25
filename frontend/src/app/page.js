import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-6 md:p-24 text-center bg-background transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <h1 className="text-5xl md:text-7xl font-black mb-6 md:mb-8 text-foreground relative z-10 tracking-tight">
        TRACTIVITY
      </h1>
      <p className="text-lg md:text-xl text-foreground/60 mb-10 md:mb-12 max-w-lg relative z-10">
        The ultimate activity tracker for high-performers. Build habits, track
        progress, and achieve your goals with style.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto px-4 sm:px-0 relative z-10">
        <Link
          href="/signup"
          className="w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-sm"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-bold border border-border text-foreground hover:bg-secondary active:scale-95 transition-all duration-200"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
