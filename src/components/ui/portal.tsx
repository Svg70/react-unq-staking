import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type PortalProps = {
    children: React.ReactNode

    /** Ref to the target element for positioning. */
    targetRef?: React.RefObject<HTMLElement | null>

    /** Explicit position for the portal. */
    position?: { top: number; left: number }

    /** Alignment relative to the target. Defaults to 'bottom'. */
    align?: 'top' | 'bottom' | 'left' | 'right'

    /** Offset for positioning. Defaults to `{ x: 0, y: 0 }`. */
    offset?: { x: number; y: number }
    maxHeight?: number
    dropdownWidthDefault?: number
}

export const Portal = ({
                           children,
                           targetRef,
                           position,
                           align = 'bottom',
                           offset = { x: 0, y: 0 },
                           maxHeight = 200,
                           dropdownWidthDefault = 120,
                       }: PortalProps) => {
    const [mounted, setMounted] = useState(false)
    const [computedPosition, setComputedPosition] = useState({ top: 0, left: 0 })

    useEffect(() => {
        setMounted(true)

        if (targetRef?.current) {
            const rect = targetRef.current.getBoundingClientRect()
            let top = rect.bottom + window.scrollY
            let left = rect.right + window.scrollX

            // Correct position based on alignment
            switch (align) {
                case 'top':
                    top = rect.top + window.scrollY - rect.height
                    break
                case 'bottom':
                    top = rect.bottom + window.scrollY
                    break
                case 'left':
                    left = rect.left + window.scrollX - rect.width
                    break
                case 'right':
                    left = rect.right + window.scrollX // right side of the target element is aligned to the right side of the viewport
                    break
                default:
                    break
            }

            // Apply offset
            top += offset.y
            left += offset.x

            // Check if the dropdown overflows the viewport
            const viewportWidth = window.innerWidth
            const dropdownWidth = dropdownWidthDefault
            if (left + dropdownWidth > viewportWidth) {
                left = viewportWidth - dropdownWidth // move dropdown to the right side of the viewport
            }

            // check if the dropdown overflows the viewport
            const viewportHeight = window.innerHeight
            const dropdownHeight = maxHeight
            const spaceBelow = viewportHeight - (top - window.scrollY)

            if (spaceBelow < dropdownHeight) {
                top = viewportHeight + window.scrollY - dropdownHeight - 8 // add 8 for margin
            }
            setComputedPosition({ top, left })
        } else if (position) {
            setComputedPosition(position)
        }

        return () => setMounted(false)
    }, [targetRef, position, align, offset, maxHeight])

    if (!mounted) return null

    const portalRoot = document.getElementById('portal-root')
    if (!portalRoot) {
        return null
    }

    return createPortal(
        <div
            style={{
                position: 'fixed',
                top: computedPosition.top,
                left: computedPosition.left,
                maxHeight: `${maxHeight}px`,
                overflowY: 'auto',
            }}
        >
            {children}
        </div>,
        portalRoot
    )
}