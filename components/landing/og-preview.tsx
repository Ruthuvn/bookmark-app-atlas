import { cn } from "@/lib/utils";

export function OGPreview({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const baseClass = cn("bg-muted p-2", className || "aspect-video");

  switch (id) {
    case "react":
      return (
        <div className={baseClass}>
          {/* Code editor mockup */}
          <div className="h-full flex flex-col justify-center">
            <div className="space-y-1">
              <div className="flex gap-1">
                <span className="text-[5px] text-primary">import</span>
                <span className="text-[5px] text-muted-foreground">React</span>
              </div>
              <div className="flex gap-1">
                <span className="text-[5px] text-primary">function</span>
                <span className="text-[5px] text-foreground">App</span>
                <span className="text-[5px] text-muted-foreground">()</span>
              </div>
              <div className="pl-2">
                <span className="text-[5px] text-primary">return</span>
                <span className="text-[5px] text-muted-foreground"> &lt;</span>
                <span className="text-[5px] text-foreground">Component</span>
                <span className="text-[5px] text-muted-foreground"> /&gt;</span>
              </div>
            </div>
          </div>
        </div>
      );
    case "framer":
      return (
        <div className={cn(baseClass, "flex items-center justify-center")}>
          {/* Animation easing curve */}
          <svg className="w-10 h-6" viewBox="0 0 40 24">
            <path
              d="M4 20 C12 20 12 4 20 4 C28 4 28 20 36 20"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              className="text-primary"
            />
            <circle cx="4" cy="20" r="1.5" className="fill-muted-foreground" />
            <circle cx="36" cy="20" r="1.5" className="fill-primary" />
          </svg>
        </div>
      );
    case "github":
      return (
        <div className={baseClass}>
          {/* Commit graph */}
          <div className="h-full flex items-center justify-center gap-1">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <div className="w-0.5 h-2 bg-primary/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <div className="w-0.5 h-2 bg-primary/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
            <div className="flex flex-col gap-1 ml-2">
              <div className="h-1 w-8 bg-muted-foreground/20" />
              <div className="h-1 w-6 bg-muted-foreground/15" />
              <div className="h-1 w-10 bg-muted-foreground/20" />
            </div>
          </div>
        </div>
      );
    case "figma":
      return (
        <div className={baseClass}>
          {/* Color palette & typography */}
          <div className="h-full flex flex-col justify-center gap-1.5">
            <div className="flex gap-0.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-primary/60" />
              <div className="w-2 h-2 rounded-full bg-primary/30" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-[7px] font-bold text-foreground">Aa</div>
              <div className="text-[4px] text-muted-foreground">
                Inter · 16px
              </div>
            </div>
          </div>
        </div>
      );
    case "stripe":
      return (
        <div className={baseClass}>
          {/* Payment success */}
          <div className="h-full flex flex-col justify-center items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="text-[6px] text-primary">✓</div>
            </div>
            <div className="text-center">
              <div className="text-[5px] text-muted-foreground">Revenue</div>
              <div className="text-[7px] font-bold text-foreground">
                $12,450
              </div>
            </div>
          </div>
        </div>
      );
    case "youtube":
      return (
        <div className={cn(baseClass, "flex flex-col p-0")}>
          {/* Video player */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-5 h-4 bg-primary flex items-center justify-center">
              <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-primary-foreground ml-0.5" />
            </div>
          </div>
          <div className="px-2 pb-1.5">
            <div className="text-[5px] text-muted-foreground text-right mb-0.5">
              12:34
            </div>
            <div className="h-0.5 w-full bg-border">
              <div className="h-full w-[35%] bg-primary" />
            </div>
          </div>
        </div>
      );
    case "spotify":
      return (
        <div className={cn(baseClass, "flex flex-col")}>
          {/* Equalizer */}
          <div className="flex-1 flex items-end justify-center gap-0.5">
            <div className="w-1 h-[60%] bg-muted-foreground/60" />
            <div className="w-1 h-[90%] bg-muted-foreground/60" />
            <div className="w-1 h-[45%] bg-muted-foreground/60" />
            <div className="w-1 h-[75%] bg-muted-foreground/60" />
            <div className="w-1 h-[55%] bg-muted-foreground/60" />
          </div>
          <div className="mt-1 text-center">
            <div className="text-[5px] text-muted-foreground">Now Playing</div>
            <div className="text-[6px] text-foreground font-bold">
              Lo-Fi Beats
            </div>
          </div>
        </div>
      );
    case "twitter":
      return (
        <div className={baseClass}>
          {/* News article preview */}
          <div className="h-full flex flex-col justify-center gap-1">
            <div className="text-[6px] text-foreground font-bold leading-tight">
              Breaking: Tech
            </div>
            <div className="text-[5px] text-muted-foreground leading-tight">
              Latest updates on AI
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="text-[4px] text-muted-foreground">5m ago</div>
              <div className="text-[4px] text-primary">♥ 2.4k</div>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className={cn(baseClass, "flex items-center justify-center")}>
          <div className="w-6 h-6 bg-muted-foreground/10" />
        </div>
      );
  }
}
