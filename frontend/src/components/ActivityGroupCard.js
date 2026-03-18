import { Check, Info } from "lucide-react";

export default function ActivityGroupCard({ group, title, items, minPoints }) {
  return (
    <div className="group relative p-8 bg-secondary/5 border border-border/50 backdrop-blur-xl rounded-[2rem] flex flex-col hover:shadow-2xl hover:border-border transition-all duration-500 overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-foreground/10 transition-colors duration-700" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
           <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{group}</span>
           <div className="h-px w-4 bg-foreground/10" />
        </div>
        
        <h3 className="font-display font-bold text-xl tracking-tight text-foreground/90 group-hover:text-foreground transition-colors mb-6 leading-tight">
          {title}
        </h3>

        <ul className="space-y-4 mb-8 grow">
          {items.map((item, index) => (
            <li key={index} className="flex gap-3 items-start group/item">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/20 group-hover/item:bg-foreground transition-colors shrink-0" />
              <span className="text-foreground/60 text-sm font-light leading-relaxed group-hover/item:text-foreground/80 transition-colors">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <div className="pt-6 border-t border-border/20 mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Info className="w-3.5 h-3.5 text-foreground/30" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Minimum Required</span>
          </div>
          <span className="text-sm font-display font-bold text-foreground/80">{minPoints}</span>
        </div>
      </div>
    </div>
  );
}
