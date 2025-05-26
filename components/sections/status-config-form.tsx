"use client"

import type React from "react"
import { useState } from "react"
import type { Workflow } from "@/types/workflow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, Edit, Check } from "lucide-react"
import TooltipHelper from "../ui/tooltip-helper"
import { ChromePicker } from "react-color"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface StatusConfigFormProps {
  workflow: Workflow
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>
}

// Helper function to determine if a color is dark
const isColorDark = (hex: string): boolean => {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, "")

  // Parse r, g, b values
  const r = Number.parseInt(hex.substring(0, 2), 16)
  const g = Number.parseInt(hex.substring(2, 4), 16)
  const b = Number.parseInt(hex.substring(4, 6), 16)

  // Calculate luminance (perceived brightness)
  // Formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // If luminance is greater than 0.5, color is light; otherwise, it's dark
  return luminance < 0.5
}

// Function to lighten a color
const lightenColor = (hex: string, factor: number): string => {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, "")

  // Parse r, g, b values
  let r = Number.parseInt(hex.substring(0, 2), 16)
  let g = Number.parseInt(hex.substring(2, 4), 16)
  let b = Number.parseInt(hex.substring(4, 6), 16)

  // Lighten the color
  r = Math.min(255, Math.round(r + (255 - r) * factor))
  g = Math.min(255, Math.round(g + (255 - g) * factor))
  b = Math.min(255, Math.round(b + (255 - b) * factor))

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

