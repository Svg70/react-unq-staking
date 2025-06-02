import { useEffect, useState } from 'react'
import clsx from 'clsx'
import {Portal} from "@/components/ui/portal.tsx";

type NotificationModalProps = {
    message?: string
    duration?: number
    className?: string
}

export const NotificationModal = ({
                                      message = 'Copied to clipboard!',
                                      duration = 2000,
                                      className,
                                  }: NotificationModalProps) => {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(false), duration)
        return () => clearTimeout(timer)
    }, [duration])

    if (!isVisible) return null

    return (
        <Portal>
            <div
                className={clsx(
                    'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
                    'bg-success-500 text-gray-500 text-sm rounded-lg shadow-lg animate-fade-in',
                    'flex items-center justify-center space-x-2 px-4 py-3',
                    'animate-fade-in',
                    className
                )}
            >
                <span>{message}</span>
            </div>
        </Portal>
    )
}