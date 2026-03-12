import { Check } from "lucide-react";

export default function ActivityGroupCard({ group, title, items, minPoints }) {
  return (
    <div className="bg-secondary/40 border border-border rounded-xl p-6 hover:border-blue-500/50 transition-colors shadow-sm flex flex-col h-full">
      <h3 className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-4 leading-tight">
        {group}{" "}
        <span className="text-foreground/80 font-semibold">
          – {title}
        </span>
      </h3>
      <ul className="space-y-4 mb-6 grow">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 items-start">
            <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-foreground/90 text-sm md:text-base leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex gap-3 items-start pt-2 border-t border-border">
        <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <span className="text-foreground font-bold text-sm md:text-base leading-relaxed">
          Minimum: {minPoints}
        </span>
      </div>
    </div>
  );
}
