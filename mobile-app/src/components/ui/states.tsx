import { cn } from "@/lib/utils";

// ── Waveform Indicator ──
export const WaveformIndicator = ({ isPlaying, className }: { isPlaying: boolean; className?: string }) => (
  <div className={cn("flex items-end gap-[2px] h-4", className)}>
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className={cn(
          "w-[3px] rounded-full bg-foreground transition-all duration-300",
          isPlaying ? "animate-[waveform_0.8s_ease-in-out_infinite]" : "h-1"
        )}
        style={isPlaying ? { animationDelay: `${i * 0.15}s` } : {}}
      />
    ))}
  </div>
);

// ── Skeleton States ──
export const SkeletonSongRow = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-3 p-2.5 rounded-xl", className)}>
    <div className="w-12 h-12 rounded-lg animate-shimmer flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-[70%] rounded-full animate-shimmer" />
      <div className="h-3 w-[45%] rounded-full animate-shimmer" />
    </div>
    <div className="w-8 h-3 rounded-full animate-shimmer" />
  </div>
);

export const SkeletonMovieCard = ({ className }: { className?: string }) => (
  <div className={cn("flex-shrink-0 w-[130px]", className)}>
    <div className="w-[130px] h-[130px] rounded-2xl animate-shimmer mb-2" />
    <div className="h-3.5 w-24 rounded-full animate-shimmer mb-1.5" />
    <div className="h-3 w-16 rounded-full animate-shimmer" />
  </div>
);

export const SkeletonHero = () => (
  <div className="rounded-2xl animate-shimmer aspect-[2/1] w-full" />
);

// ── Empty State ──
export const EmptyState = ({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-24 px-8 text-center animate-fade-up">
    <div className="w-16 h-16 rounded-full bg-foreground/[0.04] flex items-center justify-center mb-5 animate-float">
      <Icon size={28} className="text-muted-foreground/40" />
    </div>
    <h3 className="text-[17px] font-bold text-foreground mb-1 font-display tracking-tight">{title}</h3>
    <p className="text-[13px] text-muted-foreground max-w-[260px] leading-relaxed">{subtitle}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// ── Error State ──
export const ErrorState = ({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-24 px-8 text-center animate-fade-up">
    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
      <span className="text-2xl">⚠️</span>
    </div>
    <h3 className="text-[17px] font-bold text-foreground mb-1 font-display tracking-tight">Oops!</h3>
    <p className="text-[13px] text-muted-foreground max-w-[260px] mb-5 leading-relaxed">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="px-6 py-2.5 rounded-full bg-foreground text-background font-semibold text-[14px] active:scale-95 transition-transform">
        Try Again
      </button>
    )}
  </div>
);

// ── Section Header ──
export const SectionHeader = ({
  title,
  icon: Icon,
  action,
  className,
}: {
  title: string;
  icon?: React.ComponentType<any>;
  action?: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex items-center justify-between mb-3", className)}>
    <div className="flex items-center gap-2">
      {Icon && <Icon size={16} className="text-muted-foreground" />}
      <h2 className="text-[15px] font-semibold font-display text-foreground tracking-tight">{title}</h2>
    </div>
    {action}
  </div>
);
