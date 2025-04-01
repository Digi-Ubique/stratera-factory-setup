"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { List, Network, Maximize2, Minimize2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Import the components we need
import { TreeView } from "./tree-view"
import GraphView from "./graph-view"
import { NodeDetailsPanel } from "./node-details-panel"

interface FactoryDualViewProps {
  data: any
  isLoading: boolean
  onRefresh: () => void
}

export function FactoryDualView({ data, isLoading, onRefresh }: FactoryDualViewProps) {
  const [view, setView] = useState<"tree" | "graph">("tree")
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [isExpanded, setIsExpanded] = useState(false) // Default to showing both panels
  const { toast } = useToast()
  const [isMapDataAttributesOpen, setIsMapDataAttributesOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dualViewContainerRef = useRef<HTMLDivElement>(null)
  const [browserInfo, setBrowserInfo] = useState({
    isChrome: false,
    isFirefox: false,
    isSafari: false,
  })
  const [isMobile, setIsMobile] = useState(false)

  // Detect browser type
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    setBrowserInfo({
      isChrome: userAgent.indexOf("chrome") > -1 && userAgent.indexOf("safari") > -1,
      isFirefox: userAgent.indexOf("firefox") > -1,
      isSafari: userAgent.indexOf("safari") > -1 && userAgent.indexOf("chrome") === -1,
    })
  }, [])

  // Create a refreshData function that can be passed to child components
  const refreshData = useCallback(() => {
    // Clear selection when refreshing
    setSelectedNodeId(null)
    setSelectedNodeType(null)
    setSelectedNode(null)

    // Call the parent's refresh function
    onRefresh()

    toast({
      title: "Data refreshed",
      description: "The factory hierarchy has been updated",
    })
  }, [onRefresh, toast])

  // Helper function to remove circular references
  const removeCircularReferences = useCallback((node: any) => {
    if (!node) return null

    // Create a clean copy without parent and children references
    const cleanNode = { ...node }

    // Remove circular references
    delete cleanNode.parent
    delete cleanNode.children

    return cleanNode
  }, [])

  const handleNodeSelect = useCallback(
    (nodeId: string, nodeType: string, node: any) => {
      console.log(`Selected node: ${nodeId}, type: ${nodeType}`)

      // Normalize the node type to handle case inconsistencies
      const normalizedType = nodeType.toLowerCase()
      console.log(`Normalized node type: ${normalizedType}`)

      // Remove circular references before setting state
      const cleanNode = removeCircularReferences(node)

      setSelectedNodeId(nodeId)
      setSelectedNodeType(normalizedType)
      setSelectedNode(cleanNode)

      toast({
        title: "Node selected",
        description: `${node.label || nodeId} (${nodeType})`,
      })
    },
    [toast, removeCircularReferences],
  )

  // Update the handleRefresh function to use refreshData
  const handleRefresh = useCallback(() => {
    refreshData()
  }, [refreshData])

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const handleCloseDetails = () => {
    setSelectedNodeId(null)
    setSelectedNodeType(null)
    setSelectedNode(null)
  }

  // Apply browser-specific fixes to the dual view container
  useEffect(() => {
    if (!dualViewContainerRef.current) return

    // Force a reflow to ensure the container is properly sized
    const applyBrowserFixes = () => {
      if (dualViewContainerRef.current) {
        // Force a reflow
        dualViewContainerRef.current.style.display = "none"
        void dualViewContainerRef.current.offsetHeight
        dualViewContainerRef.current.style.display = ""

        // Chrome-specific fixes
        if (browserInfo.isChrome) {
          dualViewContainerRef.current.style.display = "flex"
          dualViewContainerRef.current.style.flexDirection = isMobile ? "column" : "row"
          dualViewContainerRef.current.style.minHeight = "0"
        }

        // Firefox-specific fixes
        if (browserInfo.isFirefox) {
          dualViewContainerRef.current.style.display = "flex"
          dualViewContainerRef.current.style.flexDirection = isMobile ? "column" : "row"
          dualViewContainerRef.current.style.minHeight = "0"
          dualViewContainerRef.current.style.overflow = "hidden"
        }
      }
    }

    // Apply fixes after a short delay to ensure DOM is ready
    setTimeout(applyBrowserFixes, 0)

    // Also apply fixes when view changes
    applyBrowserFixes()
  }, [view, browserInfo, isMobile])

  // Responsive adjustments for different screen sizes
  useEffect(() => {
    const handleResize = () => {
      // Check if mobile
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      // On small screens, expand to full width automatically
      if (mobile) {
        setIsExpanded(true)
      }
    }

    window.addEventListener("resize", handleResize)
    // Initial check
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleFirstNodeFound = useCallback(
    (node) => {
      // Always select the first node on initial load
      if (handleNodeSelect) {
        handleNodeSelect(node.id, node.type, node)
      }
    },
    [handleNodeSelect],
  )

  const handleMapDataOpen = useCallback((isOpen: boolean) => {
    console.log("Map data attributes modal state changed:", isOpen)
    setIsMapDataAttributesOpen(isOpen)
  }, [])

  // Calculate panel widths based on expansion state
  const leftPanelWidth = isExpanded ? "70%" : "50%"
  const rightPanelWidth = isExpanded ? "30%" : "50%"

  // Get browser-specific container styles
  const getContainerStyles = () => {
    const baseStyles = {
      gap: "1rem",
      overflow: "hidden",
    }

    if (browserInfo.isChrome) {
      return {
        ...baseStyles,
        display: "flex",
        flexDirection: isMobile ? ("column" as const) : ("row" as const),
        height: "calc(100vh - 220px)",
        minHeight: "500px",
        maxHeight: "800px",
      }
    }

    if (browserInfo.isFirefox) {
      return {
        ...baseStyles,
        display: "flex",
        flexDirection: isMobile ? ("column" as const) : ("row" as const),
        height: "calc(100vh - 220px)",
        minHeight: "500px",
        maxHeight: "800px",
      }
    }

    // Safari and others
    return {
      ...baseStyles,
      display: "flex",
      flexDirection: isMobile ? ("column" as const) : ("row" as const),
      height: "calc(100vh - 220px)",
      minHeight: "500px",
      maxHeight: "800px",
    }
  }

  return (
    <div className="w-full border rounded-lg p-4 flex flex-col h-full overflow-hidden" ref={containerRef}>
      <div className="flex items-center justify-between mb-2">
        <Tabs value={view} onValueChange={(v) => setView(v as "tree" | "graph")}>
          <TabsList>
            <TabsTrigger value="tree">
              <List className="mr-2 h-4 w-4" />
              Tree View
            </TabsTrigger>
            <TabsTrigger value="graph">
              <Network className="mr-2 h-4 w-4" />
              Graph View
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {!isMapDataAttributesOpen && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRefresh}
                      className="h-8 w-8"
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh data</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleExpanded} className="h-8 w-8">
                      {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isExpanded ? "Restore default view" : "Expand view"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      {/* FIXED HEIGHT CONTAINER for dual view with browser-specific styles */}
      <div
        className={`dual-view-container flex ${isMobile ? "flex-col" : "flex-row"}`}
        ref={dualViewContainerRef}
        style={getContainerStyles()}
      >
        <motion.div
          className="h-full flex flex-col overflow-hidden"
          animate={{
            width: isMobile ? "100%" : leftPanelWidth,
            transition: { duration: 0.3, ease: "easeInOut" },
          }}
          style={{
            width: isMobile ? "100%" : leftPanelWidth,
            minWidth: "0", // Add this to prevent overflow issues
          }}
        >
          <div className="border rounded-lg overflow-hidden flex-1 flex flex-col h-full w-full">
            {view === "tree" ? (
              <TreeView
                data={data}
                isLoading={isLoading}
                onNodeSelect={handleNodeSelect}
                selectedNodeId={selectedNodeId}
                isExpanded={isExpanded}
                onToggleExpand={toggleExpanded}
                onFirstNodeFound={handleFirstNodeFound}
                onRefresh={handleRefresh}
                hideControls={isMapDataAttributesOpen}
              />
            ) : (
              <GraphView
                data={data}
                isLoading={isLoading}
                onNodeSelect={handleNodeSelect}
                selectedNodeId={selectedNodeId}
                isExpanded={isExpanded}
                onToggleExpand={toggleExpanded}
                hideControls={isMapDataAttributesOpen}
                onRefresh={handleRefresh}
                onFirstNodeFound={handleFirstNodeFound}
              />
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {(!isExpanded || selectedNode) && !isMobile && (
            <motion.div
              className="w-full md:w-1/2 h-full flex flex-col"
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: 1,
                width: rightPanelWidth,
                transition: { duration: 0.3 },
              }}
              exit={{
                opacity: 0,
                width: 0,
                transition: { duration: 0.2 },
              }}
              style={{ width: rightPanelWidth }}
            >
              {selectedNode ? (
                <NodeDetailsPanel
                  node={selectedNode}
                  nodeType={selectedNodeType}
                  onClose={handleCloseDetails}
                  onRefresh={refreshData} // Pass the refresh function
                  onMapDataOpen={handleMapDataOpen}
                />
              ) : (
                <div className="border rounded-lg flex-1 flex items-center justify-center p-8 text-muted-foreground">
                  <p>Select a node to view its details</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile view for details panel */}
        {isMobile && selectedNode && (
          <div className="w-full mt-4">
            <NodeDetailsPanel
              node={selectedNode}
              nodeType={selectedNodeType}
              onClose={handleCloseDetails}
              onRefresh={refreshData}
              onMapDataOpen={handleMapDataOpen}
            />
          </div>
        )}
      </div>
    </div>
  )
}

