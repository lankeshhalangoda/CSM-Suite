"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Workflow, EnumValue } from "@/types/workflow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, Edit, Check } from "lucide-react"
import TooltipHelper from "../ui/tooltip-helper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tree, TreeItem } from "@/components/ui/tree"

interface TypeConfigFormProps {
  workflow: Workflow
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>
}

// ORM channels that can be selected - replace the existing array
const ormChannels = [
  { id: "googleMap", name: "Google" },
  { id: "facebook", name: "Facebook" },
  { id: "yelp", name: "Yelp" },
  { id: "booking", name: "Booking.com" },
  { id: "tripadvisor", name: "Tripadvisor" },
  { id: "agoda", name: "Agoda" },
  { id: "expedia", name: "Expedia" },
  { id: "hotels", name: "Hotels.com" },
  { id: "amazon", name: "Amazon" },
  { id: "holidaycheck", name: "Holidaycheck" },
  { id: "gartner", name: "Gartner Peer Insights" },
  { id: "softwareadvice", name: "Software Advice" },
  { id: "g2", name: "G2" },
  { id: "zomato", name: "Zomato" },
  { id: "indeed", name: "Indeed" },
  { id: "glassdoor", name: "Glassdoor" },
  { id: "trustpilot", name: "Trustpilot" },
  { id: "sitejabber", name: "Sitejabber" },
  { id: "bbb", name: "BBB" },
  { id: "lendingtree", name: "LendingTree" },
]

// Default CCM type value
const ccmTypeValue = { id: "complaintManagementSurvey", name: "Complaint Management Survey" }

