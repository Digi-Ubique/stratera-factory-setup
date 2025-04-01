import { Factory, Building2, Boxes, Workflow, MonitorSmartphone } from "lucide-react"
import { cn } from "@/lib/utils"

// Define node colors for different types
const nodeColors = {
  facility: {
    bg: "bg-[hsl(var(--node-facility-bg))]",
    text: "text-[hsl(var(--node-facility-text))]",
  },
  area: {
    bg: "bg-[hsl(var(--node-area-bg))]",
    text: "text-[hsl(var(--node-area-text))]",
  },
  mini_factory: {
    bg: "bg-[hsl(var(--node-mini-factory-bg))]",
    text: "text-[hsl(var(--node-mini-factory-text))]",
  },
  line: {
    bg: "bg-[hsl(var(--node-line-bg))]",
    text: "text-[hsl(var(--node-line-text))]",
  },
  workstation: {
    bg: "bg-[hsl(var(--node-workstation-bg))]",
    text: "text-[hsl(var(--node-workstation-text))]",
  },
}

// Define node icons for different types
const nodeIcons = {
  facility: Factory,
  area: Building2,
  mini_factory: Boxes,
  line: Workflow,
  workstation: MonitorSmartphone,
}

export function NodeLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {Object.entries(nodeIcons).map(([type, Icon]) => {
        const colors = nodeColors[type]
        const label = type
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

        return (
          <div key={type} className="flex items-center gap-1.5">
            <div className={cn("flex items-center justify-center w-6 h-6 rounded-md", colors.bg)}>
              <Icon className={cn("h-4 w-4", colors.text)} />
            </div>
            <span className="text-sm font-medium">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

