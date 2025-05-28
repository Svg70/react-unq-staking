import { cn } from "@/lib/utils"

interface ProgressModalProps {
  onClose: () => void
}

export default function ProgressModal({ onClose }: ProgressModalProps) {
  return (
      <div className={cn("st-fixed st-inset-0 st-bg-black/30 st-backdrop-blur-sm st-flex st-items-center st-justify-center st-z-50")}>
        <div className={cn("st-bg-white dark:st-bg-gray-800 st-rounded-lg st-p-8 st-max-w-md st-w-full st-text-center")}>
          <div className={cn("st-animate-spin st-rounded-full st-h-12 st-w-12 st-border-b-2 st-border-blue-500 st-mx-auto st-mb-4")} />
          <h3 className={cn("st-text-xl st-font-bold st-mb-2")}>Please wait</h3>
          <p className={cn("st-text-gray-600 dark:st-text-gray-400")}>
            Staking transaction may take a while...
            <br />
            Please, don't close this tab.
          </p>
        </div>
      </div>
  )
}
