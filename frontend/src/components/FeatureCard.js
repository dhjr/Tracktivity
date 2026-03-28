import React from "react";

export default function FeatureCard({
  icon: Icon,
  title,
  features,
  accentColor,
}) {
  const accentGlow =
    accentColor === "indigo"
      ? "hover:shadow-indigo-500/10"
      : "hover:shadow-emerald-500/10";
  const iconColor =
    accentColor === "indigo" ? "text-indigo-500" : "text-emerald-500";
  const innerGlow =
    accentColor === "indigo"
      ? "bg-indigo-500/5 group-hover:bg-indigo-500/10"
      : "bg-emerald-500/5 group-hover:bg-emerald-500/10";
  const rotateClass =
    accentColor === "indigo" ? "group-hover:rotate-6" : "group-hover:-rotate-6";

  return (
    <div
      className={`group relative p-10 bg-secondary/5 border border-border/40 rounded-[3rem] transition-all duration-700 hover:bg-secondary/10 hover:border-border/60 backdrop-blur-xl overflow-hidden text-left shadow-2xl ${accentGlow} active:scale-[0.99]`}
    >
      {/* Background Glow */}
      <div
        className={`absolute top-0 right-0 w-64 h-64 blur-[80px] -translate-y-1/2 translate-x-1/2 transition-colors duration-700 ${innerGlow}`}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-4 mb-8">
          <div
            className={`w-14 h-14 bg-background border border-border rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 ${rotateClass} transition-transform duration-500`}
          >
            <Icon className={`w-7 h-7 ${iconColor}`} />
          </div>
          <h3 className="text-3xl font-display font-semibold text-foreground tracking-tight">
            {title}
          </h3>
        </div>

        <div className="space-y-4">
          {features.map((item) => (
            <div key={item} className="flex items-center gap-4 p-2 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-zinc-700 transition-transform" />
              <span className="text-lg font-display font-medium text-foreground/70 group-hover/item:text-foreground transition-colors">
                {item}
              </span>
            </div>
          ))}
          <span className="text-[10px] tracking-[0.3em] text-foreground/40 mt-8 block">
            and many more...
          </span>
        </div>
      </div>
    </div>
  );
}
