"use client"

import { useEffect, useState } from "react"
import { factoryApi } from "@/services/api-service"
import { FactoryDualView } from "./dual-view"
import { useToast } from "@/hooks/use-toast"

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

      if (!data.nodes || !Array.isArray(data.nodes)) {
        throw new Error("Invalid data format: nodes array is missing")
      }

      if (!data.links || !Array.isArray(data.links)) {
        throw new Error("Invalid data format: links array is missing")
      }

      // Initialize node positions if not set
      data.nodes = data.nodes.map((node, index) => ({
        ...node,
        x: node.x || Math.random() * 800,
        y: node.y || Math.random() * 600,
      }))

      setGraphData(data)
      setIsLoading(false)

      toast({
        title: "Data loaded successfully",
        description: `Loaded ${data.nodes.length} nodes and ${data.links.length} connections`,
      })
    } catch (error) {
      console.error("Failed to fetch factory data:", error)
      setHasError(true)
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
      setIsLoading(false)

      // Initialize empty data structures
      setGraphData({ nodes: [], links: [] })

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
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Factory Portal</h1>
      <FactoryDualView data={graphData} isLoading={isLoading} onRefresh={fetchFactoryData} />
    </div>
  )
}

