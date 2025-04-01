"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Minus } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Parameter {
  id: string
  parameter: string
  model_no: string
  limits: {
    CPP?: string
    CTQ?: string
    param_type?: string
    UoM?: string
    LCL?: number
    "Low-LCL"?: number
    HCL?: number
    "High-HCL"?: number
  }
}

interface MapDataAttributesProps {
  nodeId: string
  nodeName: string
  onClose: () => void
}

export function MapDataAttributes({ nodeId, nodeName, onClose }: MapDataAttributesProps) {
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [wsMapFile, setWsMapFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")

  useEffect(() => {
    // Initialize with one empty parameter if none exist
    if (parameters.length === 0) {
      handleInsert(0)
    }

    // In a real implementation, you would fetch existing parameters here
    const fetchParameters = async () => {
      try {
        // Sample data for demonstration
        const sampleData = [
          { id: uuidv4(), parameter: "Axial_play_for_ESA", model_no: "7.07155.07.9", limits: {} },
          { id: uuidv4(), parameter: "Axial_play_for_ESG", model_no: "7.07155.07.9", limits: {} },
          { id: uuidv4(), parameter: "Flap_Screw1_Angle", model_no: "7.07155.07.9", limits: {} },
          { id: uuidv4(), parameter: "Flap_screw1_tightening_torque", model_no: "7.07155.07.9", limits: {} },
          { id: uuidv4(), parameter: "Flap_Screw1_Torque", model_no: "7.07155.07.9", limits: {} },
          { id: uuidv4(), parameter: "Flap_Screw2_Angle", model_no: "7.07155.07.9", limits: {} },
          { id: uuidv4(), parameter: "Flap_Screw2_Result", model_no: "7.07155.07.9", limits: {} },
          { id: uuidv4(), parameter: "Flap_screw2_tightening_torque", model_no: "7.07155.07.9", limits: {} },
          {
            id: uuidv4(),
            parameter: "Gap_Adjust_Result",
            model_no: "7.07155.07.9",
            limits: { "Low-LCL": 0.140000001 },
          },
        ]

        setParameters(sampleData)
      } catch (error) {
        console.error("Error fetching parameters:", error)
      }
    }

    fetchParameters()
  }, [nodeId])

  const handleInsert = (position: number) => {
    const newParameter: Parameter = {
      id: uuidv4(),
      parameter: "",
      model_no: "",
      limits: {},
    }

    const updatedParameters = [...parameters]
    updatedParameters.splice(position + 1, 0, newParameter)
    setParameters(updatedParameters)
  }

  const handleDelete = (position: number) => {
    if (parameters.length <= 1) {
      return // Don't delete the last parameter
    }

    const updatedParameters = [...parameters]
    updatedParameters.splice(position, 1)
    setParameters(updatedParameters)
  }

  const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const { name, value } = e.target

    setParameters((prevParameters) =>
      prevParameters.map((param) => {
        if (param.id === id) {
          if (name.startsWith("limits.")) {
            const limitKey = name.split(".")[1] as keyof typeof param.limits
            return {
              ...param,
              limits: {
                ...param.limits,
                [limitKey]: name.includes("LCL") || name.includes("HCL") ? Number.parseFloat(value) || value : value,
              },
            }
          } else {
            return { ...param, [name]: value }
          }
        }
        return param
      }),
    )
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setWsMapFile(file)
    }
  }

  const handleSave = async () => {
    console.log("Saving parameters:", parameters)
    onClose()
  }

  // Responsive table tabs for mobile view
  const renderTabs = () => {
    const tabs = [
      { id: "all", label: "All Fields" },
      { id: "basic", label: "Basic Info" },
      { id: "limits", label: "Limits" },
    ]

    return (
      <div className="flex overflow-x-auto space-x-2 p-2 md:hidden border-b dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 text-sm rounded-md whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    )
  }

  // Render different field sets based on active tab (for mobile)
  const renderMobileFields = (param: Parameter, index: number) => {
    if (activeTab === "basic" || activeTab === "all") {
      return (
        <div className="space-y-2 p-2 border-b dark:border-gray-700">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Row</span>
            <span className="text-sm">{index + 1}</span>
          </div>
          <div>
            <label className="text-sm font-medium block">Parameter Name</label>
            <input
              type="text"
              name="parameter"
              value={param.parameter}
              onChange={(e) => handleUpdate(e, param.id)}
              className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block">Model No</label>
            <input
              type="text"
              name="model_no"
              value={param.model_no}
              onChange={(e) => handleUpdate(e, param.id)}
              className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block">CPP</label>
            <input
              type="text"
              name="limits.CPP"
              value={param.limits.CPP || ""}
              onChange={(e) => handleUpdate(e, param.id)}
              className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block">CTQ</label>
            <input
              type="text"
              name="limits.CTQ"
              value={param.limits.CTQ || ""}
              onChange={(e) => handleUpdate(e, param.id)}
              className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block">Param Type</label>
            <input
              type="text"
              name="limits.param_type"
              value={param.limits.param_type || ""}
              onChange={(e) => handleUpdate(e, param.id)}
              className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block">UoM</label>
            <input
              type="text"
              name="limits.UoM"
              value={param.limits.UoM || ""}
              onChange={(e) => handleUpdate(e, param.id)}
              className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
            />
          </div>
        </div>
      )
    }

    if (activeTab === "limits") {
      return (
        <div className="space-y-2 p-2 border-b dark:border-gray-700">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Parameter</span>
            <span className="text-sm truncate max-w-[200px]">{param.parameter || `Row ${index + 1}`}</span>
          </div>
          <div>
            <label className="text-sm font-medium block">LCL</label>
            <input
              type="number"
              name="limits.LCL"
              value={param.limits.LCL || ""}
              onChange={(e) => handleUpdate(e, param.id)}
              className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block">Low-LCL</label>
            <input
              type="number"
              name="limits.Low-LCL"
              value={param.limits["Low-LCL"] || ""}
              onChange={(e) => handleUpdate(e, param.id)}
              className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block">HCL</label>
            <input
              type="number"
              name="limits.HCL"
              value={param.limits.HCL || ""}
              onChange={(e) => handleUpdate(e, param.id)}
              className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block">High-HCL</label>
            <input
              type="number"
              name="limits.High-HCL"
              value={param.limits["High-HCL"] || ""}
              onChange={(e) => handleUpdate(e, param.id)}
              className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              className="w-8 h-8 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center transition-colors"
              type="button"
              onClick={() => handleInsert(index)}
              title="Add parameter"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              className="w-8 h-8 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-300 rounded-full flex items-center justify-center transition-colors"
              type="button"
              onClick={() => handleDelete(index)}
              title="Remove parameter"
            >
              <Minus className="h-5 w-5" />
            </button>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center overflow-hidden p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-7xl max-h-[95vh] flex flex-col relative z-[2001]">
        {/* Header with back button and title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b dark:border-gray-700">
          <button
            onClick={onClose}
            className="self-start px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back</span>
          </button>
          <h2 className="font-semibold text-lg mt-2 sm:mt-0">Parameters for {nodeName}</h2>
        </div>

        {/* Mobile tabs */}
        {renderTabs()}

        {/* Table container */}
        <div className="flex-1 overflow-hidden">
          {/* Desktop view - Table */}
          <div className="hidden md:block h-full">
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="min-w-max p-4">
                <table className="w-full bg-white dark:bg-gray-800 rounded-md border dark:border-gray-700">
                  <thead className="sticky top-0 z-30">
                    <tr className="w-full bg-[#092E3D] text-white rounded-t-md">
                      <th className="px-3 py-2 text-sm text-center font-semibold border rounded-tl-md">Sl.</th>
                      <th className="px-3 py-2 text-sm text-center font-semibold border">Stratera Screen Name</th>
                      <th className="px-3 py-2 text-sm text-center font-semibold border">Model No</th>
                      <th className="px-3 py-2 text-sm text-center font-semibold border">CPP</th>
                      <th className="px-3 py-2 text-sm text-center font-semibold border">CTQ</th>
                      <th className="px-3 py-2 text-sm text-center font-semibold border">Parm Type</th>
                      <th className="px-3 py-2 text-sm text-center font-semibold border">UoM</th>
                      <th className="px-3 py-2 text-sm text-center font-semibold border">LCL</th>
                      <th className="px-3 py-2 text-sm text-center font-semibold border">Low-LCL</th>
                      <th className="px-3 py-2 text-sm text-center font-semibold border">HCL</th>
                      <th className="px-3 py-2 text-sm text-center font-semibold border">High-HCL</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold sticky-action-column-header bg-[#092E3D] rounded-tr-md">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parameters.map((param, index) => (
                      <tr
                        key={param.id}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                      >
                        <td className="px-3 py-2 text-sm text-center border dark:border-gray-700">{index + 1}</td>
                        <td className="px-3 py-2 text-sm border dark:border-gray-700">
                          <input
                            type="text"
                            name="parameter"
                            value={param.parameter}
                            onChange={(e) => handleUpdate(e, param.id)}
                            className="w-full bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 p-1 rounded"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm border dark:border-gray-700">
                          <input
                            type="text"
                            name="model_no"
                            value={param.model_no}
                            onChange={(e) => handleUpdate(e, param.id)}
                            className="w-full bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 p-1 rounded"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm border dark:border-gray-700">
                          <input
                            type="text"
                            name="limits.CPP"
                            value={param.limits.CPP || ""}
                            onChange={(e) => handleUpdate(e, param.id)}
                            className="w-full bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 p-1 rounded"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm border dark:border-gray-700">
                          <input
                            type="text"
                            name="limits.CTQ"
                            value={param.limits.CTQ || ""}
                            onChange={(e) => handleUpdate(e, param.id)}
                            className="w-full bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 p-1 rounded"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm border dark:border-gray-700">
                          <input
                            type="text"
                            name="limits.param_type"
                            value={param.limits.param_type || ""}
                            onChange={(e) => handleUpdate(e, param.id)}
                            className="w-full bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 p-1 rounded"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm border dark:border-gray-700">
                          <input
                            type="text"
                            name="limits.UoM"
                            value={param.limits.UoM || ""}
                            onChange={(e) => handleUpdate(e, param.id)}
                            className="w-full bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 p-1 rounded"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm border dark:border-gray-700">
                          <input
                            type="number"
                            name="limits.LCL"
                            value={param.limits.LCL || ""}
                            onChange={(e) => handleUpdate(e, param.id)}
                            className="w-full bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 p-1 rounded"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm border dark:border-gray-700">
                          <input
                            type="number"
                            name="limits.Low-LCL"
                            value={param.limits["Low-LCL"] || ""}
                            onChange={(e) => handleUpdate(e, param.id)}
                            className="w-full bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 p-1 rounded"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm border dark:border-gray-700">
                          <input
                            type="number"
                            name="limits.HCL"
                            value={param.limits.HCL || ""}
                            onChange={(e) => handleUpdate(e, param.id)}
                            className="w-full bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 p-1 rounded"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm border dark:border-gray-700">
                          <input
                            type="number"
                            name="limits.High-HCL"
                            value={param.limits["High-HCL"] || ""}
                            onChange={(e) => handleUpdate(e, param.id)}
                            className="w-full bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 p-1 rounded"
                          />
                        </td>
                        <td className="sticky-action-column flex items-center justify-center px-3 py-2 text-center bg-white dark:bg-gray-800">
                          <button
                            className="w-8 h-8 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center transition-colors"
                            type="button"
                            onClick={() => handleInsert(index)}
                            title="Add parameter"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                          <button
                            className="w-8 h-8 ml-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-300 rounded-full flex items-center justify-center transition-colors"
                            type="button"
                            onClick={() => handleDelete(index)}
                            title="Remove parameter"
                          >
                            <Minus className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </div>

          {/* Mobile view - Card layout */}
          <div className="md:hidden">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="p-2">{parameters.map((param, index) => renderMobileFields(param, index))}</div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 space-y-3 sm:space-y-0 border-t dark:border-gray-700">
          <div className="w-full sm:w-auto flex items-center">
            {wsMapFile?.name && <span className="text-sm truncate max-w-[200px] mr-2">{wsMapFile.name}</span>}
            <label
              htmlFor="fileInput"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md cursor-pointer inline-block transition-colors shadow-sm"
            >
              Upload
            </label>
            <input type="file" id="fileInput" className="hidden" onChange={handleFileSelect} />
          </div>

          <div className="w-full sm:w-auto flex justify-end">
            <button
              className="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors shadow-sm"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

