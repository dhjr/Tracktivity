import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-24 text-center bg-background transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <h1 className="text-7xl font-black mb-8 premium-gradient bg-clip-text text-transparent relative z-10">
        TRACTIVITY
      </h1>
      <p className="text-xl text-foreground/60 mb-12 max-w-lg relative z-10">
        The ultimate activity tracker for high-performers. Build habits, track
        progress, and achieve your goals with style.
      </p>
      <div className="flex gap-6 relative z-10">
        <Link
          href="/login"
          className="px-10 py-4 rounded-2xl font-bold bg-primary text-white premium-gradient shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          Get Started
        </Link>
        <Link
          href="/signup"
          className="px-10 py-4 rounded-2xl font-bold border-2 border-primary text-primary hover:bg-primary/5 active:scale-95 transition-all duration-300"
        >
          Join Now
        </Link>
      </div>
    </div>
  );
}
