import { useEffect, useState } from "react";
import { Loader2, Server } from "lucide-react";

const RouteLoadingScreen = () => {
  const [showColdStartHint, setShowColdStartHint] = useState(false);

  useEffect(() => {
    const hintTimerId = window.setTimeout(() => {
      setShowColdStartHint(true);
    }, 2800);

    return () => {
      window.clearTimeout(hintTimerId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto h-12 w-12 rounded-full border border-border bg-muted/40 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">Loading AgriConnect</h2>
        <p className="mt-1 text-sm text-muted-foreground">Verifying your session and preparing the dashboard.</p>

        {showColdStartHint && (
          <p className="mt-3 text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5" />
            Backend may be waking up from cold start. This usually takes a few seconds.
          </p>
        )}
      </div>
    </div>
  );
};

export default RouteLoadingScreen;