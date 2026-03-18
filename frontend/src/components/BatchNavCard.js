import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * A premium navigation card for a batch detail page.
 * @param {string} href - Link destination
 * @param {React.ReactNode} icon - An icon element (e.g. from lucide-react)
 * @param {string} label - Button label text
 * @param {string} [description] - Subtitle text
 * @param {string} [variant] - "default" | "primary" — primary gives a subtle filled style
 */
export default function BatchNavCard({ href, icon, label, description, variant = "default" }) {
  const base =
    "group relative p-8 bg-secondary/5 border border-border/50 backdrop-blur-xl rounded-[2rem] flex flex-col justify-between hover:shadow-2xl hover:border-border transition-all duration-500 overflow-hidden h-full min-h-[180px]";
  
  const styles = {
    default: base,
    primary: `${base} ring-1 ring-primary/20 bg-primary/5 hover:bg-primary/10`,
  };

  return (
    <Link href={href} className={styles[variant] ?? styles.default}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-foreground/10 transition-colors duration-700" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-background rounded-2xl border border-border/50 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            <div className="text-foreground/40 group-hover:text-foreground/80 transition-colors">
               {icon}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
             <ArrowRight className="w-4 h-4 text-foreground/40" />
          </div>
        </div>
        
        <h3 className="font-display font-bold text-xl tracking-tight text-foreground/90 group-hover:text-foreground transition-colors mb-1">
          {label}
        </h3>
        {description && (
          <p className="text-xs text-foreground/30 font-light leading-relaxed group-hover:text-foreground/50 transition-colors">
            {description}
          </p>
        )}
      </div>

      <div className="mt-8 relative z-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/20 group-hover:text-foreground/40 transition-colors">
         <span>Explore Section</span>
         <div className="h-px w-6 bg-foreground/10 group-hover:w-10 transition-all duration-500" />
      </div>
    </Link>
  );
}
