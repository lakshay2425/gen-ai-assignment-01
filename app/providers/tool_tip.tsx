"use client"

import { TooltipProvider as TooltipProviderUI } from "@/components/ui/tooltip";

export function TooltipProvider({children}: { children: React.ReactNode}) {
    return (
      <TooltipProviderUI >
        {children}
      </TooltipProviderUI>
    )
  }
  