"use client"

import { useEffect, useState, useRef } from "react"
import {
  ChevronRight,
  Factory,
  Building2,
  Boxes,
  Workflow,
  MonitorSmartphone,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NodeLegend } from "./node-legend"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define node colors for different types using CSS variables
export const nodeColors = {
  facility: {
    bg: "bg-[hsl(var(--node-facility-bg))]",
    text: "text-[hsl(var(--node-facility-text))]",
    border: "border-[hsl(var(--node-facility-text))]",
  },
  area: {
    bg: "bg-[hsl(var(--node-area-bg))]",
    text: "text-[hsl(var(--node-area-text))]",
    border: "border-[hsl(var(--node-area-text))]",
  },
  mini_factory: {
    bg: "bg-[hsl(var(--node-mini-factory-bg))]",
    text: "text-[hsl(var(--node-mini-factory-text))]",
    border: "border-[hsl(var(--node-mini-factory-text))]",
  },
  line: {
    bg: "bg-[hsl(var(--node-line-bg))]",
    text: "text-[hsl(var(--node-line-text))]",
    border: "border-[hsl(var(--node-line-text))]",
  },
  workstation: {
    bg: "bg-[hsl(var(--node-workstation-bg))]",
    text: "text-[hsl(var(--node-workstation-text))]",
    border: "border-[hsl(var(--node-workstation-text))]",
  },
}

// Define node icons for different types
export const nodeIcons = {
  facility: Factory,
  area: Building2,
  mini_factory: Boxes,
  line: Workflow,
  workstation: MonitorSmartphone,
}

interface TreeViewProps {
  data: any
  isLoading: boolean
  onNodeSelect: (id: string, type: string, node: any) => void
  selectedNodeId: string | null
  isExpanded?: boolean
  onToggleExpand?: () => void
  onFirstNodeFound?: ((node: any) => void) | null
  onRefresh?: () => void
  hideControls?: boolean
}

