"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save, Plus, Edit, Loader2, Trash2, ChevronDown, ChevronUp, Database } from "lucide-react"
import { nodeIcons } from "./tree-view"
import { useToast } from "@/hooks/use-toast"
import { AddNodeModal } from "./add-node-modal"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { MapDataAttributes } from "./map-data-attributes"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface NodeDetailsPanelProps {
  node: any
  nodeType: string | null
  onClose: () => void
  onRefresh: () => void
  onMapDataOpen?: (open: boolean) => void
}

export function NodeDetailsPanel({ node, nodeType, onClose, onRefresh, onMapDataOpen }: NodeDetailsPanelProps) {
  // Add debug logging for component rendering
  console.log("NodeDetailsPanel rendering with nodeType:", nodeType)
  console.log("Node data:", node)

  const [activeTab, setActiveTab] = useState("details")
  const [formData, setFormData] = useState({
    description: "",
    code: "",
    status: "active",
    city: "",
    country: "",
    // Add workstation-specific fields
    plcName: "",
    plcIpAddress: "",
    plcMacAddress: "",
    serverConnectionAttribute: "",
    allPlcDataStreamed: false,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addNodeType, setAddNodeType] = useState<"area" | "line" | "workstation" | "mini_factory">("area")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMapDataOpen, setIsMapDataOpen] = useState(false)

  // Collapsible sections state
  const [sectionsState, setSectionsState] = useState({
    basicInfo: true,
    locationInfo: true,
    plcInfo: true,
    connectionInfo: true,
  })

  // Toggle section visibility
  const toggleSection = (section: keyof typeof sectionsState) => {
    setSectionsState((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Normalize node type to handle case inconsistencies
  const normalizedNodeType = nodeType?.toLowerCase() || null
  const isWorkstation = normalizedNodeType === "workstation"

  // Use useEffect to properly initialize form data when node changes
  useEffect(() => {
    if (node) {
      // Debug logging
      console.log("Node data received in details panel:", JSON.stringify(node, null, 2))
      console.log("Node type:", nodeType)
      console.log("Is workstation:", isWorkstation)

      // Check all possible paths for description
      let description = ""
      if (node.description) {
        console.log("Found description directly on node:", node.description)
        description = node.description
      } else if (node.assetData?.description) {
        console.log("Found description in assetData:", node.assetData.description)
        description = node.assetData.description
      }

      // Initialize with base data
      const initialData = {
        description: description,
        code: node.code || "",
        status: node.status || "active",
        city: "",
        country: "",
        // Initialize workstation fields with empty values
        plcName: "",
        plcIpAddress: "",
        plcMacAddress: "",
        serverConnectionAttribute: "",
        allPlcDataStreamed: false,
      }

      // Add facility-specific data if applicable
      if (nodeType === "facility") {
        // Based on the form examples, the data structure might be:
        // 1. node.assetData.parameters.specs.demographics
        // 2. node.parameters.specs.demographics
        // 3. node.assetData.location

        // Try all possible paths
        if (node.assetData?.parameters?.specs?.demographics) {
          console.log("Found demographics in assetData.parameters.specs:", node.assetData.parameters.specs.demographics)
          initialData.city = node.assetData.parameters.specs.demographics.city || ""
          initialData.country = node.assetData.parameters.specs.demographics.country || ""
        } else if (node.parameters?.specs?.demographics) {
          console.log("Found demographics in parameters.specs:", node.parameters.specs.demographics)
          initialData.city = node.parameters.specs.demographics.city || ""
          initialData.country = node.parameters.specs.demographics.country || ""
        } else if (node.assetData?.location) {
          console.log("Found location in assetData:", node.assetData.location)
          initialData.city = node.assetData.location.city || ""
          initialData.country = node.assetData.location.country || ""
        } else if (node.location) {
          console.log("Found location directly on node:", node.location)
          initialData.city = node.location.city || ""
          initialData.country = node.location.country || ""
        }
      }
      // Add workstation-specific data if applicable
      else if (isWorkstation) {
        console.log("Processing workstation data")

        // Try to find PLC details in different possible paths
        const plcDetails = node.parameters?.specs?.details || node.assetData?.parameters?.specs?.details || {}

        console.log("PLC details:", plcDetails)

        initialData.plcName = plcDetails.plc_name || ""
        initialData.plcIpAddress = plcDetails.plc_ip_address || ""
        initialData.plcMacAddress = plcDetails.plc_mac_address || ""
        initialData.serverConnectionAttribute = plcDetails.server_connection_attribute || ""
        initialData.allPlcDataStreamed = plcDetails.all_plc_data_streamed_into_server === "yes"
      }

      console.log("Initialized form data:", initialData)
      setFormData(initialData)

      // Reset editing state when node changes
      setIsEditing(false)
    }
  }, [node, nodeType, isWorkstation])

  // Update the handleInputChange function to handle checkbox changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    // Reset form data to original values
    if (node) {
      // Re-initialize form data from node
      let description = ""
      if (node.description) {
        description = node.description
      } else if (node.assetData?.description) {
        description = node.assetData.description
      }

      const initialData = {
        description: description,
        code: node.code || "",
        status: node.status || "active",
        city: "",
        country: "",
        plcName: "",
        plcIpAddress: "",
        plcMacAddress: "",
        serverConnectionAttribute: "",
        allPlcDataStreamed: false,
      }

      if (nodeType === "facility") {
        if (node.assetData?.parameters?.specs?.demographics) {
          initialData.city = node.assetData.parameters.specs.demographics.city || ""
          initialData.country = node.assetData.parameters.specs.demographics.country || ""
        } else if (node.parameters?.specs?.demographics) {
          initialData.city = node.parameters.specs.demographics.city || ""
          initialData.country = node.parameters.specs.demographics.country || ""
        } else if (node.assetData?.location) {
          initialData.city = node.assetData.location.city || ""
          initialData.country = node.assetData.location.country || ""
        } else if (node.location) {
          initialData.city = node.location.city || ""
          initialData.country = node.location.country || ""
        }
      }

      setFormData(initialData)
    }

    setIsEditing(false)
  }

  // Handle opening the Map Data Attributes modal
  const handleOpenMapData = () => {
    console.log("Opening Map Data Attributes modal")
    if (onMapDataOpen) {
      onMapDataOpen(true)
    }
    setIsMapDataOpen(true)
  }

  // Update the handleSave function to include workstation data
  const handleSave = async () => {
    if (!node || !node.id) {
      toast({
        title: "Error",
        description: "Node ID is missing",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Create the proper data structure for saving
      const saveData = {
        ...node,
        description: formData.description,
        code: formData.code,
        status: formData.status,
      }

      // Only update demographics for facility type
      if (nodeType === "facility") {
        // Ensure we update the data in the same structure it was found
        if (node.assetData?.parameters?.specs?.demographics) {
          saveData.assetData = saveData.assetData || {}
          saveData.assetData.parameters = saveData.assetData.parameters || {}
          saveData.assetData.parameters.specs = saveData.assetData.parameters.specs || {}
          saveData.assetData.parameters.specs.demographics = saveData.assetData.parameters.specs.demographics || {}
          saveData.assetData.parameters.specs.demographics.city = formData.city
          saveData.assetData.parameters.specs.demographics.country = formData.country
        } else if (node.parameters?.specs?.demographics) {
          saveData.parameters = saveData.parameters || {}
          saveData.parameters.specs = saveData.parameters.specs || {}
          saveData.parameters.specs.demographics = saveData.parameters.specs.demographics || {}
          saveData.parameters.specs.demographics.city = formData.city
          saveData.parameters.specs.demographics.country = formData.country
        } else if (node.assetData?.location) {
          saveData.assetData = saveData.assetData || {}
          saveData.assetData.location = saveData.assetData.location || {}
          saveData.assetData.location.city = formData.city
          saveData.assetData.location.country = formData.country
        } else if (node.location) {
          saveData.location = saveData.location || {}
          saveData.location.city = formData.city
          saveData.location.country = formData.country
        } else {
          // If no existing structure, create one
          saveData.parameters = saveData.parameters || {}
          saveData.parameters.specs = saveData.parameters.specs || {}
          saveData.parameters.specs.demographics = saveData.parameters.specs.demographics || {}
          saveData.parameters.specs.demographics.city = formData.city
          saveData.parameters.specs.demographics.country = formData.country
        }
      }
      // Add workstation-specific data
      else if (isWorkstation) {
        // Determine where to store the PLC details
        if (node.parameters?.specs?.details) {
          saveData.parameters = saveData.parameters || {}
          saveData.parameters.specs = saveData.parameters.specs || {}
          saveData.parameters.specs.details = saveData.parameters.specs.details || {}
          saveData.parameters.specs.details.plc_name = formData.plcName
          saveData.parameters.specs.details.plc_ip_address = formData.plcIpAddress
          saveData.parameters.specs.details.plc_mac_address = formData.plcMacAddress
          saveData.parameters.specs.details.server_connection_attribute = formData.serverConnectionAttribute
          saveData.parameters.specs.details.all_plc_data_streamed_into_server = formData.allPlcDataStreamed
            ? "yes"
            : "no"
        } else if (node.assetData?.parameters?.specs?.details) {
          saveData.assetData = saveData.assetData || {}
          saveData.assetData.parameters = saveData.assetData.parameters || {}
          saveData.assetData.parameters.specs = saveData.assetData.parameters.specs || {}
          saveData.assetData.parameters.specs.details = saveData.assetData.parameters.specs.details || {}
          saveData.assetData.parameters.specs.details.plc_name = formData.plcName
          saveData.assetData.parameters.specs.details.plc_ip_address = formData.plcIpAddress
          saveData.assetData.parameters.specs.details.plc_mac_address = formData.plcMacAddress
          saveData.assetData.parameters.specs.details.server_connection_attribute = formData.serverConnectionAttribute
          saveData.assetData.parameters.specs.details.all_plc_data_streamed_into_server = formData.allPlcDataStreamed
            ? "yes"
            : "no"
        } else {
          // If no existing structure, create one
          saveData.parameters = saveData.parameters || {}
          saveData.parameters.specs = saveData.parameters.specs || {}
          saveData.parameters.specs.details = saveData.parameters.specs.details || {}
          saveData.parameters.specs.details.plc_name = formData.plcName
          saveData.parameters.specs.details.plc_ip_address = formData.plcIpAddress
          saveData.parameters.specs.details.plc_mac_address = formData.plcMacAddress
          saveData.parameters.specs.details.server_connection_attribute = formData.serverConnectionAttribute
          saveData.parameters.specs.details.all_plc_data_streamed_into_server = formData.allPlcDataStreamed
            ? "yes"
            : "no"
        }
      }

      console.log("Saving node data:", saveData)

      // Make the API call to save the data
      const nodeId = node.id
      const response = await fetch(`/api/factory-node/${nodeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saveData),
      })

      let responseData
      try {
        responseData = await response.json()
      } catch (parseError) {
        const errorText = await response.text()
        console.error("Failed to parse response as JSON:", errorText)
        throw new Error(`API error: ${response.status} - Unable to parse response`)
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${JSON.stringify(responseData)}`)
      }

      console.log("Save successful:", responseData)

      toast({
        title: "Success",
        description: "Node details updated successfully",
      })

      // Exit edit mode
      setIsEditing(false)

      // Refresh the data
      onRefresh()
    } catch (error) {
      console.error("Error saving node details:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save node details",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!node || !node.id) {
      toast({
        title: "Error",
        description: "Node ID is missing",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
      // Make the API call to delete the node
      const nodeId = node.id
      const response = await fetch(`/api/factory-node/${nodeId}/delete`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const result = await response.json()
      console.log("Delete successful:", result)

      toast({
        title: "Success",
        description: "Node deleted successfully",
      })

      // Close the details panel and refresh the data
      onClose()
      onRefresh()
    } catch (error) {
      console.error("Error deleting node:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete node",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // Determine which action buttons to show based on node type
  const getActionButtons = () => {
    switch (nodeType) {
      case "facility":
        return [
          {
            label: "Add Area",
            action: () => {
              setAddNodeType("area")
              setAddModalOpen(true)
            },
          },
        ]
      case "area":
        return [
          {
            label: "Add Mini Factory",
            action: () => {
              setAddNodeType("mini_factory")
              setAddModalOpen(true)
            },
          },
          {
            label: "Add Area",
            action: () => {
              setAddNodeType("area")
              setAddModalOpen(true)
            },
          },
        ]
      case "mini_factory":
        return [
          {
            label: "Add Line",
            action: () => {
              setAddNodeType("line")
              setAddModalOpen(true)
            },
          },
          {
            label: "Add Mini Factory",
            action: () => {
              setAddNodeType("mini_factory")
              setAddModalOpen(true)
            },
          },
        ]
      case "line":
        return [
          {
            label: "Add Workstation",
            action: () => {
              setAddNodeType("workstation")
              setAddModalOpen(true)
            },
          },
          {
            label: "Add Line",
            action: () => {
              setAddNodeType("line")
              setAddModalOpen(true)
            },
          },
        ]
      case "workstation":
        return [
          {
            label: "Add Workstation",
            action: () => {
              setAddNodeType("workstation")
              setAddModalOpen(true)
            },
          },
        ]
      default:
        return []
    }
  }

  const actionButtons = getActionButtons()
  const Icon = nodeType ? nodeIcons[nodeType] : null
  const nodeColor = nodeType ? nodeIcons[nodeType] : null

  // Section component for collapsible content
  const Section = ({
    title,
    open,
    onToggle,
    children,
  }: {
    title: string
    open: boolean
    onToggle: () => void
    children: React.ReactNode
  }) => (
    <Collapsible open={open} onOpenChange={onToggle} className="w-full mb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-medium">{title}</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="pt-2">{children}</CollapsibleContent>
    </Collapsible>
  )

  return (
    <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between py-2 px-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`h-5 w-5 ${nodeColor.text}`} />}
          <h3 className="text-lg font-semibold text-foreground">{node.label || node.name || "Node Details"}</h3>
        </div>
      </div>

      {/* Main content with tabs */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col" defaultValue="details">
          <div className="border-b px-4">
            <TabsList className="h-9">
              <TabsTrigger value="details">Details</TabsTrigger>
              {isWorkstation && <TabsTrigger value="parameters">Parameters</TabsTrigger>}
            </TabsList>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-hidden flex flex-col relative">
            <TabsContent value="details" className="flex-1 flex flex-col p-0 m-0 overflow-hidden bg-background">
              <ScrollArea className="flex-1 h-full">
                <div className="p-4">
                  {/* Basic Information Section */}
                  <Section
                    title="Basic Information"
                    open={sectionsState.basicInfo}
                    onToggle={() => toggleSection("basicInfo")}
                  >
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder={`${nodeType} description`}
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-muted cursor-not-allowed" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="code">Code</Label>
                          <Input
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            placeholder={`${nodeType} code`}
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-muted cursor-not-allowed" : ""}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <RadioGroup
                          value={formData.status}
                          onValueChange={isEditing ? handleStatusChange : undefined}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="active"
                              id="active"
                              disabled={!isEditing}
                              className={!isEditing ? "cursor-not-allowed" : ""}
                            />
                            <Label htmlFor="active" className={!isEditing ? "cursor-not-allowed" : ""}>
                              Active
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="inactive"
                              id="inactive"
                              disabled={!isEditing}
                              className={!isEditing ? "cursor-not-allowed" : ""}
                            />
                            <Label htmlFor="inactive" className={!isEditing ? "cursor-not-allowed" : ""}>
                              Inactive
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </Section>

                  <Separator className="my-2" />

                  {/* Location Information (for facility) */}
                  {nodeType === "facility" && (
                    <>
                      <Section
                        title="Location Information"
                        open={sectionsState.locationInfo}
                        onToggle={() => toggleSection("locationInfo")}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder="Enter city"
                              readOnly={!isEditing}
                              className={!isEditing ? "bg-muted cursor-not-allowed" : ""}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              placeholder="Enter country"
                              readOnly={!isEditing}
                              className={!isEditing ? "bg-muted cursor-not-allowed" : ""}
                            />
                          </div>
                        </div>
                      </Section>
                      <Separator className="my-2" />
                    </>
                  )}

                  {/* Workstation-specific sections */}
                  {isWorkstation && (
                    <>
                      {/* PLC Information */}
                      <Section
                        title="PLC Information"
                        open={sectionsState.plcInfo}
                        onToggle={() => toggleSection("plcInfo")}
                      >
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="plcName">PLC Name</Label>
                              <Input
                                id="plcName"
                                name="plcName"
                                value={formData.plcName}
                                onChange={handleInputChange}
                                placeholder="Enter PLC name"
                                readOnly={!isEditing}
                                className={!isEditing ? "bg-muted cursor-not-allowed" : ""}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="plcIpAddress">PLC IP Address</Label>
                              <Input
                                id="plcIpAddress"
                                name="plcIpAddress"
                                value={formData.plcIpAddress}
                                onChange={handleInputChange}
                                placeholder="Enter IP address"
                                readOnly={!isEditing}
                                className={!isEditing ? "bg-muted cursor-not-allowed" : ""}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="plcMacAddress">PLC MAC Address</Label>
                              <Input
                                id="plcMacAddress"
                                name="plcMacAddress"
                                value={formData.plcMacAddress}
                                onChange={handleInputChange}
                                placeholder="Enter MAC address"
                                readOnly={!isEditing}
                                className={!isEditing ? "bg-muted cursor-not-allowed" : ""}
                              />
                            </div>
                          </div>
                        </div>
                      </Section>

                      <Separator className="my-2" />

                      {/* Connection Information */}
                      <Section
                        title="Connection Information"
                        open={sectionsState.connectionInfo}
                        onToggle={() => toggleSection("connectionInfo")}
                      >
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="serverConnectionAttribute">Server Connection Attribute</Label>
                            <Input
                              id="serverConnectionAttribute"
                              name="serverConnectionAttribute"
                              value={formData.serverConnectionAttribute}
                              onChange={handleInputChange}
                              placeholder="Enter connection attribute"
                              readOnly={!isEditing}
                              className={!isEditing ? "bg-muted cursor-not-allowed" : ""}
                            />
                          </div>

                          <div className="flex items-center space-x-2 py-2">
                            <input
                              type="checkbox"
                              id="allPlcDataStreamed"
                              name="allPlcDataStreamed"
                              checked={formData.allPlcDataStreamed}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={!isEditing ? "cursor-not-allowed" : ""}
                            />
                            <Label htmlFor="allPlcDataStreamed" className={!isEditing ? "cursor-not-allowed" : ""}>
                              All PLC data streamed into server?
                            </Label>
                          </div>
                        </div>
                      </Section>
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Parameters Tab for Workstations */}
            {isWorkstation && (
              <TabsContent value="parameters" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
                <ScrollArea className="flex-1 h-full">
                  <div className="p-4">
                    <div className="bg-muted/30 rounded-lg p-6 h-full flex flex-col">
                      <h3 className="text-lg font-medium mb-4">Workstation Parameters</h3>
                      <div className="flex-1 flex flex-col items-center justify-center gap-6">
                        <div className="text-center max-w-md">
                          <Database className="h-12 w-12 mx-auto mb-4 text-primary opacity-80" />
                          <p className="text-muted-foreground mb-2">
                            Configure data attributes and parameters for this workstation to monitor and control its
                            operation.
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Map data attributes to define limits, thresholds, and operational parameters for this
                            workstation.
                          </p>
                        </div>
                        <Button
                          onClick={handleOpenMapData}
                          className="px-6 py-6 bg-primary hover:bg-primary/90 flex items-center gap-2"
                          size="lg"
                        >
                          <Database className="h-5 w-5" />
                          Map Data Attributes
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>

      {/* Fixed action buttons at the bottom with shadow to distinguish from content */}
      <div className="p-4 border-t bg-background shadow-[0_-2px_5px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_5px_rgba(0,0,0,0.2)] z-10">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
            ) : (
              <>
                {actionButtons.map((button, index) => (
                  <Button key={index} variant="outline" size="sm" onClick={button.action}>
                    <Plus className="mr-1 h-3 w-3" />
                    {button.label.replace("Add ", "")}
                  </Button>
                ))}
                {/* Add delete button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </>
            )}
          </div>

          <div className="mt-2 sm:mt-0">
            {isEditing ? (
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Add Node Modal */}
      {addModalOpen && (
        <AddNodeModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          nodeType={addNodeType}
          parentId={node.id}
          onNodeAdded={() => {
            // Close the modal and refresh the data
            setAddModalOpen(false)
            onRefresh()
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Node"
        description={`Are you sure you want to delete "${node.label || node.name}"? This action cannot be undone and will remove all child nodes.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="destructive"
      />

      {/* Map Data Attributes Modal */}
      {isMapDataOpen && node && (
        <MapDataAttributes
          nodeId={node.id}
          nodeName={node.label || node.name || ""}
          onClose={() => {
            setIsMapDataOpen(false)
            if (onMapDataOpen) {
              onMapDataOpen(false)
            }
          }}
        />
      )}
    </div>
  )
}