const StatusConfigForm: React.FC<StatusConfigFormProps> = ({ workflow, setWorkflow }) => {
  const [newStatusName, setNewStatusName] = useState<string>("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const [bgColor, setBgColor] = useState<string>("#0088cc")
  const [isInitial, setIsInitial] = useState<boolean>(false)
  const [isFinal, setIsFinal] = useState<boolean>(false)
  const [highPriorityFields, setHighPriorityFields] = useState<string[]>([])
  const [newHighPriorityField, setNewHighPriorityField] = useState<string>("")

  // Add a new status
  const addStatus = () => {
    if (!newStatusName.trim()) {
      alert("Status name is required!")
      return
    }

    // For status, ID and name should be the same
    const statusId = newStatusName

    // Check if status already exists
    if (workflow.statusFlow.statuses.some((s) => s.id === statusId)) {
      alert("A status with this name already exists!")
      return
    }

    // Determine text color based on background color
    const textColor = isColorDark(bgColor) ? "#ffffff" : "#000000"

    // statusTextColor is the same as backgroundColor
    const statusTextColor = bgColor

    // statusBackgroundColor is a light version of backgroundColor
    const statusBgColor = lightenColor(bgColor, 0.8)

    const newStatus = {
      id: statusId,
      name: newStatusName,
      isInitial: isInitial,
      isFinal: isFinal,
      backgroundColor: bgColor,
      textColor: textColor,
      statusTextColor: statusTextColor,
      statusBackgroundColor: statusBgColor,
      highPriorityFields: highPriorityFields.length > 0 ? [...highPriorityFields] : undefined,
    }

    setWorkflow((prev) => ({
      ...prev,
      statusFlow: {
        ...prev.statusFlow,
        statuses: [...prev.statusFlow.statuses, newStatus],
      },
    }))

    // Reset form
    setNewStatusName("")
    setBgColor("#0088cc")
    setIsInitial(false)
    setIsFinal(false)
    setHighPriorityFields([])
  }

  // Remove a status
  const removeStatus = (statusId: string) => {
    // Check if status is initial or final
    const status = workflow.statusFlow.statuses.find((s) => s.id === statusId)
    if (status?.isInitial || status?.isFinal) {
      alert("Cannot delete initial or final status!")
      return
    }

    const updatedStatuses = workflow.statusFlow.statuses.filter((s) => s.id !== statusId)

    // Also remove any transitions that use this status
    const updatedTransitions = workflow.statusFlow.transitions
      ? workflow.statusFlow.transitions.filter((t) => t.sourceState !== statusId && !t.targetStates.includes(statusId))
      : []

    setWorkflow((prev) => ({
      ...prev,
      statusFlow: {
        ...prev.statusFlow,
        statuses: updatedStatuses,
        transitions: updatedTransitions,
      },
    }))
  }

  // Start editing a status
  const startEditing = (index: number) => {
    const status = workflow.statusFlow.statuses[index]
    setEditingIndex(index)
    setEditValue(status.name)
    setBgColor(status.backgroundColor || "#0088cc")
    setIsInitial(status.isInitial || false)
    setIsFinal(status.isFinal || false)
    setHighPriorityFields(status.highPriorityFields || [])
  }

  // Save edited status
  const saveEditing = () => {
    if (editingIndex === null) return

    const updatedStatuses = [...workflow.statusFlow.statuses]
    const statusId = editValue
    const statusName = editValue

    // Determine text color based on background color
    const textColor = isColorDark(bgColor) ? "#ffffff" : "#000000"

    // statusTextColor is the same as backgroundColor
    const statusTextColor = bgColor

    // statusBackgroundColor is a light version of backgroundColor
    const statusBgColor = lightenColor(bgColor, 0.8)

    updatedStatuses[editingIndex] = {
      ...updatedStatuses[editingIndex],
      id: statusId,
      name: statusName,
      isInitial: isInitial,
      isFinal: isFinal,
      backgroundColor: bgColor,
      textColor: textColor,
      statusTextColor: statusTextColor,
      statusBackgroundColor: statusBgColor,
      highPriorityFields: highPriorityFields.length > 0 ? [...highPriorityFields] : undefined,
    }

    // Also update any transitions that use this status
    let updatedTransitions = workflow.statusFlow.transitions || []

    // If the ID has changed, update transitions
    if (statusId !== workflow.statusFlow.statuses[editingIndex].id) {
      const oldStatusId = workflow.statusFlow.statuses[editingIndex].id

      // Update source states
      updatedTransitions = updatedTransitions.map((t) => {
        if (t.sourceState === oldStatusId) {
          return { ...t, sourceState: statusId }
        }
        return t
      })

      // Update target states
      updatedTransitions = updatedTransitions.map((t) => {
        if (t.targetStates.includes(oldStatusId)) {
          return {
            ...t,
            targetStates: t.targetStates.map((target) => (target === oldStatusId ? statusId : target)),
          }
        }
        return t
      })
    }

    setWorkflow((prev) => ({
      ...prev,
      statusFlow: {
        ...prev.statusFlow,
        statuses: updatedStatuses,
        transitions: updatedTransitions,
      },
    }))

    setEditingIndex(null)
    setEditValue("")
    setBgColor("#0088cc")
    setIsInitial(false)
    setIsFinal(false)
    setHighPriorityFields([])
  }

  // Add a high priority field
  const addHighPriorityField = () => {
    if (!newHighPriorityField) return
    if (highPriorityFields.includes(newHighPriorityField)) return
    setHighPriorityFields([...highPriorityFields, newHighPriorityField])
    setNewHighPriorityField("")
  }

  // Remove a high priority field
  const removeHighPriorityField = (fieldId: string) => {
    setHighPriorityFields(highPriorityFields.filter((f) => f !== fieldId))
  }

  // Get all custom field IDs for the dropdown
  const customFieldIds = Object.keys(workflow.customFields || {})

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Status Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label>Add New Status</Label>
              <TooltipHelper content="Configure a new status for your workflow." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newStatusName">Status Name</Label>
                <Input
                  id="newStatusName"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  placeholder="e.g., In Progress"
                />
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <div className="w-4 h-4 mr-2 rounded" style={{ backgroundColor: bgColor }} />
                      {bgColor}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <ChromePicker color={bgColor} onChange={(color) => setBgColor(color.hex)} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="isInitial" checked={isInitial} onCheckedChange={(checked) => setIsInitial(!!checked)} />
                <Label htmlFor="isInitial">Initial Status</Label>
                <TooltipHelper content="If checked, this will be the starting status for new tickets." />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isFinal" checked={isFinal} onCheckedChange={(checked) => setIsFinal(!!checked)} />
                <Label htmlFor="isFinal">Final Status</Label>
                <TooltipHelper content="If checked, this will be a final status that completes the workflow." />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center">
                <Label>High Priority Fields</Label>
                <TooltipHelper content="Fields that should be highlighted when the ticket is in this status." />
              </div>
              <div className="flex space-x-2">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newHighPriorityField}
                  onChange={(e) => setNewHighPriorityField(e.target.value)}
                >
                  <option value="">Select a field</option>
                  {customFieldIds.map((fieldId) => (
                    <option key={fieldId} value={fieldId}>
                      {workflow.customFields[fieldId].name}
                    </option>
                  ))}
                </select>
                <Button onClick={addHighPriorityField}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {highPriorityFields.length > 0 && (
                <div className="mt-2">
                  <Label className="text-sm">Current High Priority Fields:</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {highPriorityFields.map((fieldId) => (
                      <div key={fieldId} className="flex items-center space-x-1 bg-muted px-2 py-1 rounded-md text-sm">
                        <span>{workflow.customFields[fieldId]?.name || fieldId}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => removeHighPriorityField(fieldId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-2 mt-4">
              <div className="flex-1 p-2 border rounded">
                <div className="text-xs text-muted-foreground mb-1">Preview:</div>
                <div className="flex items-center space-x-2">
                  <div
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      backgroundColor: bgColor,
                      color: isColorDark(bgColor) ? "#ffffff" : "#000000",
                    }}
                  >
                    {newStatusName || "Status"}
                  </div>
                  <div
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      backgroundColor: lightenColor(bgColor, 0.8),
                      color: bgColor,
                    }}
                  >
                    {newStatusName || "Status"}
                  </div>
                </div>
              </div>
              <Button onClick={addStatus} className="self-end">
                <Plus className="h-4 w-4 mr-2" />
                Add Status
              </Button>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <Label>Status List</Label>
            <div className="border rounded-md overflow-hidden">
              {workflow.statusFlow.statuses.length > 0 ? (
                <ul className="divide-y">
                  {workflow.statusFlow.statuses.map((status, index) => (
                    <li key={index} className="p-3">
                      {editingIndex === index ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`editStatusName-${index}`}>Status Name</Label>
                              <Input
                                id={`editStatusName-${index}`}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Background Color</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start">
                                    <div className="w-4 h-4 mr-2 rounded" style={{ backgroundColor: bgColor }} />
                                    {bgColor}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <ChromePicker color={bgColor} onChange={(color) => setBgColor(color.hex)} />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`isInitial-${index}`}
                                checked={isInitial}
                                onCheckedChange={(checked) => setIsInitial(!!checked)}
                              />
                              <Label htmlFor={`isInitial-${index}`}>Initial Status</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`isFinal-${index}`}
                                checked={isFinal}
                                onCheckedChange={(checked) => setIsFinal(!!checked)}
                              />
                              <Label htmlFor={`isFinal-${index}`}>Final Status</Label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Label>High Priority Fields</Label>
                              <TooltipHelper content="Fields that should be highlighted when the ticket is in this status." />
                            </div>
                            <div className="flex space-x-2">
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={newHighPriorityField}
                                onChange={(e) => setNewHighPriorityField(e.target.value)}
                              >
                                <option value="">Select a field</option>
                                {customFieldIds.map((fieldId) => (
                                  <option key={fieldId} value={fieldId}>
                                    {workflow.customFields[fieldId].name}
                                  </option>
                                ))}
                              </select>
                              <Button onClick={addHighPriorityField}>
                                <Plus className="h-4 w-4" />
                                Add
                              </Button>
                            </div>

                            {highPriorityFields.length > 0 && (
                              <div className="mt-2">
                                <Label className="text-sm">Current High Priority Fields:</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {highPriorityFields.map((fieldId) => (
                                    <div
                                      key={fieldId}
                                      className="flex items-center space-x-1 bg-muted px-2 py-1 rounded-md text-sm"
                                    >
                                      <span>{workflow.customFields[fieldId]?.name || fieldId}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0"
                                        onClick={() => removeHighPriorityField(fieldId)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="p-2 border rounded">
                            <div className="text-xs text-muted-foreground mb-1">Preview:</div>
                            <div className="flex items-center space-x-2">
                              <div
                                className="px-2 py-1 rounded text-xs"
                                style={{
                                  backgroundColor: bgColor,
                                  color: isColorDark(bgColor) ? "#ffffff" : "#000000",
                                }}
                              >
                                {editValue || "Status"}
                              </div>
                              <div
                                className="px-2 py-1 rounded text-xs"
                                style={{
                                  backgroundColor: lightenColor(bgColor, 0.8),
                                  color: bgColor,
                                }}
                              >
                                {editValue || "Status"}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button onClick={() => setEditingIndex(null)} variant="outline">
                              Cancel
                            </Button>
                            <Button onClick={saveEditing}>
                              <Check className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{
                                  backgroundColor: status.backgroundColor || "#e6e6e6",
                                  border: "1px solid #ccc",
                                }}
                                title="Background Color"
                              />
                              <span className="font-medium">{status.name}</span>
                              <div className="flex space-x-1">
                                {status.isInitial && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Initial</span>
                                )}
                                {status.isFinal && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Final</span>
                                )}
                                {status.highPriorityFields && status.highPriorityFields.length > 0 && (
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                    {status.highPriorityFields.length} high priority fields
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" onClick={() => startEditing(index)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => removeStatus(status.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Preview of how the status will look */}
                          <div className="mt-2 flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">Preview:</span>
                            <div className="flex space-x-2">
                              <div
                                className="px-2 py-1 rounded text-xs"
                                style={{
                                  backgroundColor: status.backgroundColor || "#e6e6e6",
                                  color: status.textColor || "#000000",
                                }}
                              >
                                {status.name}
                              </div>
                              <div
                                className="px-2 py-1 rounded text-xs"
                                style={{
                                  backgroundColor: status.statusBackgroundColor || "#f5f5f5",
                                  color: status.statusTextColor || "#666666",
                                }}
                              >
                                {status.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-3 text-muted-foreground text-sm">No status values configured.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StatusConfigForm
