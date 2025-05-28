"use client"

import { useState } from "react"
import { useWallet } from "@/context/wallet-context"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "../lib/utils"

const networks = [
  { id: "unique", name: "Unique Network" },
  { id: "quartz", name: "Quartz Network" },
]

export default function NetworkSelector() {
  const { currentNetwork, setCurrentNetwork, refreshBalances } = useWallet()
  const [isOpen, setIsOpen] = useState(false)

  const handleNetworkChange = async (networkId: string) => {
    setCurrentNetwork(networkId)
    await refreshBalances()
    setIsOpen(false)
  }

  const currentNetworkName =
    networks.find((n) => n.id === currentNetwork)?.name || "Select Network"

  return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
              variant="outline"
              className={cn("st-flex st-items-center st-gap-2")}
          >
            <div
                className={cn(
                    "st-w-3 st-h-3 st-rounded-full",
                    currentNetwork === "unique" ? "st-bg-blue-500" : "st-bg-purple-500"
                )}
            />
            <span>{currentNetworkName}</span>
            <ChevronDown className={cn("st-h-4 st-w-4 st-opacity-50")} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
            align="end"
            className={cn("st-w-[200px]")}
        >
          {networks.map((network) => (
              <DropdownMenuItem
                  key={network.id}
                  onClick={() => handleNetworkChange(network.id)}
                  className={cn(
                      "st-flex st-items-center st-justify-between st-cursor-pointer"
                  )}
              >
                <div className={cn("st-flex st-items-center st-gap-2")}>
                  <div
                      className={cn(
                          "st-w-3 st-h-3 st-rounded-full",
                          network.id === "unique"
                              ? "st-bg-blue-500"
                              : "st-bg-purple-500"
                      )}
                  />
                  <span>{network.name}</span>
                </div>
                {currentNetwork === network.id && (
                    <Check className={cn("st-h-4 st-w-4")} />
                )}
              </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
  )
}
