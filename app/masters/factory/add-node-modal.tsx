"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateUUID } from "@/lib/utils/uuid"

interface AddNodeModalProps {
  isOpen: boolean
  onClose: () => void
  nodeType: "area" | "line" | "workstation" | "mini_factory"
  parentId: string
  onNodeAdded: () => void
}

export function AddNodeModal({ isOpen, onClose, nodeType, parentId, onNodeAdded }: AddNodeModalProps) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    status: "active",
    // Facility specific
    city: "",
    country: "",
    // Workstation specific
    plcName: "",
    plcIpAddress: "",
    plcMacAddress: "",
    serverConnectionAttribute: "",
    allPlcDataStreamed: true,
    // Shift data (for workstations)
    shift1StartTime: "00:00:00",
    shift1EndTime: "07:59:59",
    shift1Target: "500",
    shift2StartTime: "08:00:00",
    shift2EndTime: "15:59:59",
    shift2Target: "500",
    shift3StartTime: "16:00:00",
    shift3EndTime: "23:59:59",
    shift3Target: "500",
  })

  // Reset form when node type changes
  useEffect(() => {
    setFormData({
      name: "",
      description: "",
      code: "",
      status: "active",
      city: "",
      country: "",
      plcName: "",
      plcIpAddress: "",
      plcMacAddress: "",
      serverConnectionAttribute: "",
      allPlcDataStreamed: true,
      shift1StartTime: "00:00:00",
      shift1EndTime: "07:59:59",
      shift1Target: "500",
      shift2StartTime: "08:00:00",
      shift2EndTime: "15:59:59",
      shift2Target: "500",
      shift3StartTime: "16:00:00",
      shift3EndTime: "23:59:59",
      shift3Target: "500",
    })
  }, [nodeType, isOpen])

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

  const getNodeTypeTitle = () => {
    switch (nodeType) {
      case "area":
        return "Add Area"
      case "line":
        return "Add Line"
      case "workstation":
        return "Add Workstation"
      case "mini_factory":
        return "Add Mini Factory"
      default:
        return "Add Node"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Generate a new UUID for the asset_id
      const assetId = generateUUID()

      // Create the base node data
      const nodeData = {
        asset_id: assetId,
        name: formData.name,
        description: formData.description,
        code: formData.code,
        status: formData.status,
        type: nodeType,
        parent_id: parentId,
        created_by: "user123", // This would typically come from auth context
        created_timestamp: new Date().toISOString(),
        updated_by: "user123",
        updated_timestamp: new Date().toISOString(),
        approved_by: "admin",
        approved_timestamp: new Date().toISOString(),
        eff_date_from: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
        eff_date_to: "9999-12-31",
        parameters: {},
      }

      // Add node type specific data
      if (nodeType === "workstation") {
        // Add workstation specific data
        nodeData.parameters = {
          specs: {
            details: {
              plc_name: formData.plcName,
              plc_ip_address: formData.plcIpAddress,
              plc_mac_address: formData.plcMacAddress,
              server_connection_attribute: formData.serverConnectionAttribute,
              all_plc_data_streamed_into_server: formData.allPlcDataStreamed ? "yes" : "no",
            },
          },
          shift: {
            "Shift 1": {
              start_time: formData.shift1StartTime,
              end_time: formData.shift1EndTime,
              target: formData.shift1Target,
            },
            "Shift 2": {
              start_time: formData.shift2StartTime,
              end_time: formData.shift2EndTime,
              target: formData.shift2Target,
            },
            "Shift 3": {
              start_time: formData.shift3StartTime,
              end_time: formData.shift3EndTime,
              target: formData.shift3Target,
            },
          },
        }
      }

      console.log("Creating new node:", nodeData)

      // Make the API call to create the node
      const response = await fetch("/api/factory-node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nodeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const createdNode = await response.json()
      console.log("Node created successfully:", createdNode)

      toast({
        title: "Success",
        description: `${nodeType.replace("_", " ")} created successfully`,
      })

      // Close the modal and refresh the data
      onClose()
      onNodeAdded() // This will trigger the refresh
    } catch (error) {
      console.error("Error creating node:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create node",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getNodeTypeTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={`Enter ${nodeType.replace("_", " ")} name`}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder={`Enter ${nodeType.replace("_", " ")} code`}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={`Enter ${nodeType.replace("_", " ")} description`}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup value={formData.status} onValueChange={handleStatusChange} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="add-active" />
                  <Label htmlFor="add-active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="add-inactive" />
                  <Label htmlFor="add-inactive">Inactive</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Workstation specific fields */}
            {nodeType === "workstation" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plcName">PLC Name</Label>
                    <Input
                      id="plcName"
                      name="plcName"
                      value={formData.plcName}
                      onChange={handleInputChange}
                      placeholder="Enter PLC name"
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
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plcMacAddress">PLC MAC Address</Label>
                    <Input
                      id="plcMacAddress"
                      name="plcMacAddress"
                      value={formData.plcMacAddress}
                      onChange={handleInputChange}
                      placeholder="Enter MAC address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serverConnectionAttribute">Server Connection Attribute</Label>
                    <Input
                      id="serverConnectionAttribute"
                      name="serverConnectionAttribute"
                      value={formData.serverConnectionAttribute}
                      onChange={handleInputChange}
                      placeholder="Enter connection attribute"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allPlcDataStreamed"
                    name="allPlcDataStreamed"
                    checked={formData.allPlcDataStreamed}
                    onChange={handleInputChange}
                  />
                  <Label htmlFor="allPlcDataStreamed">All PLC data streamed into server?</Label>
                </div>

                {/* Shift information */}
                <div className="space-y-4 border p-4 rounded-md">
                  <h3 className="font-medium">Shift Information</h3>

                  {/* Shift 1 */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Shift 1</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="shift1StartTime">Start Time</Label>
                        <Input
                          id="shift1StartTime"
                          name="shift1StartTime"
                          type="time"
                          step="1"
                          value={formData.shift1StartTime}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shift1EndTime">End Time</Label>
                        <Input
                          id="shift1EndTime"
                          name="shift1EndTime"
                          type="time"
                          step="1"
                          value={formData.shift1EndTime}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shift1Target">Target</Label>
                        <Input
                          id="shift1Target"
                          name="shift1Target"
                          type="number"
                          value={formData.shift1Target}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shift 2 */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Shift 2</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="shift2StartTime">Start Time</Label>
                        <Input
                          id="shift2StartTime"
                          name="shift2StartTime"
                          type="time"
                          step="1"
                          value={formData.shift2StartTime}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shift2EndTime">End Time</Label>
                        <Input
                          id="shift2EndTime"
                          name="shift2EndTime"
                          type="time"
                          step="1"
                          value={formData.shift2EndTime}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shift2Target">Target</Label>
                        <Input
                          id="shift2Target"
                          name="shift2Target"
                          type="number"
                          value={formData.shift2Target}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shift 3 */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Shift 3</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="shift3StartTime">Start Time</Label>
                        <Input
                          id="shift3StartTime"
                          name="shift3StartTime"
                          type="time"
                          step="1"
                          value={formData.shift3StartTime}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shift3EndTime">End Time</Label>
                        <Input
                          id="shift3EndTime"
                          name="shift3EndTime"
                          type="time"
                          step="1"
                          value={formData.shift3EndTime}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shift3Target">Target</Label>
                        <Input
                          id="shift3Target"
                          name="shift3Target"
                          type="number"
                          value={formData.shift3Target}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

