import { useState, useCallback } from "react"


export const useCopy = () => {
    const [showNotification, setShowNotification] = useState(false)
    const [isCopyDisabled, setIsCopyDisabled] = useState(false)

    const handleCopy = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setIsCopyDisabled(true)
            setShowNotification(true)

            setTimeout(() => {
                setIsCopyDisabled(false)
                setShowNotification(false)
            }, 2000)
        } catch (err) {
            console.error("Failed to copy text: ", err)
        }
    }, [])

    return { handleCopy, showNotification, isCopyDisabled }
}
