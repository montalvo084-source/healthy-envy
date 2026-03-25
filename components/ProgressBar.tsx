interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  className?: string;
}

export default function ProgressBar({
  value,
  max,
  color,
  className = "",
}: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  const isOver = value > max;

  return (
    <div
      className={`h-2 rounded-full bg-border overflow-hidden ${className}`}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${pct}%`,
          backgroundColor: color ?? (isOver ? "#38A89D" : "#E8A838"),
        }}
      />
    </div>
  );
}
