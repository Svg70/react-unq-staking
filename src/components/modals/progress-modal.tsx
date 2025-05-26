import { cn } from "@/lib/utils"

interface ProgressModalProps {
  onClose: () => void
}

export default function ProgressModal({ onClose }: ProgressModalProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      )}
    >
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full text-center")}>
        <div className={cn("animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4")} />
        <h3 className={cn("text-xl font-bold mb-2")}>Please wait</h3>
        <p className={cn("text-gray-600 dark:text-gray-400")}>
          Staking transaction may take a while...
          <br />
          Please, don't close this tab.
        </p>
      </div>
    </div>
  )
}
