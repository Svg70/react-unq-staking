// Create a new file for tab context
"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

type TabType = "stake" | "unstake"

interface TabContextType {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  registerTabChangeCallback: (tab: TabType, callback: () => void) => () => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export function useTab() {
  const context = useContext(TabContext)
  if (!context) {
    throw new Error("useTab must be used within a TabProvider")
  }
  return context
}

interface TabProviderProps {
  children: React.ReactNode
  defaultTab?: TabType
}

export function TabProvider({ children, defaultTab = "stake" }: TabProviderProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab)
  const [stakeCallbacks, setStakeCallbacks] = useState<Array<() => void>>([])
  const [unstakeCallbacks, setUnstakeCallbacks] = useState<Array<() => void>>([])

  const registerTabChangeCallback = useCallback((tab: TabType, callback: () => void) => {
    if (tab === "stake") {
      setStakeCallbacks((prev) => [...prev, callback])
      return () => setStakeCallbacks((prev) => prev.filter((cb) => cb !== callback))
    } else {
      setUnstakeCallbacks((prev) => [...prev, callback])
      return () => setUnstakeCallbacks((prev) => prev.filter((cb) => cb !== callback))
    }
  }, [])

  const handleSetActiveTab = useCallback(
    (tab: TabType) => {
      setActiveTab(tab)

      // Call the appropriate callbacks
      if (tab === "stake") {
        stakeCallbacks.forEach((callback) => callback())
      } else {
        unstakeCallbacks.forEach((callback) => callback())
      }
    },
    [stakeCallbacks, unstakeCallbacks],
  )

  const value = {
    activeTab,
    setActiveTab: handleSetActiveTab,
    registerTabChangeCallback,
  }

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>
}

export default TabContext
