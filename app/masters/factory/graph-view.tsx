"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOutIcon, RefreshCw, Maximize2, Minimize2, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { nodeColors, nodeIcons } from "./tree-view"
import { NodeLegend } from "./node-legend"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface GraphViewProps {
  data: any
  isLoading: boolean
  onNodeSelect: (id: string, type: string, node: any) => void
  selectedNodeId: string | null
  isExpanded?: boolean
  onToggleExpand?: () => void
  hideControls?: boolean
  onRefresh?: () => void
  onFirstNodeFound?: (node: any) => void
}

export default function GraphView({
  data,
  isLoading,
  onNodeSelect,
  selectedNodeId,
  isExpanded = false,
  onToggleExpand,
  hideControls = false,
  onRefresh,
  onFirstNodeFound,
}: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const graphContainerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([])
  const [hierarchicalNodes, setHierarchicalNodes] = useState<any[]>([])
  const [mainRootNode, setMainRootNode] = useState<any>(null)
  const [svgDimensions, setSvgDimensions] = useState({ width: 1000, height: 600 })
  const [viewportDimensions, setViewportDimensions] = useState({ width: 0, height: 0 })
  const [isInitialRender, setIsInitialRender] = useState(true)
  const [nodeConnections, setNodeConnections] = useState<Map<string, string[]>>(new Map())
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

  // Process data into a hierarchical layout
  useEffect(() => {
    if (data && data.nodes && data.links) {
      console.log("Graph View received data:", { nodes: data.nodes.length, links: data.links.length })

      try {
        // Create a map of nodes by ID for quick lookup
        const nodeMap = new Map()
        data.nodes.forEach((node: any) => {
          nodeMap.set(node.id, {
            ...node,
            x: node.x || Math.random() * 800,
            y: node.y || Math.random() * 600,
            children: [],
          })
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
              // Store parent ID instead of reference to avoid circular reference
              targetNode.parentId = sourceNode.id
            } else if (nodeTypeRank[sourceNode.type] > nodeTypeRank[targetNode.type]) {
              targetNode.children.push(sourceNode)
              // Store parent ID instead of reference to avoid circular reference
              sourceNode.parentId = targetNode.id
            } else {
              // If same type, use the link direction (source to target)
              sourceNode.children.push(targetNode)
              // Store parent ID instead of reference to avoid circular reference
              targetNode.parentId = sourceNode.id
            }
          }
        })

        // Find root nodes (nodes without parents)
        const rootNodes = Array.from(nodeMap.values()).filter((node: any) => !node.parentId)

        // Find the main root node (facility type or first root node)
        const facilityNode = rootNodes.find((node: any) => node.type === "facility")
        const mainRoot = facilityNode || rootNodes[0]

        // Assign levels to nodes (depth in the hierarchy)
        function assignLevels(node: any, level = 0) {
          node.level = level
          node.children.forEach((child: any) => assignLevels(child, level + 1))
        }

        // Start assigning levels from the main root node if available
        if (mainRoot) {
          assignLevels(mainRoot)
        } else {
          // Otherwise assign levels from all root nodes
          rootNodes.forEach((root: any) => assignLevels(root))
        }

        // Group nodes by level
        const nodesByLevel: Record<string, any[]> = {}
        Array.from(nodeMap.values()).forEach((node: any) => {
          if (!nodesByLevel[node.level]) {
            nodesByLevel[node.level] = []
          }
          nodesByLevel[node.level].push(node)
        })

        // Calculate x and y positions with consistent vertical spacing
        const levelHeight = 150 // Vertical distance between levels
        const nodePadding = 250 // Horizontal padding between nodes

        // Position nodes at each level
        Object.entries(nodesByLevel).forEach(([level, levelNodes]) => {
          const levelWidth = levelNodes.length * nodePadding
          const startX = -levelWidth / 2 + nodePadding / 2

          levelNodes.forEach((node, index) => {
            node.y = Number(level) * levelHeight
            node.x = startX + index * nodePadding
          })
        })

        // Build a map of node connections for highlighting
        const connections = new Map<string, string[]>()
        data.links.forEach((link: any) => {
          const sourceId = typeof link.source === "string" ? link.source : link.source.id
          const targetId = typeof link.target === "string" ? link.target : link.target.id

          // Add connection from source to target
          if (!connections.has(sourceId)) {
            connections.set(sourceId, [])
          }
          connections.get(sourceId)!.push(targetId)

          // Add connection from target to source
          if (!connections.has(targetId)) {
            connections.set(targetId, [])
          }
          connections.get(targetId)!.push(sourceId)
        })

        setNodeConnections(connections)
        setHierarchicalNodes(Array.from(nodeMap.values()))
        setMainRootNode(mainRoot)

        // Calculate SVG dimensions based on node positions
        const nodes = Array.from(nodeMap.values())
        if (nodes.length > 0) {
          const minX = Math.min(...nodes.map((node) => node.x)) - 150
          const maxX = Math.max(...nodes.map((node) => node.x)) + 150
          const minY = Math.min(...nodes.map((node) => node.y)) - 80
          const maxY = Math.max(...nodes.map((node) => node.y)) + 120

          const width = Math.max(1000, maxX - minX)
          const height = Math.max(600, maxY - minY)

          setSvgDimensions({ width, height })
        }

        // Auto-select the first node
        if (mainRoot && onFirstNodeFound && isInitialRender) {
          // Create a clean copy of the node without circular references
          const cleanNode = { ...mainRoot }
          delete cleanNode.children

          onFirstNodeFound(cleanNode)
          setIsInitialRender(false)
        }
      } catch (error) {
        console.error("Error processing graph data:", error)
      }
    }
  }, [data, onFirstNodeFound, isInitialRender])

  // Apply browser-specific fixes after component mounts
  useEffect(() => {
    if (!graphContainerRef.current) return

    // Force a reflow to ensure the graph container is properly sized
    const applyBrowserFixes = () => {
      if (graphContainerRef.current) {
        // Force a reflow
        graphContainerRef.current.style.display = "none"
        void graphContainerRef.current.offsetHeight
        graphContainerRef.current.style.display = ""

        // Chrome-specific fixes
        if (browserInfo.isChrome) {
          graphContainerRef.current.style.position = "relative"
          graphContainerRef.current.style.minHeight = "0"
          graphContainerRef.current.style.height = "100%"
        }

        // Firefox-specific fixes
        if (browserInfo.isFirefox) {
          graphContainerRef.current.style.minHeight = "0"
          graphContainerRef.current.style.overflow = "auto"
          graphContainerRef.current.style.display = "block"
        }
      }
    }

    // Apply fixes after a short delay to ensure DOM is ready
    setTimeout(applyBrowserFixes, 0)

    // Also apply fixes when data changes
    if (hierarchicalNodes.length > 0) {
      applyBrowserFixes()
    }
  }, [hierarchicalNodes, browserInfo])

  // Function to center the view on the main root node
  const centerOnRootNode = useCallback(() => {
    if (!mainRootNode || !containerRef.current) return

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight

    // Update viewport dimensions
    setViewportDimensions({
      width: containerWidth,
      height: containerHeight,
    })

    // Position the main root node at the center-top of the viewport
    setPosition({
      x: containerWidth / 2,
      y: 100,
    })

    // Set an appropriate zoom level
    setScale(0.8)
  }, [mainRootNode])

  // Center on root node when it's first identified
  useEffect(() => {
    if (mainRootNode && isInitialRender) {
      // Use a small timeout to ensure the DOM is ready
      const timer = setTimeout(() => {
        centerOnRootNode()
        setIsInitialRender(false)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [mainRootNode, isInitialRender, centerOnRootNode])

  // Handle zoom in
  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale * 1.2, 3))
  }

  // Handle zoom out
  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale / 1.2, 0.3))
  }

  // Reset view
  const handleResetView = () => {
    centerOnRootNode()
  }

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left mouse button
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle node selection
  const handleNodeSelect = (node: any) => {
    // Create a clean copy of the node without circular references
    const cleanNode = { ...node }
    delete cleanNode.children

    // Pass the clean node to the selection handler
    onNodeSelect(node.id, node.type, cleanNode)

    // Highlight the selected node and its connected nodes
    const connectedNodeIds = nodeConnections.get(node.id) || []
    setHighlightedNodes([node.id, ...connectedNodeIds])
  }

  // Determine browser-specific container styles
  const getContainerStyles = () => {
    const baseStyles = {
      flex: "1 1 auto",
      overflow: "auto",
      position: "relative",
      cursor: isDragging ? "grabbing" : "grab",
    }

    if (browserInfo.isChrome) {
      return {
        ...baseStyles,
        height: "100%", // Chrome works better with 100% height
        minHeight: "0",
        display: "flex",
        flexDirection: "column" as const,
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
      display: "flex",
      flexDirection: "column" as const,
    }
  }

  // Memoize the node and link rendering to improve performance
  const renderedLinks = useMemo(() => {
    return hierarchicalNodes
      .map((node) => {
        if (!node.parentId) return null

        // Find the parent node using parentId instead of direct reference
        const source = hierarchicalNodes.find((n) => n.id === node.parentId)
        if (!source) return null

        const target = node

        const isHighlighted = highlightedNodes.includes(source.id) && highlightedNodes.includes(target.id)
        const isMainRootConnection = source.id === mainRootNode?.id || target.id === mainRootNode?.id

        // Create a straighter path from parent to child
        const path = `M ${source.x} ${source.y + 30} 
                C ${source.x} ${source.y + 50}, 
                  ${target.x} ${target.y - 50}, 
                  ${target.x} ${target.y - 30}`

        return (
          <path
            key={`link-${source.id}-${target.id}`}
            d={path}
            stroke={isHighlighted ? "#6366F1" : isMainRootConnection ? "#94A3B8" : "#CBD5E1"}
            strokeWidth={isHighlighted ? 3 : isMainRootConnection ? 2.5 : 2}
            strokeOpacity={isHighlighted ? 1 : isMainRootConnection ? 0.9 : 0.7}
            fill="none"
          />
        )
      })
      .filter(Boolean)
  }, [hierarchicalNodes, highlightedNodes, mainRootNode])

  return (
    <div className="graph-view-root relative w-full flex-1 flex flex-col" ref={containerRef}>
      {/* Legend and controls container */}
      <div className="p-3 border-b relative">
        <NodeLegend />

        {/* Control bar - positioned in the top right corner */}
        {!hideControls && (
          <div className="absolute top-1 right-2 z-10 bg-background/90 backdrop-blur-sm rounded-md border shadow-sm">
            <TooltipProvider>
              <div className="flex items-center p-1">
                {/* Zoom controls */}
                <div className="flex items-center mr-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8">
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Zoom In</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8">
                        <ZoomOutIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Zoom Out</TooltipContent>
                  </Tooltip>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-border mx-1"></div>

                {/* Navigation controls */}
                <div className="flex items-center">
                  {onRefresh && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onRefresh}
                          className="h-8 w-8"
                          disabled={isLoading}
                        >
                          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Refresh data</TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleResetView} className="h-8 w-8">
                        <Home className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Center View</TooltipContent>
                  </Tooltip>
                </div>

                {/* Expand/collapse button */}
                {onToggleExpand && (
                  <>
                    <div className="w-px h-6 bg-border mx-1"></div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={onToggleExpand} className="h-8 w-8">
                          {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {isExpanded ? "Restore default view" : "Expand view"}
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Graph container with browser-specific styles */}
      <div className="graph-view-container" ref={graphContainerRef} style={getContainerStyles()}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : hierarchicalNodes.length > 0 ? (
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
            preserveAspectRatio="xMidYMid meet"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="graph-svg"
            style={{
              flexShrink: 0,
              visibility: "visible",
              opacity: 1,
            }}
          >
            <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
              {/* Draw links first so they appear behind nodes */}
              {renderedLinks}

              {/* Draw nodes on top of links */}
              {hierarchicalNodes.map((node) => {
                const isSelected = selectedNodeId === node.id
                const isHighlighted = highlightedNodes.includes(node.id)
                const isMainRoot = mainRootNode?.id === node.id
                const colors = nodeColors[node.type] || nodeColors.facility
                const Icon = nodeIcons[node.type] || nodeIcons.facility

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => handleNodeSelect(node)}
                    className="cursor-pointer graph-node"
                    style={{
                      visibility: "visible",
                      opacity: 1,
                    }}
                  >
                    {/* Node shadow */}
                    <circle
                      r={isMainRoot ? 32 : isSelected ? 28 : 26}
                      fill="#000000"
                      opacity={0.1}
                      transform="translate(2, 2)"
                    />

                    {/* Node background */}
                    <circle
                      r={isMainRoot ? 32 : isSelected ? 28 : 26}
                      className={cn(
                        colors.bg,
                        isSelected || isHighlighted ? colors.border : "border-gray-300 dark:border-gray-700",
                        "border-2",
                        isMainRoot && "border-[3px]",
                      )}
                    />

                    {/* Node icon */}
                    <foreignObject
                      x={isMainRoot ? -16 : -12}
                      y={isMainRoot ? -16 : -12}
                      width={isMainRoot ? 32 : 24}
                      height={isMainRoot ? 32 : 24}
                      className="pointer-events-none"
                    >
                      <div className="flex items-center justify-center h-full">
                        <Icon className={cn(colors.text, isMainRoot ? "h-6 w-6" : "h-5 w-5")} />
                      </div>
                    </foreignObject>

                    {/* Node label */}
                    <foreignObject
                      x={-90}
                      y={isMainRoot ? 36 : 32}
                      width={180}
                      height={40}
                      className="pointer-events-none"
                    >
                      <div className="flex items-center justify-center h-full">
                        <p
                          className={cn(
                            "text-sm font-medium text-center text-gray-800 dark:text-gray-200 leading-tight bg-white/80 dark:bg-gray-800/80 px-2 py-0.5 rounded-md",
                            isMainRoot && "font-bold",
                          )}
                          style={{
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          {node.label}
                        </p>
                      </div>
                    </foreignObject>

                    {/* Selection indicator */}
                    {isSelected && (
                      <circle
                        r={isMainRoot ? 36 : 32}
                        fill="none"
                        className="stroke-2 stroke-primary"
                        strokeDasharray="4 2"
                      />
                    )}
                  </g>
                )
              })}
            </g>
          </svg>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <p className="mb-2">No graph data available</p>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

