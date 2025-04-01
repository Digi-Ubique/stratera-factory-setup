"use client"

import { useState, useEffect } from "react"
import { factoryApi } from "@/services/api-service"
import { FactoryDualView } from "@/app/masters/factory/dual-view"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function FactoryPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const { toast } = useToast()

  const fetchFactoryData = async () => {
    setIsLoading(true)
    setHasError(false)
    setErrorMessage("")

    try {
      console.log("Fetching factory hierarchy data from API")
      const data = await factoryApi.fetchFactoryHierarchy()
      console.log("API data received:", data)

      // CRITICAL FIX: Validate data structure and provide detailed error messages
      if (!data) {
        throw new Error("API returned no data")
      }

      // Check if data has nodes property
      if (!data.nodes) {
        console.error("Data is missing nodes array:", data)
        throw new Error("Invalid data format: nodes array is missing")
      }

      // Check if nodes is an array
      if (!Array.isArray(data.nodes)) {
        console.error("Nodes is not an array:", data.nodes)
        throw new Error("Invalid data format: nodes is not an array")
      }

      // Check if data has links property
      if (!data.links) {
        console.error("Data is missing links array:", data)
        throw new Error("Invalid data format: links array is missing")
      }

      // Check if links is an array
      if (!Array.isArray(data.links)) {
        console.error("Links is not an array:", data.links)
        throw new Error("Invalid data format: links is not an array")
      }

      // Initialize node positions if not set
      const processedData = {
        nodes: data.nodes.map((node, index) => ({
          ...node,
          x: node.x || Math.random() * 800,
          y: node.y || Math.random() * 600,
          // CRITICAL FIX: Ensure all required properties exist
          id: node.id || `node-${index}`,
          label: node.label || node.name || `Node ${index}`,
          type: node.type || "workstation",
        })),
        links: data.links.map((link) => ({
          ...link,
          // CRITICAL FIX: Ensure source and target are strings
          source: typeof link.source === "object" ? link.source.id : link.source,
          target: typeof link.target === "object" ? link.target.id : link.target,
          type: link.type || "parent-child",
        })),
      }

      console.log("Processed data:", processedData)
      setGraphData(processedData)
      setIsLoading(false)

      toast({
        title: "Data loaded successfully",
        description: `Loaded ${processedData.nodes.length} nodes and ${processedData.links.length} connections`,
      })
    } catch (error) {
      console.error("Failed to fetch factory data:", error)
      setHasError(true)
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
      setIsLoading(false)

      // CRITICAL FIX: Initialize with mock data on error
      const mockData = {
        nodes: [
          { id: "facility-1", label: "Main Facility", type: "facility", x: 100, y: 100 },
          { id: "area-1", label: "Production Area", type: "area", x: 100, y: 200, parent_id: "facility-1" },
          { id: "mf-1", label: "Mini Factory 1", type: "mini_factory", x: 100, y: 300, parent_id: "area-1" },
          { id: "line-1", label: "Assembly Line", type: "line", x: 100, y: 400, parent_id: "mf-1" },
          { id: "ws-1", label: "Workstation 1", type: "workstation", x: 100, y: 500, parent_id: "line-1" },
        ],
        links: [
          { source: "facility-1", target: "area-1", type: "parent-child" },
          { source: "area-1", target: "mf-1", type: "parent-child" },
          { source: "mf-1", target: "line-1", type: "parent-child" },
          { source: "line-1", target: "ws-1", type: "parent-child" },
        ],
      }

      console.log("Using mock data due to error:", mockData)
      setGraphData(mockData)

      toast({
        title: "Error loading data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchFactoryData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 px-4">
        {hasError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading factory data</AlertTitle>
            <AlertDescription>
              {errorMessage}
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={fetchFactoryData} disabled={isLoading} className="mt-2">
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </>
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <FactoryDualView data={graphData} isLoading={isLoading} onRefresh={fetchFactoryData} />
      </main>
    </div>
  )
}

