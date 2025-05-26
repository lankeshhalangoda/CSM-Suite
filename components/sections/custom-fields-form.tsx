"use client"

import type React from "react"
import { useState } from "react"
import type { Workflow } from "@/types/workflow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, Edit, Check } from "lucide-react"
import TooltipHelper from "../ui/tooltip-helper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CustomFieldsFormProps {
  workflow: Workflow
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>
}

const CustomFieldsForm: React.FC<CustomFieldsFormProps> = ({ workflow, setWorkflow }) => {
  const [newFieldName, setNewFieldName] = useState<string>("")
  const [newFieldType, setNewFieldType] = useState<string>("string")
  const [newFieldId, setNewFieldId] = useState<string>("")
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [newDropdownOption, setNewDropdownOption] = useState<string>("")
  const [editingOptionsForField, setEditingOptionsForField] = useState<string | null>(null)

  const fieldTypes = [
    { value: "string", label: "Text" },
    { value: "enum", label: "Dropdown" },
    { value: "multiselect", label: "Multi-select" },
    { value: "textArea", label: "Text Area" },
    { value: "date", label: "Date" },
    { value: "file", label: "File Upload" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "Boolean" },
    { value: "time_accumulation", label: "Time Accumulation" },
  ]

  const addCustomField = () => {
    if (!newFieldName.trim()) {
      alert("Field name is required!")
      return
    }

    // Use the provided ID or generate one from the name
    const fieldId = newFieldId.trim() || newFieldName.toLowerCase().replace(/\s+/g, "_")

    // Check if field already exists
    if (workflow.customFields[fieldId]) {
      alert("A field with this name or ID already exists!")
      return
    }

    setWorkflow((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldId]: {
          name: newFieldName,
          type: newFieldType,
          readOnly: false,
          values: newFieldType === "enum" || newFieldType === "multiselect" ? [] : undefined,
        },
      },
    }))

    setNewFieldName("")
    setNewFieldId("")
    setNewFieldType("string")
  }

  const removeCustomField = (fieldId: string) => {
    setWorkflow((prev) => {
      const updatedCustomFields = { ...prev.customFields }
      delete updatedCustomFields[fieldId]
      return {
        ...prev,
        customFields: updatedCustomFields,
      }
    })
  }

  const toggleFieldProperty = (fieldId: string, property: "readOnly" | "required" | "hidden") => {
    setWorkflow((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldId]: {
          ...prev.customFields[fieldId],
          [property]: !prev.customFields[fieldId][property],
        },
      },
    }))
  }

  const toggleOptionsEditor = (fieldId: string) => {
    if (editingOptionsForField === fieldId) {
      setEditingOptionsForField(null)
    } else {
      setEditingOptionsForField(fieldId)
    }
  }

  const startEditingField = (fieldId: string) => {
    setEditingFieldId(fieldId)
    const field = workflow.customFields[fieldId]
    setNewFieldName(field.name)
    setNewFieldType(field.type)
    setNewFieldId(fieldId)

    // If the field is enum or multiselect, also show the options editor
    if (field.type === "enum" || field.type === "multiselect") {
      setEditingOptionsForField(fieldId)
    }
  }

  const cancelEditingField = () => {
    setEditingFieldId(null)
    setEditingOptionsForField(null)
    setNewFieldName("")
    setNewFieldType("")
    setNewFieldId("")
  }

  const saveEditedField = () => {
    if (!editingFieldId) return

    if (!newFieldName.trim()) {
      alert("Field name is required!")
      return
    }

    // Use the provided ID or keep the existing one
    const newId = newFieldId.trim()

    setWorkflow((prev) => {
      const updatedCustomFields = { ...prev.customFields }

      // If the field ID has changed, we need to create a new field and delete the old one
      if (newId !== editingFieldId) {
        // Create the new field
        updatedCustomFields[newId] = {
          name: newFieldName,
          type: newFieldType,
          required: updatedCustomFields[editingFieldId].required,
          readOnly: updatedCustomFields[editingFieldId].readOnly,
          values:
            newFieldType === "enum" || newFieldType === "multiselect"
              ? updatedCustomFields[editingFieldId].values
              : undefined,
          hidden: updatedCustomFields[editingFieldId].hidden,
        }

        // Delete the old field
        delete updatedCustomFields[editingFieldId]
      } else {
        // Just update the existing field
        updatedCustomFields[newId] = {
          ...updatedCustomFields[newId],
          name: newFieldName,
          type: newFieldType,
          values:
            newFieldType === "enum" || newFieldType === "multiselect" ? updatedCustomFields[newId].values : undefined,
        }
      }

      return {
        ...prev,
        customFields: updatedCustomFields,
      }
    })

    setEditingFieldId(null)
    setEditingOptionsForField(null)
    setNewFieldName("")
    setNewFieldType("")
    setNewFieldId("")
  }

  const addDropdownOption = (fieldId: string) => {
    if (!newDropdownOption.trim()) {
      alert("Option name is required!")
      return
    }

    const optionId = newDropdownOption.trim()
    const field = workflow.customFields[fieldId]

    // Check if option already exists
    if (field.values && field.values.some((v) => v.id === newDropdownOption.trim())) {
      alert("This option already exists!")
      return
    }

    setWorkflow((prev) => {
      const field = prev.customFields[fieldId]
      const values = field.values || []

      return {
        ...prev,
        customFields: {
          ...prev.customFields,
          [fieldId]: {
            ...field,
            values: [...values, { id: newDropdownOption.trim(), name: newDropdownOption.trim() }],
          },
        },
      }
    })

    setNewDropdownOption("")
  }

  const removeDropdownOption = (fieldId: string, optionId: string) => {
    setWorkflow((prev) => {
      const field = prev.customFields[fieldId]
      return {
        ...prev,
        customFields: {
          ...prev.customFields,
          [fieldId]: {
            ...field,
            values: field.values.filter((v) => v.id !== optionId),
          },
        },
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="newFieldName">Field Name</Label>
                <TooltipHelper content="The name of the custom field as it will appear in the UI." />
              </div>
              <Input
                id="newFieldName"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="Enter field name"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="newFieldType">Field Type</Label>
                <TooltipHelper content="The type of data this field will store." />
              </div>
              <Select value={newFieldType} onValueChange={setNewFieldType}>
                <SelectTrigger id="newFieldType">
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={addCustomField} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Field
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Custom Fields List</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Read Only</TableHead>
                  <TableHead>Hidden</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(workflow.customFields).map(([fieldId, field]) => (
                  <TableRow key={fieldId}>
                    <TableCell>{field.name}</TableCell>
                    <TableCell>{field.type}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={field.required || false}
                        onCheckedChange={() => toggleFieldProperty(fieldId, "required")}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={field.readOnly || false}
                        onCheckedChange={() => toggleFieldProperty(fieldId, "readOnly")}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={field.hidden || false}
                        onCheckedChange={() => toggleFieldProperty(fieldId, "hidden")}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => startEditingField(fieldId)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {(field.type === "enum" || field.type === "multiselect") && (
                          <Button variant="ghost" size="sm" onClick={() => toggleOptionsEditor(fieldId)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => removeCustomField(fieldId)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {editingFieldId && (
            <div className="border p-4 rounded-md space-y-4">
              <h4 className="font-medium">Edit Field</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFieldName">Field Name</Label>
                  <Input id="editFieldName" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editFieldType">Field Type</Label>
                  <Select value={newFieldType} onValueChange={setNewFieldType}>
                    <SelectTrigger id="editFieldType">
                      <SelectValue placeholder="Select field type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={cancelEditingField}>
                  Cancel
                </Button>
                <Button onClick={saveEditedField}>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* Dropdown options editor for enum and multiselect fields */}
          {Object.entries(workflow.customFields)
            .filter(
              ([fieldId, field]) =>
                (field.type === "enum" || field.type === "multiselect") && editingOptionsForField === fieldId,
            )
            .map(([fieldId, field]) => (
              <div key={`options-${fieldId}`} className="border p-4 rounded-md space-y-4">
                <h4 className="font-medium">Options for {field.name}</h4>
                <div className="flex space-x-2">
                  <Input
                    placeholder="New option name"
                    value={newDropdownOption}
                    onChange={(e) => setNewDropdownOption(e.target.value)}
                  />
                  <Button onClick={() => addDropdownOption(fieldId)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Option Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {field.values?.map((option) => (
                      <TableRow key={option.id}>
                        <TableCell>{option.name}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => removeDropdownOption(fieldId, option.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default CustomFieldsForm
