import { Loader2 } from "lucide-react";

/**
 * Full-page loading spinner, matching the layout height.
 */
export default function PageLoader() {
  return (
    <div className="min-h-[calc(100vh-6rem)] w-full flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
    </div>
  );
}
