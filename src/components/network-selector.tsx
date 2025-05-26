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
          className={cn("flex items-center gap-2")}
        >
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              currentNetwork === "unique" ? "bg-blue-500" : "bg-purple-500"
            )}
          />
          <span>{currentNetworkName}</span>
          <ChevronDown className={cn("h-4 w-4 opacity-50")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn("w-[200px]")}
      >
        {networks.map((network) => (
          <DropdownMenuItem
            key={network.id}
            onClick={() => handleNetworkChange(network.id)}
            className={cn(
              "flex items-center justify-between cursor-pointer"
            )}
          >
            <div className={cn("flex items-center gap-2")}>  
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  network.id === "unique"
                    ? "bg-blue-500"
                    : "bg-purple-500"
                )}
              />
              <span>{network.name}</span>
            </div>
            {currentNetwork === network.id && (
              <Check className={cn("h-4 w-4")} />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
