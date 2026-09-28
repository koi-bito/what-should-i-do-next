interface QuickStatsProps {
  streak: number;
  queriesRemaining: number | null;
  todayCompleted?: number;
}

export function QuickStats({ streak, queriesRemaining, todayCompleted = 0 }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="card p-4 text-center">
        <p className="text-2xl font-bold text-foreground animate-scale-bounce">{streak}</p>
        <p className="text-xs text-muted-foreground mt-1">Day streak 🔥</p>
      </div>

      <div className="card p-4 text-center">
        <p className="text-2xl font-bold text-foreground">{todayCompleted}</p>
        <p className="text-xs text-muted-foreground mt-1">Done today ✓</p>
      </div>

      <div className="card p-4 text-center">
        {queriesRemaining !== null ? (
          <>
            <p className="text-2xl font-bold text-foreground">{queriesRemaining}</p>
            <p className="text-xs text-muted-foreground mt-1">Queries left</p>
          </>
        ) : (
          <>
            <p className="text-xl font-bold text-primary">∞</p>
            <p className="text-xs text-muted-foreground mt-1">Unlimited</p>
          </>
        )}
      </div>
    </div>
  );
}