export function TreeView({
  data,
  isLoading,
  onNodeSelect,
  selectedNodeId,
  isExpanded = false,
  onToggleExpand,
  onFirstNodeFound,
  onRefresh,
  hideControls = false,
}: TreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [treeData, setTreeData] = useState<any[]>([])
  const [firstNodeFound, setFirstNodeFound] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [browserInfo, setBrowserInfo] = useState({
    isChrome: false,
    isFirefox: false,
    isSafari: false,
  })

  // Detect browser type
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    setBrowserInfo({
      isChrome: userAgent.indexOf("chrome") > -1 && userAgent.indexOf("safari") > -1,
      isFirefox: userAgent.indexOf("firefox") > -1,
      isSafari: userAgent.indexOf("safari") > -1 && userAgent.indexOf("chrome") === -1,
    })
  }, [])

  // Process data into a tree structure
  useEffect(() => {
    if (data && data.nodes && data.links) {
      console.log("Tree View received data:", { nodes: data.nodes.length, links: data.links.length })

      try {
        // Create a map of nodes by ID for quick lookup
        const nodeMap = new Map()
        data.nodes.forEach((node: any) => {
          nodeMap.set(node.id, { ...node, children: [] })
        })

        // Build parent-child relationships
        data.links.forEach((link: any) => {
          const sourceId = typeof link.source === "string" ? link.source : link.source.id
          const targetId = typeof link.target === "string" ? link.target : link.target.id

          const sourceNode = nodeMap.get(sourceId)
          const targetNode = nodeMap.get(targetId)

          if (sourceNode && targetNode) {
            // Determine parent-child relationship based on node types
            const nodeTypeRank = {
              facility: 1,
              area: 2,
              mini_factory: 3,
              line: 4,
              workstation: 5,
            }

            // The node with the lower rank is the parent
            if (nodeTypeRank[sourceNode.type] < nodeTypeRank[targetNode.type]) {
              sourceNode.children.push(targetNode)
            } else if (nodeTypeRank[sourceNode.type] > nodeTypeRank[targetNode.type]) {
              targetNode.children.push(sourceNode)
            } else {
              // If same type, use the link direction (source to target)
              sourceNode.children.push(targetNode)
            }
          }
        })

        // Find root nodes (nodes without parents)
        const rootNodes = Array.from(nodeMap.values()).filter((node: any) => {
          return !data.links.some((link: any) => {
            const targetId = typeof link.target === "string" ? link.target : link.target.id
            return targetId === node.id
          })
        })

        // Sort nodes by label
        rootNodes.sort((a: any, b: any) => a.label.localeCompare(b.label))

        console.log("Tree View root nodes:", rootNodes.length)
        setTreeData(rootNodes)

        // Auto-expand the first level
        rootNodes.forEach((node: any) => {
          setExpandedNodes((prev) => new Set([...prev, node.id]))
        })

        // Find the first node for auto-selection
        if (rootNodes.length > 0 && onFirstNodeFound && !firstNodeFound) {
          const firstNode = rootNodes[0]
          console.log("Auto-selecting first node:", firstNode)
          onFirstNodeFound(firstNode)
          setFirstNodeFound(true)
        }
      } catch (error) {
        console.error("Error processing tree data:", error)
      }
    }
  }, [data, onFirstNodeFound, firstNodeFound])

  // Apply browser-specific fixes after component mounts
  useEffect(() => {
    if (!scrollContainerRef.current) return

    // Force a reflow to ensure the scroll container is properly sized
    const applyBrowserFixes = () => {
      if (scrollContainerRef.current) {
        // Force a reflow
        scrollContainerRef.current.style.display = "none"
        void scrollContainerRef.current.offsetHeight
        scrollContainerRef.current.style.display = ""

        // Chrome-specific fixes
        if (browserInfo.isChrome) {
          scrollContainerRef.current.style.position = "relative"
          scrollContainerRef.current.style.minHeight = "0"
          scrollContainerRef.current.style.height = "100%"
        }

        // Firefox-specific fixes
        if (browserInfo.isFirefox) {
          scrollContainerRef.current.style.minHeight = "0"
          scrollContainerRef.current.style.overflow = "auto"
          scrollContainerRef.current.style.display = "block"
        }
      }
    }

    // Apply fixes after a short delay to ensure DOM is ready
    setTimeout(applyBrowserFixes, 0)

    // Also apply fixes when data changes
    if (treeData.length > 0) {
      applyBrowserFixes()
    }
  }, [treeData, browserInfo])

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const renderNode = (node: any, level = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedNodeId === node.id
    const hasChildren = node.children && node.children.length > 0
    const colors = nodeColors[node.type] || nodeColors.facility
    const Icon = nodeIcons[node.type] || nodeIcons.facility

    return (
      <div key={node.id} className="tree-node w-full select-none mb-1">
        <div
          className={cn(
            "flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors w-full",
            isSelected && "bg-muted",
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onNodeSelect(node.id, node.type, node)}
        >
          {hasChildren && (
            <button
              className="mr-1 p-1 rounded-sm hover:bg-muted/80 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(node.id)
              }}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronRight
                className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")}
              />
            </button>
          )}
          {!hasChildren && <div className="w-6 flex-shrink-0" />}
          <div
            className={cn(
              "flex items-center gap-2 py-1 px-2 rounded-md flex-shrink-0",
              colors.bg,
              isSelected && colors.border,
              isSelected ? "border-2" : "border border-transparent",
            )}
          >
            <Icon className={cn("h-4 w-4", colors.text)} />
            <span className="text-sm font-medium truncate max-w-[180px]">{node.label}</span>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="tree-children w-full">
            {node.children
              .sort((a: any, b: any) => a.label.localeCompare(b.label))
              .map((child: any) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Determine browser-specific container styles
  const getContainerStyles = () => {
    const baseStyles = {
      flex: "1 1 auto",
      overflow: "auto",
      position: "relative",
      display: "flex",
      flexDirection: "column" as const,
    }

    if (browserInfo.isChrome) {
      return {
        ...baseStyles,
        height: "100%", // Chrome works better with 100% height
        minHeight: "0",
      }
    }

    if (browserInfo.isFirefox) {
      return {
        ...baseStyles,
        height: "100%", // Firefox also needs 100% height
        minHeight: "0",
        display: "block", // Firefox works better with block display
      }
    }

    // Safari and others
    return {
      ...baseStyles,
      height: "0", // Safari works better with 0 height and flex
      minHeight: "0",
    }
  }

  return (
    <div className="tree-view-root flex-1 flex flex-col h-full" ref={containerRef}>
      {/* Legend and controls container */}
      <div className="p-3 border-b relative">
        <NodeLegend />

        {/* Horizontal control bar for tree view - positioned in the top right corner */}
        {!hideControls && (
          <div className="absolute top-1 right-2 z-10 bg-background/90 backdrop-blur-sm rounded-md border shadow-sm">
            <TooltipProvider>
              <div className="flex items-center p-1">
                {onRefresh && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={onRefresh} className="h-8 w-8" disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Refresh data</TooltipContent>
                  </Tooltip>
                )}
                {onToggleExpand && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={onToggleExpand} className="h-8 w-8">
                        {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{isExpanded ? "Restore default view" : "Expand view"}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Scrollable content area with browser-specific styles */}
      <div className="tree-view-container" ref={scrollContainerRef} style={getContainerStyles()}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div
            className="tree-view-content p-2"
            style={{
              flexShrink: 0,
              width: "100%",
              // Ensure content is visible in all browsers
              visibility: "visible",
              opacity: 1,
            }}
          >
            {treeData.length > 0 ? (
              <div className="tree-view-nodes">{treeData.map((node) => renderNode(node))}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                <p className="mb-2">No data available</p>
                {onRefresh && (
                  <Button variant="outline" size="sm" onClick={onRefresh} className="mt-4">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

