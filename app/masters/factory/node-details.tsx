"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Info,
  Settings,
  Calendar,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Tag,
  MapPin,
  BarChart,
  Shield,
} from "lucide-react"

// Import the node colors and icons from the tree view
import { nodeColors, nodeIcons } from "./tree-view"

interface NodeDetailsProps {
  nodeId: string
  nodeType: string | null
  onClose: () => void
}

export function NodeDetails({ nodeId, nodeType, onClose }: NodeDetailsProps) {
  const [nodeData, setNodeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNodeDetails() {
      setLoading(true)
      setError(null)

      try {
        // Fetch node details from API
        const response = await fetch(`/api/factory-node/${nodeId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch node details: ${response.statusText}`)
        }

        const data = await response.json()
        setNodeData(data)
      } catch (err) {
        console.error("Error fetching node details:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch node details")
      } finally {
        setLoading(false)
      }
    }

    if (nodeId) {
      fetchNodeDetails()
    }
  }, [nodeId])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Separator className="my-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
        <h3 className="font-medium flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          Error Loading Node Details
        </h3>
        <p className="mt-2 text-sm">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onClose}>
          Close
        </Button>
      </div>
    )
  }

  if (!nodeData) {
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-md text-yellow-600 dark:text-yellow-400">
        <h3 className="font-medium flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          No Data Available
        </h3>
        <p className="mt-2 text-sm">No details found for this node.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onClose}>
          Close
        </Button>
      </div>
    )
  }

  // Get the appropriate icon for the node type
  const NodeTypeIcon = nodeType ? nodeIcons[nodeType] || Info : Info
  const nodeColor = nodeType ? nodeColors[nodeType] || nodeColors.workstation : nodeColors.workstation

  // Helper function to render a property row
  const PropertyRow = ({ label, value, icon = null }) => {
    if (value === undefined || value === null) return null

    return (
      <div className="flex items-start py-2 border-b border-border last:border-0">
        <div className="w-1/2 flex items-center text-sm font-medium text-muted-foreground">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </div>
        <div className="w-1/2 text-sm break-words">{value}</div>
      </div>
    )
  }

  // Helper function to render a section
  const Section = ({ title, icon, children }) => (
    <div className="mb-4">
      <h3 className="text-sm font-medium flex items-center mb-2 text-muted-foreground">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      <div className="bg-muted/30 rounded-md p-3">{children}</div>
    </div>
  )

  // Format status with appropriate color
  const getStatusBadge = (status) => {
    if (!status) return null

    const statusColors = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      maintenance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }

    const color = statusColors[status.toLowerCase()] || statusColors.inactive

    return (
      <Badge variant="outline" className={color}>
        {status === "active" && <CheckCircle className="h-3 w-3 mr-1" />}
        {status === "error" && <AlertCircle className="h-3 w-3 mr-1" />}
        {status === "maintenance" && <Settings className="h-3 w-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <ScrollArea className="pr-4">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-md mr-3 ${nodeColor.bg}`}>
              <NodeTypeIcon className={`h-5 w-5 ${nodeColor.text}`} />
            </div>
            <div>
              <h3 className="font-medium text-lg">{nodeData.name || nodeData.label}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="capitalize">{nodeType}</span>
                {nodeData.code && <span className="ml-2 opacity-70">({nodeData.code})</span>}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {nodeData.status && (
          <div className="flex items-center">
            <span className="text-sm mr-2">Status:</span>
            {getStatusBadge(nodeData.status)}
          </div>
        )}

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">
              <Info className="h-4 w-4 mr-2" />
              Info
            </TabsTrigger>
            <TabsTrigger value="specs">
              <Settings className="h-4 w-4 mr-2" />
              Specs
            </TabsTrigger>
            <TabsTrigger value="shifts">
              <Calendar className="h-4 w-4 mr-2" />
              Shifts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <Section title="Basic Information" icon={<Info className="h-4 w-4" />}>
              <PropertyRow label="ID" value={nodeData.id} />
              <PropertyRow label="Name" value={nodeData.name || nodeData.label} />
              <PropertyRow label="Type" value={nodeType && nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} />
              <PropertyRow label="Code" value={nodeData.code} />
              <PropertyRow label="Status" value={nodeData.status} />
            </Section>

            {nodeData.location && (
              <Section title="Location" icon={<MapPin className="h-4 w-4" />}>
                <PropertyRow label="Building" value={nodeData.location.building} />
                <PropertyRow label="Floor" value={nodeData.location.floor} />
                <PropertyRow label="Room" value={nodeData.location.room} />
                <PropertyRow
                  label="Coordinates"
                  value={
                    nodeData.location.coordinates
                      ? `${nodeData.location.coordinates.x}, ${nodeData.location.coordinates.y}`
                      : null
                  }
                />
              </Section>
            )}

            {nodeData.assetData && (
              <Section title="Asset Information" icon={<Tag className="h-4 w-4" />}>
                <PropertyRow label="Asset ID" value={nodeData.assetData.assetId} />
                <PropertyRow label="Serial Number" value={nodeData.assetData.serialNumber} />
                <PropertyRow label="Manufacturer" value={nodeData.assetData.manufacturer} />
                <PropertyRow label="Model" value={nodeData.assetData.model} />
                <PropertyRow label="Installation Date" value={nodeData.assetData.installationDate} />
              </Section>
            )}
          </TabsContent>

          <TabsContent value="specs" className="mt-4">
            {nodeData.specifications ? (
              <>
                <Section title="Technical Specifications" icon={<Settings className="h-4 w-4" />}>
                  {Object.entries(nodeData.specifications).map(([key, value]) => (
                    <PropertyRow
                      key={key}
                      label={key
                        .split(/(?=[A-Z])/)
                        .join(" ")
                        .replace(/^\w/, (c) => c.toUpperCase())}
                      value={value}
                    />
                  ))}
                </Section>

                {nodeData.parameters && (
                  <Section title="Parameters" icon={<BarChart className="h-4 w-4" />}>
                    {Object.entries(nodeData.parameters).map(([key, value]) => (
                      <PropertyRow
                        key={key}
                        label={key
                          .split(/(?=[A-Z])/)
                          .join(" ")
                          .replace(/^\w/, (c) => c.toUpperCase())}
                        value={value}
                      />
                    ))}
                  </Section>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No specification data available for this node type.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shifts" className="mt-4">
            {nodeData.shifts ? (
              <Section title="Shift Information" icon={<Clock className="h-4 w-4" />}>
                {nodeData.shifts.map((shift, index) => (
                  <div key={index} className="mb-3 last:mb-0 p-2 bg-background rounded-md border">
                    <div className="font-medium">{shift.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {shift.startTime} - {shift.endTime}
                    </div>
                    {shift.personnel && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Personnel:</span> {shift.personnel}
                      </div>
                    )}
                  </div>
                ))}
              </Section>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No shift data available for this node.</p>
              </div>
            )}

            {nodeData.maintenance && (
              <Section title="Maintenance Schedule" icon={<Shield className="h-4 w-4" />}>
                {nodeData.maintenance.map((item, index) => (
                  <div key={index} className="mb-3 last:mb-0 p-2 bg-background rounded-md border">
                    <div className="font-medium">{item.type}</div>
                    <div className="text-sm text-muted-foreground">Next: {item.nextDate}</div>
                    <div className="text-sm text-muted-foreground">Frequency: {item.frequency}</div>
                  </div>
                ))}
              </Section>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}

