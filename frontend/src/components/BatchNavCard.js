import Link from "next/link";

/**
 * A large dashed navigation card for a batch detail page.
 * @param {string} href - Link destination
 * @param {React.ReactNode} icon - An icon element (e.g. from lucide-react)
 * @param {string} label - Button label text
 * @param {string} [variant] - "default" | "primary" — primary gives a subtle filled style
 */
export default function BatchNavCard({ href, icon, label, variant = "default" }) {
  const base =
    "w-40 h-40 border-2 border-dashed border-border hover:border-foreground/20 transition-all group flex items-center justify-center flex-col gap-4 rounded-none";
  const styles = {
    default: `${base} bg-secondary/5 hover:bg-secondary/10`,
    primary: `${base} bg-foreground/5 hover:bg-foreground/10`,
  };

  return (
    <Link href={href} className={styles[variant] ?? styles.default}>
      <div className="text-foreground/20 group-hover:text-foreground/60 transition-colors">
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40 group-hover:text-foreground/80 text-center leading-tight px-2">
        {label}
      </span>
    </Link>
  );
}