const TypeConfigForm: React.FC<TypeConfigFormProps> = ({ workflow, setWorkflow }) => {
  // Update the initial selectedOrmChannels state to have Google checked by default
  const [selectedOrmChannels, setSelectedOrmChannels] = useState<string[]>(
    workflow.type?.values?.filter((v) => ormChannels.some((c) => c.id === v.id)).map((v) => v.id) ||
      (workflow.workflowType === "orm" || workflow.workflowType === "combined" ? ["googleMap"] : []),
  )
  // Initialize default type values based on workflow type
  useEffect(() => {
    if (!workflow.type || !workflow.type.values || workflow.type.values.length === 0) {
      // Set default type values based on workflow type
      let defaultValues: EnumValue[] = []

      if (workflow.workflowType === "ccm") {
        defaultValues = [ccmTypeValue]
      } else if (workflow.workflowType === "orm") {
        defaultValues = ormChannels
      } else if (workflow.workflowType === "combined") {
        defaultValues = [ccmTypeValue, ...ormChannels]
      }

      setWorkflow((prev) => ({
        ...prev,
        type: {
          name: "Channel",
          type: "enum",
          readOnly: true,
          values: defaultValues,
        },
      }))
    }
  }, [workflow.workflowType, setWorkflow])

  // Update type values when workflow type changes
  useEffect(() => {
    if (workflow.type && workflow.type.values) {
      let updatedValues: EnumValue[] = []

      if (workflow.workflowType === "ccm") {
        // Keep only CCM type or add it if not present
        const hasCcmType = workflow.type.values.some((v) => v.id === ccmTypeValue.id)
        updatedValues = hasCcmType ? workflow.type.values.filter((v) => v.id === ccmTypeValue.id) : [ccmTypeValue]
      } else if (workflow.workflowType === "orm") {
        // Only include selected ORM channels
        const selectedChannels = ormChannels.filter((channel) => selectedOrmChannels.includes(channel.id))
        updatedValues = selectedChannels
      } else if (workflow.workflowType === "combined") {
        // Ensure both CCM and selected ORM channels are present
        const hasCcmType = workflow.type.values.some((v) => v.id === ccmTypeValue.id)
        const selectedChannels = ormChannels.filter((channel) => selectedOrmChannels.includes(channel.id))

        updatedValues = [
          ...(hasCcmType ? [workflow.type.values.find((v) => v.id === ccmTypeValue.id)!] : [ccmTypeValue]),
          ...selectedChannels,
        ]
      }

      if (JSON.stringify(updatedValues) !== JSON.stringify(workflow.type.values)) {
        setWorkflow((prev) => ({
          ...prev,
          type: {
            ...prev.type,
            values: updatedValues,
          },
        }))
      }
    }
  }, [workflow.workflowType, workflow.type, setWorkflow, selectedOrmChannels])

  const [typeName, setTypeName] = useState<string>(workflow.type?.name || "Channel")
  const [typeReadOnly, setTypeReadOnly] = useState<boolean>(workflow.type?.readOnly || true)
  const [newTypeValue, setNewTypeValue] = useState<string>("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const [editableFields, setEditableFields] = useState<string[]>([])
  const [newEditableField, setNewEditableField] = useState<string>("")

  const handleTypeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypeName(e.target.value)
  }

  const saveTypeName = () => {
    setWorkflow((prev) => ({
      ...prev,
      type: {
        ...prev.type,
        name: typeName,
        readOnly: typeReadOnly,
      },
    }))
  }

  const addTypeValue = () => {
    if (!newTypeValue.trim()) return

    // Create ID without spaces, lowercase
    const typeId = newTypeValue.toLowerCase().replace(/\s+/g, "")

    const newValue: EnumValue = {
      id: typeId,
      name: newTypeValue,
    }

    setWorkflow((prev) => ({
      ...prev,
      type: {
        ...prev.type.values,
        values: [...prev.type.values, newValue],
      },
    }))

    setNewTypeValue("")
  }

  const startEditing = (index: number) => {
    setEditingIndex(index)
    setEditValue(workflow.type.values[index].name)

    // If there are editable fields for this type, load them
    const currentEditableFields = workflow.type.values[index].editableFields || []
    setEditableFields([...currentEditableFields])
  }

  const saveEditing = () => {
    if (editingIndex === null) return

    const updatedValues = [...workflow.type.values]
    // Create ID without spaces, lowercase
    const typeId = editValue.toLowerCase().replace(/\s+/g, "")

    updatedValues[editingIndex] = {
      ...updatedValues[editingIndex],
      id: typeId,
      name: editValue,
      editableFields: editableFields.length > 0 ? editableFields : undefined,
    }

    setWorkflow((prev) => ({
      ...prev,
      type: {
        ...prev.type,
        values: updatedValues,
      },
    }))

    setEditingIndex(null)
    setEditValue("")
    setEditableFields([])
  }

  const deleteTypeValue = (index: number) => {
    // Don't allow deleting the last value
    if (workflow.type.values.length <= 1) {
      alert("You must have at least one type value.")
      return
    }

    // Don't allow deleting CCM type in CCM or combined workflows
    if (
      (workflow.workflowType === "ccm" || workflow.workflowType === "combined") &&
      workflow.type.values[index].id === ccmTypeValue.id
    ) {
      alert("Cannot delete the Complaint Management Survey type in CCM workflows.")
      return
    }

    const updatedValues = [...workflow.type.values]
    updatedValues.splice(index, 1)

    setWorkflow((prev) => ({
      ...prev,
      type: {
        ...prev.type,
        values: updatedValues,
      },
    }))
  }

  const addEditableField = () => {
    if (!newEditableField.trim()) return
    setEditableFields((prev) => [...prev, newEditableField])
    setNewEditableField("")
  }

  const removeEditableField = (fieldId: string) => {
    const updatedFields = editableFields.filter((field) => field !== fieldId)
    setEditableFields(updatedFields)
  }

  const toggleOrmChannel = (channelId: string) => {
    // Update the selected channels
    let updatedChannels: string[]

    if (selectedOrmChannels.includes(channelId)) {
      // Remove channel if already selected
      updatedChannels = selectedOrmChannels.filter((id) => id !== channelId)
    } else {
      // Add channel if not selected
      updatedChannels = [...selectedOrmChannels, channelId]
    }

    setSelectedOrmChannels(updatedChannels)

    // Immediately update the workflow type values
    const selectedChannelsData = ormChannels.filter((channel) => updatedChannels.includes(channel.id))

    let newTypeValues: EnumValue[] = []

    if (workflow.workflowType === "ccm") {
      newTypeValues = [ccmTypeValue]
    } else if (workflow.workflowType === "orm") {
      newTypeValues = selectedChannelsData
    } else if (workflow.workflowType === "combined") {
      newTypeValues = [ccmTypeValue, ...selectedChannelsData]
    }

    // Update the workflow immediately
    setWorkflow((prev) => ({
      ...prev,
      type: {
        ...prev.type,
        values: newTypeValues,
      },
    }))
  }

  // Get all custom field IDs for the dropdown
  const customFieldIds = Object.keys(workflow.customFields || {})

  const renderEditableFieldsTree = (editableFields: string[]) => {
    if (!editableFields || editableFields.length === 0) {
      return <p className="text-sm text-muted-foreground">No editable fields configured.</p>
    }

    return (
      <Tree>
        {editableFields.map((fieldId) => {
          const field = workflow.customFields[fieldId]
          return (
            <TreeItem key={fieldId} id={fieldId} label={field ? field.name : fieldId}>
              <div className="flex justify-between items-center p-2 bg-background rounded">
                <span>{field ? field.name : fieldId}</span>
                <Button variant="ghost" size="sm" onClick={() => removeEditableField(fieldId)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </TreeItem>
          )
        })}
      </Tree>
    )
  }

  // Show ORM channel selection for ORM and Combined workflows
  const showOrmChannelSelection = workflow.workflowType === "orm" || workflow.workflowType === "combined"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Type Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="typeName">Type Field Name</Label>
              <TooltipHelper content="The label that will be displayed for the type field." />
            </div>
            <div className="flex space-x-2">
              <Input id="typeName" value={typeName} onChange={handleTypeNameChange} />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="typeReadOnly"
                  checked={typeReadOnly}
                  onCheckedChange={(checked) => setTypeReadOnly(checked as boolean)}
                />
                <Label htmlFor="typeReadOnly">Read Only</Label>
              </div>
              <Button onClick={saveTypeName}>Save</Button>
            </div>
          </div>

          {showOrmChannelSelection && (
            <div className="space-y-2 p-4 border rounded-md bg-muted/20">
              <div className="flex items-center">
                <Label>ORM Channels</Label>
                <TooltipHelper content="Select which online review platforms to include in your workflow." />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                {ormChannels.map((channel) => (
                  <div key={channel.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`channel-${channel.id}`}
                      checked={selectedOrmChannels.includes(channel.id)}
                      onCheckedChange={() => toggleOrmChannel(channel.id)}
                    />
                    <Label htmlFor={`channel-${channel.id}`} className="text-sm">
                      {channel.name}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Selected channels will appear as type values in your workflow.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center">
              <Label>Custom Type Values</Label>
              <TooltipHelper content="Add additional custom type values if needed." />
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add new type value"
                value={newTypeValue}
                onChange={(e) => setNewTypeValue(e.target.value)}
              />
              <Button onClick={addTypeValue}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Type Values List</Label>
            <div className="border rounded-md overflow-hidden">
              {workflow.type?.values?.length > 0 ? (
                <ul className="divide-y">
                  {workflow.type.values.map((value, index) => (
                    <li key={index} className="p-3 flex justify-between items-center">
                      {editingIndex === index ? (
                        <div className="space-y-2 w-full">
                          <div className="flex space-x-2">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1"
                            />
                            <Button onClick={saveEditing}>
                              <Check className="h-4 w-4" />
                              Save
                            </Button>
                          </div>

                          <div className="bg-muted/30 p-3 rounded">
                            <div className="mb-2">
                              <Label className="text-sm">Editable Fields When This Type Is Selected</Label>
                              <TooltipHelper content="When this type is selected, only these fields will be editable." />
                            </div>

                            <div className="flex space-x-2 mb-2">
                              <Select value={newEditableField} onValueChange={setNewEditableField}>
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                  {customFieldIds.map((id) => (
                                    <SelectItem key={id} value={id}>
                                      {workflow.customFields[id].name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button onClick={addEditableField}>
                                <Plus className="h-4 w-4" />
                                Add
                              </Button>
                            </div>

                            {renderEditableFieldsTree(editableFields)}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{value.name}</span>
                            {/* Show a badge for special types */}
                            {value.id === ccmTypeValue.id && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">CCM</span>
                            )}
                            {ormChannels.some((c) => c.id === value.id) && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">ORM</span>
                            )}
                            {value.editableFields && value.editableFields.length > 0 && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                {value.editableFields.length} editable fields
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => startEditing(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteTypeValue(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-3 text-muted-foreground text-sm">No type values configured.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TypeConfigForm
