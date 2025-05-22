interface ProgressModalProps {
  onClose: () => void
}

export default function ProgressModal({ onClose }: ProgressModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h3 className="text-xl font-bold mb-2">Please wait</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Staking transaction may take a while...
          <br />
          Please, don't close this tab.
        </p>
      </div>
    </div>
  )
}
