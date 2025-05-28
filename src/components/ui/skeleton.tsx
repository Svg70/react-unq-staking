import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse st-rounded-md st-bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
