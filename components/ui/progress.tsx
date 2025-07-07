import { cn } from "@/lib/utils"

interface ProgressProps {
  value?: number
  className?: string
}

export function Progress({ value = 0, className }: ProgressProps) {
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-700", className)}>
      <div
        className="h-full bg-blue-500 transition-all duration-200 ease-in-out"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}